"""Regression tests for hourly ATS ingestion and Google Sheets acknowledgements."""
import io
import json
import os
import sys
from pathlib import Path
from unittest import TestCase, mock

sys.path.insert(0, str(Path(__file__).resolve().parent))
import ingest_public_ats as ats


def fake_response(value):
    return io.BytesIO(json.dumps(value).encode("utf-8"))


class AtsIngestionTests(TestCase):
    def test_workday_feeds_are_scoped_to_known_target_groups(self):
        tenants = [row[0] for row in ats.WORKDAY]
        self.assertEqual(len(tenants), len(set(tenants)))
        self.assertEqual(set(tenants), {
            "ag", "thales", "evoyageurs", "alliancewd", "airliquidehr",
            "ratp", "valeo", "michelinhr", "gehc",
        })

    def test_rejects_non_job_urls_for_details(self):
        with mock.patch.object(ats.urllib.request, "urlopen") as request:
            self.assertIsNone(ats.workday_details("ratp", "wd3", "RATP_Externe", "/../../jobs"))
            request.assert_not_called()

    def test_details_are_from_official_workday_endpoint(self):
        data = {"jobPostingInfo": {
            "title": "Stage Data Analyst", "jobDescription": "<p>Power BI</p>",
            "postedDate": "2026-11-15", "location": "Paris, France",
            "internalOnly": "ignore me",
        }}
        with mock.patch.object(ats.urllib.request, "urlopen", return_value=fake_response(data)) as request:
            result = ats.workday_details("ratp", "wd3", "RATP_Externe", "/job/Paris/Job_JR100")
        self.assertEqual(result["jobDescription"], "<p>Power BI</p>")
        self.assertEqual(result["postedDate"], "2026-11-15")
        self.assertNotIn("internalOnly", result)
        url = request.call_args.args[0].full_url
        self.assertEqual(url,
            "https://ratp.wd3.myworkdayjobs.com/wday/cxs/ratp/RATP_Externe/job/Paris/Job_JR100")

    def test_enrichment_keeps_listing_when_detail_fetch_fails(self):
        jobs = [{"externalPath": "/job/Paris/JR1", "title": "Stage Data Analyst"},
                {"externalPath": "/job/Lyon/JR2", "title": "Stage Vision"}]
        def detail_by_job(tenant, host, site, path):
            if path.endswith("JR1"):
                return {"jobDescription": "SQL et Python"}
            raise OSError("Temporary 503")
        with mock.patch.object(ats, "workday_details", side_effect=detail_by_job):
            ok, failed = ats.enrich_workday_candidates("ratp", "wd3", "RATP_Externe", jobs)
        self.assertEqual((ok, failed), (1, 1))
        self.assertEqual(jobs[0]["details"]["jobDescription"], "SQL et Python")
        self.assertNotIn("details", jobs[1])

    @mock.patch.dict(os.environ, {"APPS_SCRIPT_GATEWAY_SECRET": "test-secret", "APPS_SCRIPT_URL": "https://example.invalid/exec"})
    def test_batches_are_idempotent_and_never_send_more_than_thirty(self):
        calls = []
        def backend_reply(req, timeout=90):
            sent = json.loads(req.data)
            calls.append(sent)
            ids = ["workday:ratp:job-" + str(job["id"]) for job in sent["jobs"]]
            return fake_response({"ingestion": {
                "accepted": len(ids), "persisted": True, "acceptedIds": ids,
            }})
        jobs = [{"id": i, "externalPath": "/job/" + str(i)} for i in range(75)]
        with mock.patch.object(ats.urllib.request, "urlopen", side_effect=backend_reply):
            self.assertEqual(ats.ingest("workday", "ratp", jobs), 75)
        self.assertEqual([len(p["jobs"]) for p in calls], [30, 30, 15])
        self.assertTrue(all(p["merge"] is True for p in calls))
        self.assertEqual([i for p in calls for i in [j["id"] for j in p["jobs"]]], list(range(75)))

    def test_retries_only_transient_429_errors(self):
        from urllib.error import HTTPError
        limited = HTTPError("https://ratp.example", 429, "Too Many Requests", {}, None)
        with mock.patch.object(ats.urllib.request, "urlopen", side_effect=[
            limited, fake_response({"jobPostings": [{"title": "Stage Data Analyst"}], "total": 1}),
        ]) as fetch, mock.patch.object(ats.time, "sleep") as sleep:
            jobs = ats.workday_search("ratp", "wd3", "RATP_Externe", "stage data")
        self.assertEqual(jobs[0]["title"], "Stage Data Analyst")
        self.assertEqual(fetch.call_count, 2)
        sleep.assert_called_once()

    @mock.patch.dict(os.environ, {"APPS_SCRIPT_GATEWAY_SECRET": "test-secret", "APPS_SCRIPT_URL": "https://example.invalid/exec"})
    def test_transient_gateway_error_is_retried_without_duplicate_rows(self):
        transient = {"error": "ATS_INGEST_RETRYABLE", "retryable": True, "category": "LOCK_CONTENTION"}
        receipt = {"ingestion": {"accepted": 1, "persisted": True,
                   "acceptedIds": ["workday:ag:job"]}}
        with mock.patch.object(ats.urllib.request, "urlopen", side_effect=[
            fake_response(transient), fake_response(receipt)
        ]) as fetch, mock.patch.object(ats.time, "sleep") as sleep:
            accepted = ats.ingest("workday", "ag", [{"id": "job", "externalPath": "/job/Paris/job"}])
        self.assertEqual(accepted, 1)
        self.assertEqual(fetch.call_count, 2)
        sleep.assert_called_once()

    @mock.patch.dict(os.environ, {"APPS_SCRIPT_GATEWAY_SECRET": "test-secret", "APPS_SCRIPT_URL": "https://example.invalid/exec"})
    def test_permanent_gateway_error_is_not_retried(self):
        with mock.patch.object(ats.urllib.request, "urlopen", return_value=fake_response({
            "error": "ATS_INGEST_FAILED", "retryable": False, "category": "SHEETS_WRITE"
        })) as fetch:
            with self.assertRaisesRegex(RuntimeError, "SHEETS_WRITE"):
                ats.ingest("workday", "ag", [{"id": "job", "externalPath": "/job/Paris/job"}])
        fetch.assert_called_once()

    @mock.patch.dict(os.environ, {"APPS_SCRIPT_GATEWAY_SECRET": "test-secret", "APPS_SCRIPT_URL": "https://example.invalid/exec"})
    def test_backend_acknowledgement_requires_persisted_ids(self):
        old_backend = {"ingestion": {"provider": "workday", "sourceId": "ratp", "accepted": 1}}
        with mock.patch.object(ats.urllib.request, "urlopen", return_value=fake_response(old_backend)):
            with self.assertRaisesRegex(RuntimeError, "deploy the updated Apps Script"):
                ats.ingest("workday", "ratp", [{"externalPath": "/job/X"}])
        new_backend = {"ingestion": {"provider": "workday", "sourceId": "ratp",
                        "accepted": 1, "persisted": True, "acceptedIds": ["workday:ratp:job x"]}}
        with mock.patch.object(ats.urllib.request, "urlopen", return_value=fake_response(new_backend)):
            self.assertEqual(ats.ingest("workday", "ratp", [{"externalPath": "/job/X"}]), 1)
