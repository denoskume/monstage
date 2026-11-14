"""Read-only discovery from known official Workday tenants not yet authorized
in the live Apps Script gateway. Do not call ingestExternalPostings for these
until backend allowlist is deployed and the required owner/host checks pass.
"""
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import re
import urllib.request
import urllib.parse

from discover_official_jobs import candidate_plans

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "artifacts" / "career-additional-workday-leads.json"

# Every host/site pair is grounded in existing individual employer job links.
SOURCES = (
    {"company": "RATP", "tenant": "ratp", "host": "wd3", "site": "RATP_Externe"},
    {"company": "Valeo", "tenant": "valeo", "host": "wd3", "site": "valeo_jobs"},
    {"company": "Michelin", "tenant": "michelinhr", "host": "wd3", "site": "Michelin"},
    {"company": "GE HealthCare", "tenant": "gehc", "host": "wd5", "site": "GEHC_ExternalSite"},
)
TERMS = ("stage data", "stage analyst", "stage image", "stage vision",
         "stage machine learning", "stage maintenance", "stage 2027",
         "power bi", "internship data", "internship vision")


def fetch_one(source, term):
    tenant, host, site = source["tenant"], source["host"], source["site"]
    endpoint = f"https://{tenant}.{host}.myworkdayjobs.com/wday/cxs/{tenant}/{site}/jobs"
    found = []
    for offset in (0, 20):
        request = urllib.request.Request(
            endpoint,
            data=json.dumps({
                "appliedFacets": {}, "limit": 20, "offset": offset,
                "searchText": term
            }).encode("utf-8"),
            headers={"Accept": "application/json", "Content-Type": "application/json",
                     "User-Agent": "Mozilla/5.0"},
            method="POST")
        with urllib.request.urlopen(request, timeout=22) as response:
            payload = json.load(response)
        rows = payload.get("jobPostings") or []
        found.extend(rows)
        if len(rows) < 20 or offset + len(rows) >= int(payload.get("total") or 0):
            break
    return found


def inspect_source(source):
    jobs, errors, successful_queries = {}, [], 0
    with ThreadPoolExecutor(max_workers=5) as pool:
        future_map = {pool.submit(fetch_one, source, term): term for term in TERMS}
        for future in as_completed(future_map):
            term = future_map[future]
            try:
                matches = future.result()
                successful_queries += 1
                for item in matches:
                    path = item.get("externalPath") or ""
                    if path.startswith("/job/"):
                        jobs[path] = item
            except Exception as exc:
                errors.append(term + ": " + str(exc)[:100])
    result = []
    for job in jobs.values():
        title = str(job.get("title") or "")
        for plan in candidate_plans(title):
            path = job["externalPath"]
            page = (f"https://{source['tenant']}.{source['host']}.myworkdayjobs.com/"
                    f"{source['site']}{path}")
            result.append({
                "company": source["company"], "plan": plan,
                "title": title, "official_job_url": page,
                "location_text": job.get("locationsText") or "",
                "posted_on_raw": job.get("postedOn") or "",
                "source": "official_workday_json_api",
                "status": "REVALIDATION_REQUIRED",
                "publication_date": None,
                "start_date": None,
            })
    return {
        "company": source["company"], "official_source": (
            f"https://{source['tenant']}.{source['host']}.myworkdayjobs.com/"
            f"{source['site']}"
        ),
        "queries_attempted": len(TERMS),
        "queries_succeeded": successful_queries,
        "unique_job_listings": len(jobs),
        "candidate_official_leads": len(result),
        "errors": errors,
        "leads": result[:180],
        "job_feed_reachable": bool(successful_queries),
    }


def main():
    results = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(inspect_source, SOURCES))
    OUTPUT.parent.mkdir(exist_ok=True)
    data = {
        "feeds_attempted": len(SOURCES),
        "feeds_reachable": sum(bool(x["job_feed_reachable"]) for x in results),
        "leads_discovered": sum(len(x["leads"]) for x in results),
        "note": "Read-only. Gateways are not yet allowlisted; this file is not integrated into MonStage Offers.",
        "sources": results,
    }
    OUTPUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({
        "feeds_attempted": data["feeds_attempted"],
        "feeds_reachable": data["feeds_reachable"],
        "leads_discovered": data["leads_discovered"],
    }))
    for item in results:
        print(item["company"], "Workday:",
              item["queries_succeeded"], "/", item["queries_attempted"],
              "unique listings", item["unique_job_listings"],
              "relevant internship leads", item["candidate_official_leads"],
              "errors", len(item["errors"]))


if __name__ == "__main__":
    main()
