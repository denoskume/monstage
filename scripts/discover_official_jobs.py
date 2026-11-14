"""Find individual internship leads on each target employer's public career pages.

This adapter is NOT a substitute for an employer-specific ATS feed. Discoveries
must be revalidated against an individual official job page before alerting or
writing to the canonical MonStage offers table.
"""
from html.parser import HTMLParser
import re
import urllib.parse
import unicodedata

# These employer domains were observed on the canonical official job URLs.
ALLOWED_JOB_DOMAINS = {
    "Nestlé": ("nestle.com", "nestle.fr"),
    "Air France-KLM": ("airfrance.com",),
    "Alstom": ("alstom.com",),
    "Safran": ("safran-group.com",),
    "Saint-Gobain": ("saint-gobain.com",),
    "EDF": ("edf.fr",),
    "Lactalis": ("lactalisexperience.fr",),
    "Danone": ("danone.com",),
    "GE HealthCare": ("gehealthcare.com",),
    "EssilorLuxottica": ("essilorluxottica.com",),
    "SNCF": ("sncf.com",),
    "Veolia": ("veolia.com", "smartrecruiters.com"),
}
# URLs must look like individual job records; company and search landing pages
# are excluded, even if their headings contain internship keywords.
INDIVIDUAL_PATH = re.compile(
    r"/(?:fr/)?(?:offres/(?:france/)?[^/?]+|job/[^/?]+|jobs/[^/?]+|"
    r"jobdetails/[^/?]+|offre/detail/[^/?]+|nos-offres/\\d+|"
    r"fr-fr/emplois/[^/?]+|emploi/[^/?]+/[^/?]+)", re.I
)
INTERNSHIP = re.compile(r"\b(stage|stagiaire|internship|intern|pfe)\b", re.I)
PLAN_TERMS = {
    "A": re.compile(
        r"vision|traitement.{0,12}image|imagerie|image processing|"
        r"computer vision|maintenance predict|maintenance pr[eé]dict|"
        r"machine learning|apprentissage automatique|deep learning|"
        r"inspection automat|perception|lidar", re.I
    ),
    "B": re.compile(
        r"data|analyst|analyse de donn|business intelligence|"
        r"power ?bi|reporting|tableau.{0,5}bord|"
        r"performance industrielle|maintenance.{0,20}donn", re.I
    ),
}
NEGATIVE = re.compile(r"controle de gestion|contr[oô]le de gestion|"
                      r"finance|financial|bancaire|accounting|"
                      r"data scientist|ing[eé]nieur data engineer", re.I)


def hostname_allowed(company, hostname):
    valid = (company["domain"],) + ALLOWED_JOB_DOMAINS.get(company["name"], ())
    host = (hostname or "").lower()
    return any(host == d or host.endswith("." + d) for d in valid)


def candidate_plans(text):
    if not INTERNSHIP.search(text) or NEGATIVE.search(text):
        return []
    return [plan for plan, terms in PLAN_TERMS.items() if terms.search(text)]


class _LinkParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "a":
            return
        properties = dict(attrs)
        href = properties.get("href") or ""
        self.stack.append({"href": href, "parts": [], "aria": properties.get("aria-label", "")})

    def handle_data(self, data):
        for anchor in self.stack:
            anchor["parts"].append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self.stack:
            anchor = self.stack.pop()
            title = " ".join(" ".join(anchor["parts"] + [anchor["aria"]]).split())
            self.links.append((anchor["href"], title))


def extract_official_jobs(company, page_url, html):
    """Extract probable official internship links, never mark them verified."""
    parser = _LinkParser()
    parser.feed(html.decode("utf-8", "replace") if isinstance(html, bytes) else html)
    leads = []
    seen = set()
    for href, title in parser.links:
        url = urllib.parse.urljoin(page_url, href)
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme != "https" or not hostname_allowed(company, parsed.hostname):
            continue
        if not INDIVIDUAL_PATH.search(parsed.path):
            continue
        # A precise job URL with a title that says "stage" is evidence for
        # discovery, not evidence of an open application or valid start month.
        plans = candidate_plans(title)
        for plan in plans:
            key = (plan, parsed.scheme, parsed.netloc.lower(), parsed.path)
            if key in seen:
                continue
            seen.add(key)
            leads.append({
                "company": company["name"],
                "plan": plan,
                "title": title[:200],
                "official_job_url": urllib.parse.urlunparse(
                    (parsed.scheme, parsed.netloc, parsed.path, "", parsed.query, "")
                ),
                "source": "official_career_page",
                "status": "REVALIDATION_REQUIRED",
                "published_at": None,
                "start_date": None,
            })
    return leads


def dedupe_official_leads(leads):
    output, seen = [], set()
    for item in leads:
        key = (item["company"], item["plan"], item["official_job_url"].split("?")[0])
        if key not in seen:
            output.append(item)
            seen.add(key)
    return output
