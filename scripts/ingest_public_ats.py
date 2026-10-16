"""Import trusted public ATS listings from the CI runner into private MonStage Sheets.

The Apps Script backend validates location, internship status and relevance before writing.
No job posting dates are inferred: only original ATS timestamps are passed through.
"""
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

GREENHOUSE = ["shifttechnology", "artefactjobs", "mirakllabs", "mirakl"]
SMARTRECRUITERS = [
    "SopraSteria1", "BoschGroup", "Eurofins", "veoliaenvironnementsa",
    "alten", "GTT", "Sia", "ASSYSTEM", "octotechnology", "Iliad-Free",
]


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
    if not accepted:
        raise SystemExit("ATS runner ingestion found no verified relevant postings")


if __name__ == "__main__":
    main()
