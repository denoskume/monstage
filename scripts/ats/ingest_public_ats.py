"""Import trusted public ATS listings from the CI runner into private MonStage Sheets.

The Apps Script backend validates location, internship status and relevance before writing.
No job posting dates are inferred: only original ATS timestamps are passed through.
"""
import json
import os
import re
import sys
import time
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
    "stage traitement signal", "stage algorithmique", "stage imagerie",
    "stage perception", "stage data science", "stage optronique",
)


def fetch_json_with_backoff(request, timeout=22):
    """Respect employer rate limits; retry bounded transient failures only."""
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return json.load(response)
        except urllib.error.HTTPError as exc:
            # Do not hammer a portal after a 429; the next scheduled run
            # provides the cooldown. Retrying 429 is counterproductive.
            if exc.code == 429 or exc.code not in (500, 502, 503, 504) or attempt == 3:
                raise
            retry_after = (exc.headers or {}).get("Retry-After", "")
            try:
                delay = min(12.0, max(0.5, float(retry_after)))
            except (ValueError, TypeError):
                delay = min(12.0, 1.5 * 2 ** attempt)
            time.sleep(delay)
    raise RuntimeError("Transient ATS request exhausted retries")


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
        body = fetch_json_with_backoff(request, timeout=22)
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
    payload = fetch_json_with_backoff(request, timeout=22)
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
    """Enrich a small bounded batch sequentially without an HTTP burst.

    All other listing-only candidates are still submitted; the gateway will
    classify them as unconfirmed instead of treating missing details as 0 jobs.
    """
    successes, failures = 0, 0
    for job in jobs[:5]:
        try:
            detail = workday_details(tenant, host, site, job["externalPath"])
            if detail and detail.get("jobDescription"):
                successes += 1
            else:
                failures += 1
            if detail:
                job["details"] = detail
        except urllib.error.HTTPError as exc:
            failures += 1
            if exc.code == 429:
                break
        except (OSError, ValueError):
            failures += 1
        time.sleep(0.5)
    return successes, failures


def refresh_workday():
    """Restore postings from all feeds with rate-limit-aware term rotation.

    Avoid firing 12 simultaneous keyword searches (plus extra pages and detail
    requests) at each Workday tenant every hour. Rotate A/B search vocabulary
    across 3 cycles; every run still covers BOTH plans and all nine configured
    tenants. Never mistake a rate-limited source for 'no internships'.
    """
    # One listing search per tenant, once every 3 hours. The term cycles
    # across both plans instead of 4+ parallel keywords on each invocation.
    term_groups = (
        ("stage",), ("stage data analyst",), ("stage image",),
        ("stage machine learning",), ("stage data",),
        ("stage vision",), ("stage maintenance",),
        ("stage traitement signal",), ("stage algorithmique",),
        ("stage imagerie",), ("stage perception",),
        ("stage data science",), ("stage optronique",),
    )
    rotation = int(time.time() // (3 * 3600)) % len(term_groups)
    selected_terms = term_groups[rotation]
    print("Workday throttled keyword rotation", rotation, "of", len(term_groups),
          "terms", len(selected_terms), "covering Plans A/B")
    accepted = 0
    failures = []
    reached = 0
    for tenant, host, site in WORKDAY:
        jobs = {}
        successes = 0
        throttled = False
        for phrase in selected_terms:
            try:
                batch = workday_search(tenant, host, site, phrase)
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
                error_text = str(exc)[:120]
                failures.append(f"{tenant}/{phrase}: {error_text}")
                if isinstance(exc, urllib.error.HTTPError) and exc.code == 429:
                    # A portal that still sends 429 after bounded retries needs
                    # cooling off, not another burst of searches from this IP.
                    throttled = True
                    print("Workday rate-limited", tenant,
                          "- stopping this tenant's queries; retry next hourly run")
                    break
            # Polite spacing between keyword requests: no concurrent burst
            # against the same employer's gateway.
            time.sleep(0.8)
        print("Workday", tenant, "successful searches", successes,
              "unique job postings", len(jobs), "rate_limited", throttled)
        candidates = [
            job for job in jobs.values()
            if re.search(r"\b(stage|stagiaire|internship|intern|pfe)\b",
                         str(job.get("title", "")), re.I)
        ]
        print("Workday", tenant, "internship-title candidates", len(candidates))
        if successes:
            reached += 1
            enriched, incomplete = enrich_workday_candidates(tenant, host, site, candidates)
            print("Workday", tenant, "job descriptions retrieved", enriched,
                  "missing/blocked detail pages", incomplete)
            try:
                accepted += ingest("workday", tenant, candidates)
            except Exception as exc:
                failures.append(f"{tenant}/ingestion: {str(exc)[:150]}")
        else:
            failures.append(f"{tenant}: no successful searches; preserving previous snapshot")
    print("Workday runner accepted", accepted, "warnings", len(failures))
    for message in failures[:12]:
        print("Workday warning:", message)
    if not reached:
        raise RuntimeError("No Workday tenant was reachable; all previous snapshots preserved")
    # Partial ATS rate limits are logged as degraded coverage, not a full
    # workflow failure that sends repeated GitHub failure emails.
    return accepted

# Only previously configured and employer-verified public ATS boards.
# Expand coverage by discipline without high-volume anonymous crawling.
GREENHOUSE = ["artefactjobs", "mirakllabs", "mirakl"]
SMARTRECRUITERS = [
    "veoliaenvironnementsa", "SopraSteria1", "BoschGroup", "Eurofins", "alten"
]


def read_json(url):
    request = urllib.request.Request(url, headers={
        "Accept": "application/json",
        "User-Agent": "MonStage ATS Import/1.0",
    })
    with urllib.request.urlopen(request, timeout=35) as response:
        return json.loads(response.read())


def ingest(provider, source_id, jobs):
    """Idempotent, acknowledged mini-batches; never erase another source/chunk."""
    if not jobs:
        print("No records to ingest for", provider, source_id, "- preserving previous snapshot")
        return 0
    total_accepted = 0
    batch_size = 30
    for offset in range(0, len(jobs), batch_size):
        batch = jobs[offset:offset + batch_size]
        payload = json.dumps({
            "gatewaySecret": os.environ["APPS_SCRIPT_GATEWAY_SECRET"],
            "action": "ingestExternalPostings",
            "provider": provider,
            "sourceId": source_id,
            "merge": True,
            "jobs": batch,
        }).encode()
        request = urllib.request.Request(
            os.environ["APPS_SCRIPT_URL"],
            data=payload,
            method="POST",
            headers={"Content-Type": "application/json"},
        )
        # Retry only transient backend responses. Stable-ID upserts make
        # replaying an ambiguous batch safe after a lost acknowledgement.
        for attempt in range(3):
            reply = fetch_json_with_backoff(request, timeout=90)
            reason = str(reply.get("error") or "")
            retryable = reply.get("retryable") is True or reason in (
                "MONSTAGE_API_ERROR", "ATS_INGEST_RETRYABLE",
            )
            if retryable and attempt < 2:
                print("ATS transient gateway failure", provider, source_id,
                      "batch", offset // batch_size + 1,
                      "reason", reason, "retry", attempt + 1)
                time.sleep(2 * (attempt + 1))
                continue
            break
        result = reply.get("ingestion")
        if not isinstance(result, dict):
            server_error = str(reply.get("error") or "missing response receipt")[:120]
            category = str(reply.get("category") or "")[:40]
            raise RuntimeError(f"Apps Script did not acknowledge {source_id} batch {offset}: {server_error} / {category}")
        accepted = int(result.get("accepted", 0))
        receipt = result.get("acceptedIds")
        if result.get("persisted") is not True or not isinstance(receipt, list) or len(receipt) != accepted:
            raise RuntimeError("Backend ingestion not verified: deploy the updated Apps Script gateway")
        if not all(isinstance(item, str) and item for item in receipt):
            raise RuntimeError("Invalid persisted job IDs from gateway " + source_id)
        total_accepted += accepted
        print(json.dumps({
            "provider": provider, "sourceId": source_id,
            "batch": offset // batch_size + 1, "rowsSent": len(batch),
            "accepted": accepted, "persisted": True,
            # Counters only describe public job-filter stages; no secrets,
            # application IDs or candidate personal data are logged.
            "filterCounters": {
                key: int(value)
                for key, value in (result.get("counters") or {}).items()
                if key in ("received", "internship", "france", "relevant", "enriched")
                and isinstance(value, (int, float)) and not isinstance(value, bool)
            },
        }, ensure_ascii=False))
    return total_accepted

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
            # Upload internship candidates only. Save the backend from
            # receiving hundreds of permanent jobs per public board.
            jobs = [job for job in jobs
                    if re.search(r"\b(stage|stagiaire|internship|intern|pfe)\b",
                                 str(job.get("title", "")), re.I)]
            print("Greenhouse", board, "internship candidates", len(jobs))
            for offset in range(0, len(jobs), 200):
                accepted += ingest("greenhouse", board, jobs[offset:offset+200])
        except Exception as exc:
            errors.append("greenhouse/" + board + ": " + str(exc)[:180])
    for company in SMARTRECRUITERS:
        try:
            collected = {}
            # Two bounded listing requests, never 5 terms × 3 pages.
            # The gateway validates internship, France and Plan A/B relevance.
            for offset in (0, 100):
                params = urllib.parse.urlencode({
                    "limit": 100, "offset": offset, "country": "fr", "q": "stage"
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
            # The idempotent backend accepts mini-batches without source replacement.
            candidates = [
                job for job in jobs
                if re.search(r"\b(stage|stagiaire|internship|intern|pfe)\b", str(job.get("name", "")), re.I)
            ]
            print("SmartRecruiters", company, "internship-title candidates", len(candidates))
            accepted += ingest("smartRecruiters", company, candidates)
        except Exception as exc:
            errors.append("smartrecruiters/" + company + ": " + str(exc)[:180])
    print("ATS runner ingestion: accepted", accepted, "errors", len(errors))
    for error in errors:
        print("ATS source warning:", error)
    # HTTP 429 or a temporarily unavailable site must not generate failure
    # mails after other providers were successfully processed.
    fatal = [message for message in errors
             if "Apps Script" in message or "/ingestion:" in message]
    if fatal:
        raise SystemExit("ATS backend ingestion failed: " + "; ".join(fatal[:4]))
    if errors:
        print("ATS partial coverage: preserved last-known results; source diagnostics above")


if __name__ == "__main__":
    main()
