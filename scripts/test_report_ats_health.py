"""Evidence-based coverage must never count portal HTTP 200 as a live ATS feed."""
from datetime import datetime, timezone
import json
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
from report_ats_health import report, saved_official_counts, publication_date

TARGETS = json.loads((Path(__file__).parent / "target_career_sources.json").read_text(encoding="utf-8"))
NOW = datetime(2026, 11, 15, 10, 0, tzinfo=timezone.utc)


class CoverageTests(unittest.TestCase):
    def test_exactly_thirty_groups_and_configured_not_equal_verified(self):
        names = [c["name"] for c in TARGETS["companies"]]
        audit = {"summary":{"groups_attempted":30}, "companies":[
            {"company": name, "portal": {"ok": True}} for name in names
        ]}
        offers = [
            {"id":"workday:ag:job1", "verifiedAt":"2026-11-15T08:00:00Z",
             "publishedAt":"2026-11-13"},
            {"id":"manual:application", "company":"Airbus", "publishedAt":"2026-11-15"},
        ]
        payload=report(TARGETS,audit,{}, {}, offers,NOW)
        summary=payload["summary"]
        self.assertEqual(summary["target_groups"],30)
        self.assertEqual(summary["groups_with_a_configured_ingestion"],17)
        self.assertEqual(summary["groups_without_configured_ingestion"],13)
        self.assertEqual(summary["official_rows_saved"],1)
        self.assertEqual(summary["groups_with_official_listings_verified_48h"],1)
        self.assertFalse(summary["full_30_group_ats_coverage_verified"])
        missing=next(x for x in payload["companies"] if x["company"]=="Safran")
        self.assertEqual(missing["status"],"portal_only_no_ingestion")
        self.assertEqual(missing["saved_official"],0)

    def test_unknown_publication_not_substituted_with_verification(self):
        offers=[{"id":"official:alstom:abc","verifiedAt":"2026-11-15T09:30:00Z",
                 "publishedAt":""}]
        data=saved_official_counts(offers,NOW)
        self.assertEqual(data["Alstom"]["verified_48h"],1)
        self.assertEqual(data["Alstom"]["published_7d"],0)
        self.assertIsNone(publication_date("Posted 2 days ago"))

    def test_unrecognized_provider_does_not_claim_official_capture(self):
        rows=[{"id":"workday:unknown:job", "verifiedAt":"2026-11-15T08:00:00Z"}]
        self.assertEqual(saved_official_counts(rows,NOW),{})

    def test_rejects_scope_drift(self):
        changed={"companies":TARGETS["companies"][:-1]}
        with self.assertRaisesRegex(ValueError,"EXACTLY 30"):
            report(changed,{}, {}, {}, [],NOW)


if __name__=="__main__":
    unittest.main()
