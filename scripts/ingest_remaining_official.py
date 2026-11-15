"""Discover, re-fetch and qualify official job detail pages for the 13 uncovered groups.

This is a bounded employer-domain crawler, not a search engine or a claim of
exhaustive ATS coverage. Each listing must be re-read as an individual official
vacancy; only internship titles relevant to Plan A/B and explicitly French
locations may reach the authenticated Apps Script gateway.
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

from discover_official_jobs import candidate_plans, _LinkParser
from ingest_public_ats import ingest, fetch_json_with_backoff
from ingest_successfactors import JobHTML, job_postings, structured_location, labelled_france_location, normalized, parse_official_date

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "scripts" / "remaining_official_sources.json"
OUTPUT = ROOT / "artifacts" / "career-remaining-13-verified.json"
USER_AGENT = "Mozilla/5.0 (compatible; MonStageOfficialInternships/1.0)"
MAX_LISTING_LINKS = 25


def source_matches(source, url):
    """An exact, allowlisted HTTPS hostname and a genuine individual job path."""
    parsed = urllib.parse.urlparse(str(url or ""))
    if parsed.scheme != "https" or (parsed.hostname or "").lower() != source["host"]:
        return False
    if not re.search(source["path"], parsed.path, flags=re.I):
        return False
    if source["id"] in ("airfrance", "dassault") and parsed.path.lower().endswith("/detailoffre.aspx"):
        return re.search(r"(?:^|&)idOffre=\d+(?:&|$)", parsed.query, flags=re.I) is not None
    return True


def listing_matches(source, url):
    parsed = urllib.parse.urlparse(str(url or ""))
    return parsed.scheme == "https" and (parsed.hostname or "").lower() == source["host"]


def canonical_url(source, url):
    parsed = urllib.parse.urlparse(url)
    if source["id"] in ("airfrance", "dassault") and parsed.path.lower().endswith("/detailoffre.aspx"):
        offer = urllib.parse.parse_qs(parsed.query).get("idOffre", [None])[0]
        if not offer or not offer.isdigit():
            return None
        # Stable identity, independent from session, language or referrer args.
        return f"https://{source['host']}{parsed.path}?idOffre={offer}"
    if source["id"] == "dassault":
        match = re.search(r"_(\d+)\.aspx$", parsed.path, re.I)
        if match:
            return f"https://{source['host']}/Pages/Offre/detailoffre.aspx?idOffre={match.group(1)}"
        return None
    return urllib.parse.urlunparse(("https", source["host"], parsed.path.rstrip("/"), "", "", ""))


def fetch_html(url, timeout=25):
    req = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml"
    })
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                if resp.status != 200:
                    raise RuntimeError("HTTP " + str(resp.status))
                return resp.geturl(), resp.read(1_200_000).decode("utf-8", "replace")
        except urllib.error.HTTPError as exc:
            if exc.code not in (429, 503, 502, 504) or attempt == 2:
                raise
            try:
                seconds = max(1, min(12, int(exc.headers.get("Retry-After", "2"))))
            except (ValueError, TypeError):
                seconds = 2 * (attempt + 1)
            time.sleep(seconds)
    raise RuntimeError("HTML request retries exhausted")


def extract_listing_links(source, url, page):
    """Extract actual job URLs, never search-result text or landing links."""
    parser = _LinkParser()
    parser.feed(page)
    results, seen = [], set()
    for href, label in parser.links:
        job_url = urllib.parse.urljoin(url, href)
        if not source_matches(source, job_url):
            continue
        plan = candidate_plans(label) or candidate_plans(urllib.parse.unquote(
            urllib.parse.urlparse(job_url).path).replace("-", " "))
        if not plan:
            continue
        cid = canonical_url(source, job_url)
        if not cid or cid in seen:
            continue
        seen.add(cid)
        results.append(job_url)
    return results


def extract_rss_job_links(source, feed_url, document):
    """Trust only real RSS item links on the employer-authorized exact host.

    The Talentsoft official page publishes stage-contract RSS (4161). Titles
    without 'stage' are still candidates here, because that contract filter
    is authoritative; detail-page validation is mandatory before saving.
    """
    if source["id"] != "dassault" or not (
        feed_url.startswith("https://dassault-aviation-cand.talent-soft.com/handlers/offerRss.ashx?")
        and "Rss_Contract=4161" in feed_url
    ):
        return []
    root = ET.fromstring(document)
    seen, links = set(), []
    for item in root.findall(".//item")[:120]:
        url = (item.findtext("link") or "").strip()
        if not source_matches(source, url):
            continue
        identifier = canonical_url(source, url)
        if identifier and identifier not in seen:
            seen.add(identifier)
            links.append(url)
    return links


def visible_location(parsed, company):
    text = " ".join(parsed.content)
    # Phenom/Recruitment-style pages (Sanofi, L'Oréal) commonly show
    # 'Gentilly, France' immediately after the job H1, not at the start of
    # the HTML. Search near the *actual posting heading*, not the footer.
    headline = " ".join(parsed.h1).strip()
    heading_index = text.find(headline) if headline else -1
    if heading_index >= 0:
        near_job = text[heading_index + len(headline):heading_index + len(headline) + 460]
        place = re.search(r"\b([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'()\- ]{1,44}),\s*France\b", near_job, re.I)
        if place:
            return place.group(1).strip() + ", France"
    # Prefer structured JobPosting location. These page-header patterns are
    # deliberately narrow, to avoid treating footer office addresses as jobs.
    label = labelled_france_location(text[:1800])
    if label:
        return label.replace(", FR", ", France")
    header = text[:1100]
    label = re.search(r"\b(?:Site|Localisation|Lieu|Location|Pays / Région)\s*:\s*"
                      r"([A-Za-zÀ-ÿ0-9()'. -]{2,65},\s*(?:(?:Île-de-France|France),\s*)?(?:FR|France))\b",
                      header, re.I)
    if label:
        return label.group(1).replace(", FR", ", France")
    # Some ATS detail cards put the city and France immediately under the H1,
    # without labels (e.g. 'Paris, France Apprentice/Intern').
    early = re.search(
        r"\b([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'()\- ]{2,47}),\s*France\b",
        header, re.I)
    if early:
        return early.group(1).strip() + ", France"
    if re.search(r"\b(?:Pays\s*/\s*Région|Country|Pays)\s*:\s*France\b", header, re.I):
        return "France"
    if company in ("Dassault Aviation", "Air France-KLM"):
        # Talentsoft shows "Localisation France, PACA, 13 - Istres" deep below
        # login/navigation UI, not in the first 1,100 visible characters.
        area = re.search(
            r"\bLocalisation\s+France\s*,\s*"
            r"[^,]{2,55},\s*(?:\d{2,3})\s*-\s*"
            r"([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'() -]{1,65})\b",
            text, re.I
        )
        if area:
            city = area.group(1).strip()
            # The next metadata key bounds the city even in flattened HTML.
            city = re.split(r"\s+(?:Domaine professionnel|Type de contrat|Niveau du stage)\b",
                            city, maxsplit=1)[0].strip()
            if city:
                return city + ", France"
    return None


def publication_from_page(parsed, posting):
    validated = parse_official_date(posting.get("datePosted"))
    if validated:
        return validated
    text = " ".join(parsed.content)[:2800]
    iso = re.search(r"\b(?:Publication|Publié le|Mis en ligne le|Date de publication|Date Posted|Posté le)\s*:"
                    r"?\s*(\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4}|\d{1,2}\s+[A-Za-zÀ-ÿ]+\.?\s+20\d{2})", text, re.I)
    if not iso:
        return None
    raw = iso.group(1)
    if re.match(r"\d{2}/\d{2}/\d{4}", raw):
        try:
            day, month, year = (int(v) for v in raw.split("/"))
            if re.search(r"(?:Date Posted|Posted)", text[max(0, iso.start()-20):iso.start()+20], re.I):
                month, day = day, month
            date = datetime(year, month, day).date()
            return date.isoformat() if date <= datetime.now(timezone.utc).date() else None
        except ValueError:
            return None
    return parse_official_date(raw)


def verify_html(source, requested, content, resolved=None):
    resolved = resolved or requested
    if not source_matches(source, requested) or not source_matches(source, resolved):
        return None
    parsed = JobHTML()
    # Header navigation and footer office addresses are not job locations.
    # Exclude them before extracting the H1-adjacent workplace; otherwise a
    # footer "Paris, France" can make a US job appear eligible.
    document = content.decode("utf-8", "replace") if isinstance(content, bytes) else content
    document = re.sub(r"<(?:nav|footer)\b[^>]*>.*?</(?:nav|footer)\s*>",
                      "", document, flags=re.I | re.S)
    parsed.feed(document)
    headline = " ".join(parsed.h1).strip()
    structured = []
    for raw in parsed.ld_scripts:
        try:
            structured.extend(job_postings(json.loads(html.unescape(raw))))
        except (ValueError, TypeError):
            pass
    for posting in (structured or [{}]):
        title = re.sub(r"\s+", " ", str(posting.get("title") or headline)).strip()
        body = " ".join(parsed.content)[:10000]
        if source["id"] == "dassault":
            # Talentsoft sometimes omits "Stage" from the H1 although the
            # employer detail explicitly states "Type de contrat Stage".
            stage_contract = re.search(r"\bType de contrat\s*:?\s*Stage\b", body, re.I)
            if not stage_contract:
                continue
            if not re.search(r"\b(stage|stagiaire|internship|intern|pfe)\b", title, re.I):
                title = "Stage - " + title
            relevant = bool(candidate_plans(title)) or bool(
                re.search(r"\b(?:intelligence artificielle|mod[eè]les? d[' ]IA)\b",
                          title, re.I) and
                re.search(r"\b(?:machine learning|apprentissage automatique|"
                          r"maintenance a[eé]ronautique|RAG|LLM)\b", body, re.I)
            )
        else:
            relevant = bool(candidate_plans(title))
        if not title or not relevant:
            continue
        if headline and normalized(title) not in normalized(headline) and normalized(headline) not in normalized(title):
            # The explicit 'Stage -' prefix above must not break H1 matching.
            if normalized(title).replace("stage ", "", 1) not in normalized(headline):
                continue
        if source.get("entity") and not any(normalized(name) in normalized(body)
                                            for name in source["entity"]):
            continue
        location = structured_location(posting) or visible_location(parsed, source["company"])
        if not location:
            continue
        identity = canonical_url(source, resolved)
        if not identity:
            continue
        description = str(posting.get("description") or parsed.meta.get("description") or body[:3200] or title)
        return {
            "id": sha256(identity.encode("utf-8")).hexdigest()[:20],
            "url": resolved,
            "title": title[:250],
            "location": location[:180],
            "description": re.sub(r"<[^>]+>", " ", description)[:4000],
            "publishedAt": publication_from_page(parsed, posting),
        }
    return None


def verify_live(source, url):
    if not source_matches(source, url):
        return None
    final, html_text = fetch_html(url)
    return verify_html(source, url, html_text, final)


def collect(source):
    seen, urls, errors = set(), [], []
    # Verified explicit URLs are visited even when the listing page is blocked.
    for url in source["seed"]:
        cid = canonical_url(source, url) if source_matches(source, url) else None
        if cid and cid not in seen:
            seen.add(cid)
            urls.append(url)
    reached = 0
    rss_reached = 0
    for feed in source.get("rss", []):
        if not listing_matches(source, feed):
            errors.append("RSS host mismatch")
            continue
        try:
            resolved, feed_xml = fetch_html(feed)
            if not listing_matches(source, resolved):
                errors.append("RSS redirected outside employer host")
                continue
            feed_links = extract_rss_job_links(source, feed, feed_xml)
            rss_reached += 1
            for job_url in feed_links:
                cid = canonical_url(source, job_url)
                if cid and cid not in seen and len(urls) < MAX_LISTING_LINKS + len(source["seed"]):
                    seen.add(cid)
                    urls.append(job_url)
        except (ET.ParseError, OSError, RuntimeError, ValueError) as exc:
            errors.append("RSS: " + type(exc).__name__)
    for page in source["listing"]:
        if not listing_matches(source, page):
            errors.append("Listing host mismatch")
            continue
        try:
            resolved, content = fetch_html(page)
            if not listing_matches(source, resolved):
                errors.append("Listing cross-domain redirect")
                continue
            reached += 1
            for job_url in extract_listing_links(source, resolved, content):
                cid = canonical_url(source, job_url)
                if cid and cid not in seen and len(urls) < MAX_LISTING_LINKS + len(source["seed"]):
                    seen.add(cid)
                    urls.append(job_url)
        except (OSError, RuntimeError, ValueError) as exc:
            errors.append("Listing: " + type(exc).__name__)
    candidates = urls[:MAX_LISTING_LINKS + len(source["seed"])]
    results = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(verify_live, source, url): url for url in candidates}
        for future in as_completed(futures):
            try:
                value = future.result()
                if value:
                    results.append(value)
            except (OSError, RuntimeError, ValueError) as exc:
                errors.append("Detail: " + type(exc).__name__)
    return {
        "company": source["company"], "source_id": source["id"],
        "listing_pages_reachable": reached, "listing_pages_attempted": len(source["listing"]),
        "rss_feeds_reachable": rss_reached, "rss_feeds_attempted": len(source.get("rss", [])),
        "individual_job_urls": len(candidates), "verified_fr_internships": len(results),
        "errors": errors[:18], "jobs": results,
    }


def main():
    sources = json.loads(CONFIG.read_text(encoding="utf-8"))["sources"]
    if len(sources) != 13 or len({s["company"] for s in sources}) != 13:
        raise SystemExit("Expected exactly thirteen formerly unintegrated target groups")
    results, errors = [], []
    # Bound concurrency: respect the source sites and GitHub Actions runtime.
    with ThreadPoolExecutor(max_workers=3) as pool:
        futures = {pool.submit(collect, source): source for source in sources}
        for future in as_completed(futures):
            source = futures[future]
            try:
                data = future.result()
            except Exception as exc:
                data = {"company": source["company"], "source_id": source["id"],
                        "listing_pages_reachable": 0, "listing_pages_attempted": len(source["listing"]),
                        "individual_job_urls": 0, "verified_fr_internships": 0,
                        "rss_feeds_reachable": 0, "rss_feeds_attempted": len(source.get("rss", [])),
                        "errors": ["Fatal " + type(exc).__name__], "jobs": []}
            if data["jobs"]:
                try:
                    data["backend_accepted"] = ingest("officialPage", source["id"], data["jobs"])
                except Exception as exc:
                    errors.append(source["company"] + ": " + type(exc).__name__ + " / " + str(exc)[:95])
                    data["backend_accepted"] = 0
            else:
                data["backend_accepted"] = 0
            print("Remaining 13 source", data["company"], "pages",
                  data["listing_pages_reachable"], "/", data["listing_pages_attempted"],
                  "RSS", data.get("rss_feeds_reachable", 0),
                  "/", data.get("rss_feeds_attempted", 0),
                  "individual job URLs", data["individual_job_urls"],
                  "verified", data["verified_fr_internships"],
                  "accepted", data["backend_accepted"],
                  "warnings", len(data["errors"]))
            results.append(data)
    results.sort(key=lambda item: item["company"].lower())
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps({
        "sources_attempted": len(results),
        "sources_with_listing_pages_reachable": sum(i["listing_pages_reachable"] > 0 for i in results),
        "sources_with_individual_job_pages_verified": sum(i["verified_fr_internships"] > 0 for i in results),
        "official_rss_feeds_reachable": sum(i.get("rss_feeds_reachable", 0) for i in results),
        "verified_job_details": sum(i["verified_fr_internships"] for i in results),
        "accepted_by_backend": sum(i["backend_accepted"] for i in results),
        "errors": errors,
        "coverage_note": "Each listing page is checked but this is not an exhaustive ATS feed. Blocked or empty sources remain unverified.",
        "sources": [{k:v for k,v in data.items() if k != "jobs"} for data in results],
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Remaining 13 verified details", sum(i["verified_fr_internships"] for i in results),
          "backend accepted", sum(i["backend_accepted"] for i in results),
          "import errors", len(errors))
    if errors:
        raise SystemExit("Some remaining-source verified vacancy imports failed: " + "; ".join(errors[:4]))


if __name__ == "__main__":
    main()
