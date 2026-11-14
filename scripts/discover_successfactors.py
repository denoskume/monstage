"""Read-only probes for official SuccessFactors recruiting sites.

ATS platforms often require a client-rendered session. HTTP 200 does NOT mean
vacancies were actually discovered. Only individual canonical employer URLs
are emitted, and still require detail/start-date validation before integration.
"""
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import urllib.parse
import urllib.request

from discover_official_jobs import extract_official_jobs, dedupe_official_leads

OUTPUT = Path(__file__).resolve().parent.parent / "artifacts" / "career-successfactors-leads.json"
SITES = [
    {"name": "Alstom", "domain": "alstom.com", "base": "https://jobsearch.alstom.com"},
    {"name": "Nestlé", "domain": "nestle.fr", "base": "https://jobdetails.nestle.com"},
    {"name": "Lactalis", "domain": "lactalisexperience.fr", "base": "https://jobs.lactalisexperience.fr"},
    {"name": "Bel Group", "domain": "groupe-bel.com", "base": "https://jobs.groupe-bel.com"},
    {"name": "EssilorLuxottica", "domain": "essilorluxottica.com", "base": "https://careers.essilorluxottica.com"},
    {"name": "ENGIE", "domain": "engie.com", "base": "https://jobs.engie.com"},
    {"name": "FORVIA HELLA", "domain": "faurecia.com", "base": "https://jobs.faurecia.com"},
]
QUERIES = ("stage", "stage data", "stage power bi", "stage vision")


def probe(company, phrase):
    query = urllib.parse.urlencode({"q": phrase, "locale": "fr_FR"})
    url = company["base"] + "/search/?" + query
    request = urllib.request.Request(
        url, headers={"User-Agent": "Mozilla/5.0",
                      "Accept": "text/html,application/xhtml+xml"})
    with urllib.request.urlopen(request, timeout=22) as response:
        if not 200 <= response.status < 400:
            raise RuntimeError("HTTP status " + str(response.status))
        target = response.geturl()
        html = response.read(1_500_000)
    return url, len(html), extract_official_jobs(company, target, html)


def collect(company):
    found, results = [], []
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(probe, company, phrase): phrase for phrase in QUERIES}
        for future in as_completed(futures):
            term = futures[future]
            try:
                url, bytes_read, leads = future.result()
                found.extend(leads)
                results.append({
                    "term": term, "url": url, "reachable": True,
                    "bytes_read": bytes_read, "leads": len(leads), "error": None,
                })
            except Exception as exc:
                results.append({
                    "term": term, "url": None, "reachable": False,
                    "bytes_read": 0, "leads": 0, "error": str(exc)[:150],
                })
    deduped = dedupe_official_leads(found)
    return {
        "company": company["name"], "official_ats": company["base"],
        "queries_reachable": sum(bool(r["reachable"]) for r in results),
        "queries_attempted": len(QUERIES),
        "individual_leads": len(deduped),
        "results": sorted(results, key=lambda x: x["term"]),
        "leads": deduped[:150],
    }


def main():
    with ThreadPoolExecutor(max_workers=7) as pool:
        results = list(pool.map(collect, SITES))
    OUTPUT.parent.mkdir(exist_ok=True)
    data = {
        "groups_attempted": len(SITES),
        "groups_ats_page_reachable": sum(x["queries_reachable"] > 0 for x in results),
        "groups_with_individual_leads": sum(x["individual_leads"] > 0 for x in results),
        "individual_leads": sum(x["individual_leads"] for x in results),
        "note": "Read-only partial coverage; no integration if dates, posting validity or France unconfirmed.",
        "companies": results,
    }
    OUTPUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({k: data[k] for k in (
        "groups_attempted", "groups_ats_page_reachable", "groups_with_individual_leads", "individual_leads"
    )}))
    for x in results:
        print(x["company"], "SuccessFactors", x["queries_reachable"], "/", x["queries_attempted"],
              "individual leads", x["individual_leads"])


if __name__ == "__main__":
    main()
