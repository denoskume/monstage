"""Validate individual employer SuccessFactors job pages before MonStage ingestion.

The source-discovery artifact is only a queue of leads. Nothing is imported
until the CI runner fetches the actual official job detail, sees a matching
internship title and finds country=FR in structured job location or a clearly
labelled location field. Unknown dates/starts remain unknown.
"""
from datetime import datetime, timezone
from hashlib import sha256
from html.parser import HTMLParser
import html
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request

from discover_official_jobs import candidate_plans
from ingest_public_ats import ingest

ROOT = Path(__file__).resolve().parents[2]
DISCOVERED = ROOT / "artifacts" / "career-successfactors-leads.json"
OUTPUT = ROOT / "artifacts" / "career-verified-official-jobs.json"

SOURCES = {
    "Alstom": ("alstom", "jobsearch.alstom.com"),
    "Nestlé": ("nestle", "jobdetails.nestle.com"),
    "Lactalis": ("lactalis", "jobs.lactalisexperience.fr"),
    "Bel Group": ("bel", "jobs.groupe-bel.com"),
    "EssilorLuxottica": ("essilor", "careers.essilorluxottica.com"),
    "ENGIE": ("engie", "jobs.engie.com"),
    "FORVIA HELLA": ("forvia", "jobs.faurecia.com"),
}
MONTHS = {
    "jan": 1, "janvier": 1, "january": 1, "feb": 2, "fev": 2, "fevrier": 2,
    "february": 2, "mar": 3, "mars": 3, "march": 3, "apr": 4, "avril": 4,
    "april": 4, "may": 5, "mai": 5, "jun": 6, "juin": 6, "june": 6,
    "jul": 7, "juillet": 7, "july": 7, "aug": 8, "aout": 8, "august": 8,
    "sep": 9, "sept": 9, "septembre": 9, "september": 9, "oct": 10,
    "octobre": 10, "october": 10, "nov": 11, "novembre": 11,
    "november": 11, "dec": 12, "decembre": 12, "december": 12,
}


def normalized(value):
    import unicodedata
    return re.sub(r"\s+", " ", unicodedata.normalize("NFKD", str(value or "")).encode(
        "ascii", "ignore").decode("ascii").lower()).strip()


class JobHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.h1_depth = 0
        self.ld_depth = 0
        self.skip_depth = 0
        self.h1 = []
        self.content = []
        self.ld_scripts = []
        self._script = []
        self.meta = {}

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        if tag == "h1":
            self.h1_depth += 1
        elif tag == "script" and "ld+json" in props.get("type", "").lower():
            self.ld_depth += 1
            self._script = []
        elif tag in ("script", "style", "noscript"):
            self.skip_depth += 1
        if tag == "meta":
            name = (props.get("property") or props.get("name") or "").lower()
            if name:
                self.meta[name] = props.get("content", "")

    def handle_endtag(self, tag):
        if tag == "h1":
            self.h1_depth = max(0, self.h1_depth - 1)
        elif tag == "script" and self.ld_depth:
            self.ld_scripts.append("".join(self._script))
            self._script = []
            self.ld_depth = 0
        elif tag in ("script", "style", "noscript"):
            self.skip_depth = max(0, self.skip_depth - 1)

    def handle_data(self, data):
        if self.ld_depth:
            self._script.append(data)
        elif not self.skip_depth:
            s = " ".join(data.split())
            if s:
                if self.h1_depth:
                    self.h1.append(s)
                self.content.append(s)


def job_postings(value):
    if isinstance(value, list):
        for item in value:
            yield from job_postings(item)
    elif isinstance(value, dict):
        types = value.get("@type", [])
        if isinstance(types, str):
            types = [types]
        if "JobPosting" in types:
            yield value
        for sub in value.values():
            if isinstance(sub, (dict, list)):
                yield from job_postings(sub)


def is_official_url(company, url):
    config = SOURCES.get(company)
    if not config:
        return False
    parsed = urllib.parse.urlparse(url)
    return (parsed.scheme == "https" and
            (parsed.hostname or "").lower() == config[1] and
            re.search(r"/(?:job|jobdetails)/[^/?]+", parsed.path, re.I) is not None)


def parse_official_date(raw):
    value = str(raw or "").strip()
    if not value:
        return None
    if re.match(r"^\d{4}-\d{2}-\d{2}(?:$|T)", value):
        try:
            date = datetime.strptime(value[:10], "%Y-%m-%d").date()
            return date.isoformat() if date <= datetime.now(timezone.utc).date() else None
        except ValueError:
            return None
    m = re.search(r"\b(\d{1,2})\s+([a-zA-Zéèêûôûä]+)\.?\s+(20\d{2})\b", value)
    if not m:
        return None
    month = MONTHS.get(normalized(m.group(2)))
    if not month:
        return None
    try:
        date = datetime(int(m.group(3)), month, int(m.group(1))).date()
        return date.isoformat() if date <= datetime.now(timezone.utc).date() else None
    except ValueError:
        return None


def structured_location(posting):
    locations = posting.get("jobLocation")
    if isinstance(locations, dict):
        locations = [locations]
    for loc in locations or []:
        if not isinstance(loc, dict):
            continue
        address = loc.get("address") or {}
        if not isinstance(address, dict):
            continue
        country = address.get("addressCountry") or ""
        if isinstance(country, dict):
            country = country.get("name") or ""
        if normalized(country) not in ("fr", "france"):
            continue
        city = str(address.get("addressLocality") or "").strip()
        return (city + ", France") if city else "France"
    return None


def labelled_france_location(text):
    # Do not accept a footer, broad 'jobs in France' phrase or guess a city.
    match = re.search(
        r"\b(?:Location|Lieu|Emplacement)\s*:\s*"
        r"([A-Za-zÀ-ÿ0-9.()' -]{2,70},\s*(?:[A-Za-z0-9 -]{1,20},\s*)?(?:FR|France))\b",
        text, re.I)
    return match.group(1).strip() if match else None


def verified_job(company, requested_url, doc, final_url=None):
    final_url = final_url or requested_url
    if not is_official_url(company, requested_url) or not is_official_url(company, final_url):
        return None
    parsed = JobHTML()
    parsed.feed(doc.decode("utf-8", "replace") if isinstance(doc, bytes) else doc)
    visible = " ".join(parsed.content)
    h1 = " ".join(parsed.h1).strip()
    structured = []
    for script in parsed.ld_scripts:
        try:
            structured.extend(job_postings(json.loads(html.unescape(script))))
        except (ValueError, TypeError):
            pass

    for posting in (structured or [{}]):
        title = re.sub(r"\s+", " ", str(posting.get("title") or h1)).strip()
        if not title or not candidate_plans(title):
            continue
        # Prefer an actual H1 matching the structured title; avoid stale page
        # redirects that render an unrelated vacancy under the requested URL.
        if h1 and title and normalized(title) not in normalized(h1) and normalized(h1) not in normalized(title):
            continue
        location = structured_location(posting) or labelled_france_location(visible)
        if not location:
            continue
        published = parse_official_date(posting.get("datePosted"))
        if not published:
            date_label = re.search(r"\b(?:Date|Publié le|Publication)\s*:\s*(\d{1,2}\s+[A-Za-zéèêûôä]+\.?\s+20\d{2})", visible, re.I)
            if date_label:
                published = parse_official_date(date_label.group(1))
        canonical = final_url.split("#", 1)[0].split("?", 1)[0]
        description = str(posting.get("description") or parsed.meta.get("description") or title)
        return {
            "id": sha256(canonical.encode("utf-8")).hexdigest()[:20],
            "url": canonical,
            "title": title[:250],
            "location": location[:180],
            "description": re.sub(r"<[^>]+>", " ", description)[:4000],
            "publishedAt": published,
        }
    return None


def fetch_verified(company, url):
    if not is_official_url(company, url):
        return None
    req = urllib.request.Request(url, headers={
        "Accept": "text/html,application/xhtml+xml",
        "User-Agent": "Mozilla/5.0",
    })
    with urllib.request.urlopen(req, timeout=25) as resp:
        if resp.status != 200:
            return None
        actual = resp.geturl()
        if not is_official_url(company, actual):
            return None
        body = resp.read(1_500_000)
    return verified_job(company, url, body, actual)


def main():
    if not DISCOVERED.exists():
        raise SystemExit("Missing discovery artifact: official jobs cannot be assumed")
    data = json.loads(DISCOVERED.read_text(encoding="utf-8"))
    accepted, verified, errors = 0, 0, []
    sources = {}
    for item in data.get("companies", []):
        company = item.get("company")
        if company not in SOURCES:
            continue
        source_id, _ = SOURCES[company]
        jobs, seen = [], set()
        for lead in item.get("leads", []):
            url = str(lead.get("official_job_url") or "")
            if not is_official_url(company, url) or url in seen:
                continue
            seen.add(url)
            try:
                job = fetch_verified(company, url)
                if job:
                    jobs.append(job)
            except (OSError, ValueError) as exc:
                errors.append(f"{company}: {type(exc).__name__}")
        verified += len(jobs)
        if jobs:
            try:
                accepted += ingest("officialPage", source_id, jobs)
            except Exception as exc:
                errors.append(f"{company} import: {str(exc)[:120]}")
        sources[company] = {
            "candidate_leads": len(item.get("leads", [])),
            "verified_details": len(jobs),
            "import_submitted": bool(jobs),
        }
        print("Official individual pages:", company, "verified", len(jobs))
    OUTPUT.parent.mkdir(exist_ok=True)
    OUTPUT.write_text(json.dumps({
        "companies": sources, "verified_details": verified,
        "backend_accepted": accepted, "errors": errors[:15],
        "note": "Only official individual job pages confirmed in France. Unknown start dates are not inferred.",
    }, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("Official page ingestion verified", verified, "accepted", accepted, "warnings", len(errors))
    if any(" import:" in error for error in errors):
        raise SystemExit("Verified official vacancy import incomplete")


if __name__ == "__main__":
    main()
