"""Auditable rotating coverage checks for MonStage's 30 target groups.

Portal HTTP success != job-feed coverage. Bing RSS is an independent indexed lead
source, never proof of a live, eligible or application-ready job. No fabricated
posting dates, freshness, new-offer counts, or employer-specific ATS coverage.
"""
import concurrent.futures
import datetime as dt
import json
import os
from pathlib import Path
import re
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

from discover_official_jobs import dedupe_official_leads, extract_official_jobs

ROOT = Path(__file__).resolve().parent.parent
INVENTORY = ROOT / "scripts" / "target_career_sources.json"
OUTPUT = ROOT / "artifacts"
KEYWORDS = {
    "A": '("computer vision" OR "traitement d images" OR "vision industrielle" OR "maintenance predictive" OR "machine learning") (stage OR internship) France',
    "B": '("data analyst" OR "data analyste" OR "business intelligence" OR "Power BI" OR "analyse de donnees") (stage OR internship) France',
}
USER_AGENT = "MonStage-Careers-Audit/1.1 (public portals; individual leads require verification)"

# Official filtered listing pages which expose individual vacancies as server
# rendered links. Add new ones only after checking the employer's canonical URL.
OFFICIAL_LISTING_PAGES = {
    "Safran": [
        "https://www.safran-group.com/fr/offres?countries%5B0%5D=1002-france&contracts%5B0%5D=42-stage&job_fields%5B0%5D=1578-data&items_per_page=All&sort=relevance",
        "https://www.safran-group.com/fr/offres?countries%5B0%5D=1002-france&contracts%5B0%5D=42-stage&job_fields%5B0%5D=1608-systemes-informations&items_per_page=All&sort=relevance",
    ],
}

# Search-index discovery supplements official employer portals; these are not
# unrestricted job-board APIs and do not certify that every posting was seen.
JOB_BOARD_DOMAINS = {
    "LinkedIn Jobs": "linkedin.com",
    "JobTeaser": "jobteaser.com",
    "Welcome to the Jungle": "welcometothejungle.com",
    "Indeed": "indeed.com",
    "HelloWork": "hellowork.com",
    "Apec": "apec.fr",
    "France Travail": "francetravail.fr",
}
# Only individual job postings count as leads. A LinkedIn company profile,
# a search result page or a company landing page is NOT a job opportunity.
JOB_POSTING_PATHS = {
    "LinkedIn Jobs": r"^/jobs/view/[^/]+",
    "JobTeaser": r"^/fr/job-offers/[^/]+",
    "Welcome to the Jungle": r"^/fr/companies/[^/]+/jobs/[^/]+",
    "Indeed": r"^/viewjob$",
    "HelloWork": r"^/fr-fr/emplois/[^/]+",
    "Apec": r"^/candidat/recherche-emploi\.html/emploi/detail-offre/[^/]+",
    "France Travail": r"^/offres/recherche/detail/[^/]+",
}

BOARD_TERMS = {
    "A": '("computer vision" OR "vision industrielle" OR "traitement images" OR "image processing" OR "perception 3d" OR "maintenance predictive")',
    "B": '("data analyst" OR "analyste de donnees" OR "power bi" OR "business intelligence" OR "data analytics")',
}



def fetch(url, timeout=18):
    req = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT, "Accept": "text/html, application/rss+xml, application/xml;q=0.8",
    })
    with urllib.request.urlopen(req, timeout=timeout) as response:
        data = response.read(1_000_000)
        return int(response.status), response.geturl(), data


def portal_check(company):
    try:
        status, final_url, data = fetch(company["url"])
        parsed = urllib.parse.urlparse(final_url)
        # An external redirect can be harmless, but isn't validated as the listed portal.
        expected = company["domain"].lower()
        host = (parsed.hostname or "").lower()
        on_expected_domain = host == expected or host.endswith("." + expected)
        official_leads = extract_official_jobs(company, final_url, data) if on_expected_domain else []
        listing_diagnostics = []
        for source_url in OFFICIAL_LISTING_PAGES.get(company["name"], []):
            try:
                sub_status, sub_url, sub_data = fetch(source_url, timeout=18)
                extracted = extract_official_jobs(company, sub_url, sub_data)
                official_leads.extend(extracted)
                listing_diagnostics.append({
                    "url": source_url, "http": sub_status,
                    "found_individual_leads": len(extracted), "error": None
                })
            except Exception as exc:
                listing_diagnostics.append({
                    "url": source_url, "http": None, "found_individual_leads": 0,
                    "error": str(exc)[:150]
                })
        return {
            "ok": 200 <= status < 400 and on_expected_domain,
            "status": status, "final_url": final_url,
            "domain_valid": on_expected_domain,
            "html_bytes_read": len(data),
            "official_job_leads": dedupe_official_leads(official_leads),
            "extra_listings": listing_diagnostics,
            "error": None,
        }
    except Exception as exc:
        return {"ok": False, "status": None, "final_url": None,
                "domain_valid": False, "html_bytes_read": 0,
                "official_job_leads": [], "extra_listings": [],
                "error": (type(exc).__name__ + ": " + str(exc))[:180]}


def indexed_check(company, plan):
    # Search engine results are supporting leads, never a verified vacancy.
    term = "site:" + company["domain"] + " " + KEYWORDS[plan]
    url = "https://www.bing.com/search?format=rss&q=" + urllib.parse.quote(term)
    try:
        status, _, data = fetch(url, timeout=15)
        root = ET.fromstring(data)
        items = root.findall(".//item")
        leads = []
        for item in items[:20]:
            link = (item.findtext("link") or "").strip()
            title = (item.findtext("title") or "").strip()
            host = (urllib.parse.urlparse(link).hostname or "").lower()
            official = host == company["domain"] or host.endswith("." + company["domain"])
            if official and link.startswith("https://"):
                leads.append({"title": title[:180], "url": link})
        return {"status": "index_reachable", "http": status,
                "indexed_official_leads": leads[:12], "error": None}
    except Exception as exc:
        return {"status": "index_unavailable", "http": None,
                "indexed_official_leads": [], "error": (type(exc).__name__ + ": " + str(exc))[:150]}


def jobboard_index_check(company, plan, board_name, board_domain):
    """Discover indexed leads; title, company, date and canonical URL remain unverified."""
    query = 'site:' + board_domain + ' "' + company["name"] + '" ' + (
        '(stage OR stagiaire OR internship) ' + BOARD_TERMS[plan] + ' France'
    )
    url = "https://www.bing.com/search?format=rss&q=" + urllib.parse.quote(query)
    try:
        response_code, _, data = fetch(url, timeout=15)
        root = ET.fromstring(data)
        leads = []
        for item in root.findall(".//item")[:20]:
            link = (item.findtext("link") or "").strip()
            title = (item.findtext("title") or "").strip()
            parsed = urllib.parse.urlparse(link)
            host = (parsed.hostname or "").lower()
            individual_job = bool(re.search(JOB_POSTING_PATHS[board_name], parsed.path))
            internship_title = bool(re.search(r"\b(stage|stagiaire|internship|intern|pfe)\b",
                                                title, flags=re.IGNORECASE))
            if (link.startswith("https://") and
                (host == board_domain or host.endswith("." + board_domain)) and
                individual_job and internship_title):
                leads.append({"title": title[:180], "url": link})
        return {"status": "index_reachable", "http": response_code,
                "indexed_leads": leads[:10], "error": None}
    except Exception as exc:
        return {"status": "index_unavailable", "http": None, "indexed_leads": [],
                "error": (type(exc).__name__ + ": " + str(exc))[:150]}


def check(company):
    # Official career site + indexed official pages for both A and B.
    portal = portal_check(company)
    indexed = {plan: indexed_check(company, plan) for plan in ("A", "B")}
    board_jobs = [(plan, name, domain) for plan in ("A", "B")
                  for name, domain in JOB_BOARD_DOMAINS.items()]
    # Keep per-company search within a bounded concurrency budget.
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        future_map = {
            pool.submit(jobboard_index_check, company, plan, name, domain): (plan, name)
            for plan, name, domain in board_jobs
        }
        board_results = {"A": {}, "B": {}}
        for future in concurrent.futures.as_completed(future_map):
            plan, name = future_map[future]
            try:
                board_results[plan][name] = future.result()
            except Exception as exc:
                board_results[plan][name] = {
                    "status": "index_unavailable", "indexed_leads": [],
                    "http": None, "error": str(exc)[:150]
                }

    # Portal health, job-board search, and confirmed job feed are different facts.
    if not portal["ok"]:
        status = "portal_unavailable_or_unverified"
    elif any(item["status"] == "index_unavailable" for item in indexed.values()):
        status = "partial_portal_only"
    else:
        status = "portal_and_index_checked_job_feed_unverified"
    return {
        "company": company["name"], "official_url": company["url"],
        "registry_verification": company["verification"],
        "ats": company["system"], "portal": portal, "indexed": indexed,
        "jobboards_indexed": board_results, "status": status,
        "job_feed_exhaustively_verified": False,
        "new_offers_confirmed": 0, "new_offers_ingested": 0,
    }


def main():
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    companies = inventory["companies"]
    assert len(companies) == 30 and len({c["name"] for c in companies}) == 30
    now = dt.datetime.now(dt.timezone.utc)
    # Every hourly run attempts ALL thirty groups independently, rather than
    # leaving twenty entirely unchecked on any given execution.
    rotation = 0
    selected = companies
    OUTPUT.mkdir(exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
        results = list(pool.map(check, selected))
    summary = {
        "started_at_utc": now.isoformat(timespec="seconds"),
        "finished_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "rotation": rotation, "total_target_groups": 30,
        "groups_attempted": len(selected),
        "groups_not_attempted_this_run": 30 - len(selected),
        "official_portals_reachable": sum(bool(r["portal"]["ok"]) for r in results),
        "official_pages_with_individual_leads": sum(
            bool(r["portal"]["official_job_leads"]) for r in results
        ),
        "official_job_leads": sum(len(r["portal"]["official_job_leads"]) for r in results),
        "groups_without_individual_leads": [
            r["company"] for r in results if not r["portal"]["official_job_leads"]
        ],
        "job_feeds_fully_checked": 0,
        "independent_indexes_reachable": sum(sum(x["status"] == "index_reachable"
            for x in r["indexed"].values()) for r in results),
        "jobboard_indexes_attempted": len(results) * 2 * len(JOB_BOARD_DOMAINS),
        "jobboard_indexes_reachable": sum(
            int(record["status"] == "index_reachable")
            for group in results for plan in ("A", "B")
            for record in group["jobboards_indexed"][plan].values()
        ),
        "indexed_jobboard_leads": sum(
            len(record["indexed_leads"])
            for group in results for plan in ("A", "B")
            for record in group["jobboards_indexed"][plan].values()
        ),
        "notes": [
            "Every one of the 30 group portals was attempted in this run.",
            "Portals that list zero individual job links need real ATS/feed integrations.",
            "An HTTP 200 careers page does not prove individual listings were searched.",
            "Indexed results are only leads; no offer enters MonStage without official detail and calendar validation.",
            "The ATS ingestion step in sync-ats.yml has separate per-provider diagnostics.",
            "Absence of newly confirmed offers does NOT imply absence of vacancies.",
        ],
    }
    payload = {"summary": summary, "companies": results}
    # Each entry is a lead, not a verified posting. Real job detail, start
    # month, length, and original employer application page still need review.
    leads = []
    seen_leads = set()
    for company in results:
        for plan in ("A", "B"):
            for board, record in company["jobboards_indexed"][plan].items():
                for item in record["indexed_leads"]:
                    key = (company["company"], plan, item["url"])
                    if key not in seen_leads:
                        seen_leads.add(key)
                        leads.append({
                            "company": company["company"], "plan": plan,
                            "source": board, "title": item["title"],
                            "jobboard_url": item["url"], "status": "REVALIDATION_REQUIRED",
                            "official_application_url": None, "publication_date": None
                        })
    official_leads = dedupe_official_leads([
        lead for company in results for lead in company["portal"]["official_job_leads"]
    ])
    (OUTPUT / "career-official-leads.json").write_text(
        json.dumps({
            "checked_at_utc": summary["finished_at_utc"],
            "target_companies": 30,
            "leads": official_leads,
            "verified_offers": 0,
            "notes": "Leads from individual official employer URLs; opening and start date still require validation"
        }, indent=2, ensure_ascii=False) + "\\n", encoding="utf-8"
    )
    (OUTPUT / "career-jobboard-leads.json").write_text(
        json.dumps({"checked_at_utc": summary["finished_at_utc"],
                    "sources": list(JOB_BOARD_DOMAINS), "leads": leads,
                    "verified_offers": 0}, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8"
    )
    (OUTPUT / "career-source-coverage.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    lines = ["# MonStage — 30-group source audit", "",
             "UTC: " + summary["finished_at_utc"],
             "Companies attempted per hourly run: " + str(summary["groups_attempted"]) + "/30",
             "Portals reachable: " + str(summary["official_portals_reachable"]) + "/30",
             "Official career pages with individual job leads: " + str(summary["official_pages_with_individual_leads"]) + "/30",
             "Official individual job leads (unverified): " + str(summary["official_job_leads"]),
             "Individual ATS job feeds fully audited in this step: 0/30 (ATS ingestion is separate)",
             "Job-board index queries completed: " + str(summary["jobboard_indexes_reachable"]) +
             "/" + str(summary["jobboard_indexes_attempted"]),
             "Indexed job-board leads (unverified): " + str(len(leads)), "",
             "| Groupe | Portail | Liens d'offres individuelles | Index A | Index B | Pistes jobboards A/B | Portail officiel |",
             "|---|---|---|---|---|---|---|"]
    for item in results:
        portal = "OK" if item["portal"]["ok"] else "FAILED"
        aa = item["indexed"]["A"]["status"]
        bb = item["indexed"]["B"]["status"]
        counts = [
            sum(len(x["indexed_leads"]) for x in item["jobboards_indexed"][plan].values())
            for plan in ("A", "B")
        ]
        lines.append("| " + item["company"].replace("|", "/") + " | " + portal +
                     " | " + str(len(item["portal"]["official_job_leads"])) +
                     " | " + aa + " | " + bb + " | " + str(counts[0]) + "/" +
                     str(counts[1]) + " | " + item["official_url"] + " |")
    lines += ["", "This is an availability audit, **not** an all-jobs verification.",
              "No offer alert is emitted from these results. Existing ATS ingest rules still apply."]
    (OUTPUT / "career-source-coverage.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False))
    for row in results:
        print(row["company"], row["status"], row["portal"]["status"],
              "official vacancy leads", len(row["portal"]["official_job_leads"]),
              "indexed leads", sum(len(x["indexed_official_leads"]) for x in row["indexed"].values()))


if __name__ == "__main__":
    main()
