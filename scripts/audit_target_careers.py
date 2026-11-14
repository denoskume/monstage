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

ROOT = Path(__file__).resolve().parent.parent
INVENTORY = ROOT / "scripts" / "target_career_sources.json"
OUTPUT = ROOT / "artifacts"
KEYWORDS = {
    "A": '("computer vision" OR "traitement d images" OR "vision industrielle" OR "maintenance predictive" OR "machine learning") (stage OR internship) France',
    "B": '("data analyst" OR "data analyste" OR "business intelligence" OR "Power BI" OR "analyse de donnees") (stage OR internship) France',
}
USER_AGENT = "MonStage-Careers-Audit/1.0 (public portals; metadata only)"

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
        return {
            "ok": 200 <= status < 400 and on_expected_domain,
            "status": status, "final_url": final_url,
            "domain_valid": on_expected_domain,
            "html_bytes_read": len(data),
            "error": None,
        }
    except Exception as exc:
        return {"ok": False, "status": None, "final_url": None,
                "domain_valid": False, "html_bytes_read": 0,
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
    # Hourly rotation: all 30 groups receive an attempted multi-source check
    # within three scheduled hourly executions (actual runner delays vary).
    rotation = int(now.timestamp() // 3600) % 3
    selected = companies[rotation * 10:(rotation + 1) * 10]
    OUTPUT.mkdir(exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        results = list(pool.map(check, selected))
    summary = {
        "started_at_utc": now.isoformat(timespec="seconds"),
        "finished_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "rotation": rotation, "total_target_groups": 30,
        "groups_attempted": len(selected), "groups_not_attempted_this_run": 20,
        "official_portals_reachable": sum(bool(r["portal"]["ok"]) for r in results),
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
             "Rotation: " + str(rotation + 1) + "/3",
             "Portals reachable: " + str(summary["official_portals_reachable"]) + "/10",
             "Individual job feeds fully audited in this step: 0/10 (ATS ingestion is separate)",
             "Job-board index queries completed: " + str(summary["jobboard_indexes_reachable"]) +
             "/" + str(summary["jobboard_indexes_attempted"]),
             "Indexed job-board leads (unverified): " + str(len(leads)), "",
             "| Groupe | Portail | Index A | Index B | Pistes jobboards A/B | Portail officiel |",
             "|---|---|---|---|---|---|"]
    for item in results:
        portal = "OK" if item["portal"]["ok"] else "FAILED"
        aa = item["indexed"]["A"]["status"]
        bb = item["indexed"]["B"]["status"]
        counts = [
            sum(len(x["indexed_leads"]) for x in item["jobboards_indexed"][plan].values())
            for plan in ("A", "B")
        ]
        lines.append("| " + item["company"].replace("|", "/") + " | " + portal +
                     " | " + aa + " | " + bb + " | " + str(counts[0]) + "/" +
                     str(counts[1]) + " | " + item["official_url"] + " |")
    lines += ["", "This is an availability audit, **not** an all-jobs verification.",
              "No offer alert is emitted from these results. Existing ATS ingest rules still apply."]
    (OUTPUT / "career-source-coverage.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False))
    for row in results:
        print(row["company"], row["status"], row["portal"]["status"],
              "indexed leads", sum(len(x["indexed_official_leads"]) for x in row["indexed"].values()))


if __name__ == "__main__":
    main()
