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
        with mock.patch.object(ats, "workday_details", side_effect=[
            {"jobDescription": "SQL et Python"}, OSError("Temporary 503")
        ]):
            ok, failed = ats.enrich_workday_candidates("ratp", "wd3", "RATP_Externe", jobs)
        self.assertEqual((ok, failed), (1, 1))
        self.assertEqual(jobs[0]["details"]["jobDescription"], "SQL et Python")
        self.assertNotIn("details", jobs[1])

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
