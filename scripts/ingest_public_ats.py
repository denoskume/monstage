"""Import trusted public ATS listings from the CI runner into private MonStage Sheets.

The Apps Script backend validates location, internship status and relevance before writing.
No job posting dates are inferred: only original ATS timestamps are passed through.
"""
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

WORKDAY = [
    ("ag", "wd3", "Airbus"),
    ("thales", "wd3", "Careers"),
    ("evoyageurs", "wd3", "jobs"),
    ("alliancewd", "wd3", "renault-group-careers"),
    ("airliquidehr", "wd3", "AirLiquideExternalCareer"),
    ("ratp", "wd3", "RATP_Externe"),
    ("valeo", "wd3", "valeo_jobs"),
    ("michelinhr", "wd3", "Michelin"),
    ("gehc", "wd5", "GEHC_ExternalSite"),
]
WORKDAY_TERMS = (
    "stage vision", "stage image", "stage data analyst",
    "analyse de données", "stage data", "stage maintenance", "stage 2027",
    "power bi", "stage computer vision", "stage machine learning",
    "stage traitement image", "stage data analyste",
)


def workday_search(tenant, host, site, phrase):
    endpoint = f"https://{tenant}.{host}.myworkdayjobs.com/wday/cxs/{tenant}/{site}/jobs"
    results = []
    # Two pages instead of silently truncating every keyword to 20 vacancies.
    for offset in (0, 20):
        payload = json.dumps({
            "appliedFacets": {}, "limit": 20, "offset": offset, "searchText": phrase
        }).encode()
        request = urllib.request.Request(endpoint, payload, {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
        }, method="POST")
        with urllib.request.urlopen(request, timeout=18) as response:
            body = json.load(response)
        batch = body.get("jobPostings") or []
        results.extend(batch)
        if len(batch) < 20 or offset + len(batch) >= int(body.get("total") or 0):
            break
    return results


def workday_details(tenant, host, site, external_path):
    """Fetch canonical employer details, not guessed content or publication dates."""
    if not re.match(r"^/job/[A-Za-z0-9_/%-]+$", str(external_path or "")):
        return None
    endpoint = (
        f"https://{tenant}.{host}.myworkdayjobs.com/wday/cxs/"
        f"{tenant}/{site}{external_path}"
    )
    request = urllib.request.Request(endpoint, headers={
        "Accept": "application/json", "User-Agent": "Mozilla/5.0"
    })
    with urllib.request.urlopen(request, timeout=18) as response:
        payload = json.load(response)
    info = payload.get("jobPostingInfo")
    if not isinstance(info, dict):
        return None
    # Keep the request payload bounded; no credentials, personal data or inferred dates.
    allowed = ("title", "jobDescription", "postedDate", "location",
               "locationText", "jobFamily", "jobFamilyGroup", "timeType")
    clean = {k: info[k][:12000] if k == "jobDescription" and isinstance(info.get(k), str)
             else info[k] for k in allowed if isinstance(info.get(k), (str, int, float))}
    return clean


def enrich_workday_candidates(tenant, host, site, jobs):
    """Attach job-specific descriptions; report incomplete details separately."""
    successes, failures = 0, 0
    with ThreadPoolExecutor(max_workers=12) as pool:
        futures = {
            pool.submit(workday_details, tenant, host, site, job["externalPath"]): job
            for job in jobs
        }
        for future in as_completed(futures):
            job = futures[future]
            try:
                detail = future.result()
                if detail and detail.get("jobDescription"):
                    successes += 1
                else:
                    failures += 1
                if detail:
                    job["details"] = detail
            except (OSError, ValueError):
                failures += 1
    return successes, failures


def refresh_workday():
    """Restore postings from five employer-authorized Workday feeds."""
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
        # The gateway replaces one employer's snapshot per request. Sending
        # a second chunk with 0 matches used to mark earlier accepted jobs stale.
        # Only internship titles are eligible downstream; submit once per source.
        candidates = [
            job for job in jobs.values()
            if re.search(r"\b(stage|stagiaire|internship|intern|pfe)\b", str(job.get("title", "")), re.I)
        ]
        print("Workday", tenant, "internship-title candidates", len(candidates))
        if len(candidates) > 200:
            failures.append(f"{tenant}: {len(candidates)} candidates exceed gateway batch; partial ingestion prohibited")
        elif successes:
            enriched, incomplete = enrich_workday_candidates(tenant, host, site, candidates)
            print("Workday", tenant, "job descriptions retrieved", enriched,
                  "missing/blocked detail pages", incomplete)
            try:
                accepted += ingest("workday", tenant, candidates)
            except Exception as exc:
                failures.append(f"{tenant}/ingestion: {str(exc)[:150]}")
        else:
            failures.append(f"{tenant}: all search terms failed; previous snapshot must be preserved")
    print("Workday runner accepted", accepted, "warnings", len(failures))
    for message in failures[:12]:
        print("Workday warning:", message)
    if any("/ingestion:" in m or "exceed gateway batch" in m or "all search terms failed" in m for m in failures):
        raise RuntimeError("Workday partial failure: " + "; ".join(failures[:8]))
    if len(failures) >= len(WORKDAY) * len(WORKDAY_TERMS):
        raise RuntimeError("Every Workday query failed")
    return accepted


GREENHOUSE = []
SMARTRECRUITERS = ["veoliaenvironnementsa"]


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
    accepted = int(result.get("accepted", 0))
    receipt = result.get("acceptedIds")
    # New Apps Script acknowledges a source only after reading saved IDs back
    # from the underlying Sheet. This deliberately fails on obsolete deployments.
    if result.get("persisted") is not True or not isinstance(receipt, list) or len(receipt) != accepted:
        raise RuntimeError("Backend ingestion not verified: deploy the updated Apps Script gateway")
    if not all(isinstance(item, str) and item for item in receipt):
        raise RuntimeError("Invalid persisted job IDs from gateway " + source_id)
    print(json.dumps(result, ensure_ascii=False))
    return accepted


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
            collected = {}
            for phrase in ("stage data", "stage data analyst", "stage vision", "stage maintenance", "power bi"):
                for offset in (0, 100, 200):
                    params = urllib.parse.urlencode({
                        "limit": 100, "offset": offset, "country": "fr", "q": phrase
                    })
                    url = ("https://api.smartrecruiters.com/v1/companies/"
                           + urllib.parse.quote(company) + "/postings?" + params)
                    feed = read_json(url)
                    batch = feed.get("content") or []
                    for job in batch:
                        if job.get("id"):
                            collected[str(job["id"])] = {
                                "id": job.get("id"),
                                "name": job.get("name"),
                                "ref": job.get("ref"),
                                "releasedDate": job.get("releasedDate"),
                                "location": job.get("location") or {},
                                "department": job.get("department") or {},
                                "function": job.get("function") or {},
                                "typeOfEmployment": job.get("typeOfEmployment") or {},
                            }
                    if len(batch) < 100 or offset + len(batch) >= int(feed.get("totalFound") or 0):
                        break
            jobs = list(collected.values())
            print("SmartRecruiters", company, "unique official postings", len(jobs))
            # Ingest one consistent employer snapshot, never separate chunks
            # that overwrite the accepted postings from the earlier chunk.
            candidates = [
                job for job in jobs
                if re.search(r"\b(stage|stagiaire|internship|intern|pfe)\b", str(job.get("name", "")), re.I)
            ]
            print("SmartRecruiters", company, "internship-title candidates", len(candidates))
            if len(candidates) > 200:
                raise RuntimeError(f"{company}: {len(candidates)} candidates exceed 200; no partial snapshot submitted")
            accepted += ingest("smartRecruiters", company, candidates)
        except Exception as exc:
            errors.append("smartrecruiters/" + company + ": " + str(exc)[:180])
    print("ATS runner ingestion: accepted", accepted, "errors", len(errors))
    for error in errors:
        print("ATS source warning:", error)
    if errors:
        raise SystemExit("ATS ingestion incomplete: " + "; ".join(errors[:8]))


if __name__ == "__main__":
    main()
