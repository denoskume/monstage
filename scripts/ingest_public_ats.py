"""Import trusted public ATS listings from the CI runner into private MonStage Sheets.

The Apps Script backend validates location, internship status and relevance before writing.
No job posting dates are inferred: only original ATS timestamps are passed through.
"""
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

WORKDAY = [
    ("ag", "wd3", "Airbus"),
    ("thales", "wd3", "Careers"),
    ("evoyageurs", "wd3", "jobs"),
    ("alliancewd", "wd3", "renault-group-careers"),
]
WORKDAY_TERMS = (
    "stage vision", "stage image", "stage data analyst",
    "analyse de données", "stage data", "stage maintenance", "stage 2027",
    "power bi",
)


def workday_search(tenant, host, site, phrase):
    endpoint = f"https://{tenant}.{host}.myworkdayjobs.com/wday/cxs/{tenant}/{site}/jobs"
    payload = json.dumps({
        "appliedFacets": {}, "limit": 20, "offset": 0, "searchText": phrase
    }).encode()
    request = urllib.request.Request(endpoint, payload, {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
    }, method="POST")
    with urllib.request.urlopen(request, timeout=18) as response:
        return json.load(response).get("jobPostings", [])


def refresh_workday():
    """Restore Workday offers from four allowlisted ATS feeds."""
    accepted = 0
    failures = []
    for tenant, host, site in WORKDAY:
        jobs = {}
        successes = 0
        with ThreadPoolExecutor(max_workers=6) as pool:
            futures = {pool.submit(workday_search, tenant, host, site, phrase): phrase
                       for phrase in WORKDAY_TERMS}
            for future in as_completed(futures):
                phrase = futures[future]
                try:
                    batch = future.result()
                    successes += 1
                    for job in batch:
                        path = job.get("externalPath")
                        if path and path.startswith("/job/"):
                            jobs[path] = {
                                "id": path,
                                "externalPath": path,
                                "title": job.get("title", ""),
                                "locationsText": job.get("locationsText", ""),
                                "postedOn": job.get("postedOn", ""),
                            }
                except (OSError, ValueError) as exc:
                    failures.append(f"{tenant}/{phrase}: {str(exc)[:90]}")
        print("Workday", tenant, "successful searches", successes,
              "unique job postings", len(jobs))
        if successes and jobs:
            try:
                accepted += ingest("workday", tenant, list(jobs.values()))
            except Exception as exc:
                failures.append(f"{tenant}/ingestion: {str(exc)[:150]}")
    print("Workday runner accepted", accepted, "warnings", len(failures))
    for message in failures[:12]:
        print("Workday warning:", message)
    if not accepted:
        raise RuntimeError("Workday runner recovered no eligible postings")
    return accepted


GREENHOUSE = []
SMARTRECRUITERS = ["BoschGroup"]


def read_json(url):
    request = urllib.request.Request(url, headers={
        "Accept": "application/json",
        "User-Agent": "MonStage ATS Import/1.0",
    })
    with urllib.request.urlopen(request, timeout=35) as response:
        return json.loads(response.read())


def ingest(provider, source_id, jobs):
    payload = json.dumps({
        "gatewaySecret": os.environ["APPS_SCRIPT_GATEWAY_SECRET"],
        "action": "ingestExternalPostings",
        "provider": provider,
        "sourceId": source_id,
        "jobs": jobs[:200],
    }).encode()
    request = urllib.request.Request(
        os.environ["APPS_SCRIPT_URL"],
        data=payload,
        method="POST",
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        reply = json.loads(response.read())
    result = reply.get("ingestion")
    if not isinstance(result, dict):
        raise RuntimeError("Apps Script did not acknowledge ATS ingestion for " + source_id)
    print(json.dumps(result, ensure_ascii=False))
    return int(result.get("accepted", 0))


def main():
    accepted = 0
    errors = []
    try:
        accepted += refresh_workday()
    except Exception as exc:
        errors.append("workday: " + str(exc)[:180])
    for board in GREENHOUSE:
        url = "https://boards-api.greenhouse.io/v1/boards/" + urllib.parse.quote(board) + "/jobs?content=true"
        try:
            feed = read_json(url)
            jobs = feed.get("jobs") or []
            jobs = [{
                "id": job.get("id"),
                "title": job.get("title"),
                "content": (job.get("content") or "")[:20000],
                "location": {"name": (job.get("location") or {}).get("name", "")},
                "absolute_url": job.get("absolute_url", ""),
                "first_published_at": job.get("first_published_at") or job.get("published_at"),
            } for job in jobs if job.get("id")]
            print("Greenhouse", board, "fetched", len(jobs))
            for offset in range(0, len(jobs), 200):
                accepted += ingest("greenhouse", board, jobs[offset:offset+200])
        except Exception as exc:
            errors.append("greenhouse/" + board + ": " + str(exc)[:180])
    for company in SMARTRECRUITERS:
        try:
            params = urllib.parse.urlencode({
                "limit": 100, "offset": 0, "country": "fr", "q": "stage"
            })
            url = ("https://api.smartrecruiters.com/v1/companies/"
                   + urllib.parse.quote(company) + "/postings?" + params)
            jobs = (read_json(url).get("content") or [])
            jobs = [{
                "id": job.get("id"),
                "name": job.get("name"),
                "ref": job.get("ref"),
                "releasedDate": job.get("releasedDate"),
                "location": job.get("location") or {},
                "department": job.get("department") or {},
                "function": job.get("function") or {},
                "typeOfEmployment": job.get("typeOfEmployment") or {},
            } for job in jobs if job.get("id")]
            print("SmartRecruiters", company, "fetched", len(jobs))
            if jobs:
                accepted += ingest("smartRecruiters", company, jobs)
        except Exception as exc:
            errors.append("smartrecruiters/" + company + ": " + str(exc)[:180])
    print("ATS runner ingestion: accepted", accepted, "errors", len(errors))
    for error in errors:
        print("ATS source warning:", error)
    if errors and len(errors) == len(GREENHOUSE) + len(SMARTRECRUITERS):
        raise SystemExit("All targeted ATS sources failed")


if __name__ == "__main__":
    main()
