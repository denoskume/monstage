"""Offline regressions for verifying SuccessFactors employer-hosted detail pages."""
import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ingest_successfactors import (
    verified_job, is_official_url, parse_official_date, labelled_france_location
)

URL = "https://jobsearch.alstom.com/job/Saint-Ouen-Stage-HR-Data-Analyst-J/1456989133/"


class OfficialJobPageTests(unittest.TestCase):
    def test_schema_org_fr_job_is_accepted_with_canonical_date(self):
        html = """<html><h1>Stage - HR Data Analyst (H/F)</h1>
        <script type="application/ld+json">{
          "@type": "JobPosting", "title": "Stage - HR Data Analyst (H/F)",
          "datePosted": "2026-11-12",
          "description": "Data Analytics and Power BI",
          "jobLocation": {"address": {"addressCountry": "FR",
            "addressLocality": "Saint-Ouen"}}
        }</script></html>"""
        record = verified_job("Alstom", URL, html)
        self.assertIsNotNone(record)
        self.assertEqual(record["location"], "Saint-Ouen, France")
        self.assertEqual(record["publishedAt"], "2026-11-12")
        self.assertEqual(len(record["id"]), 20)

    def test_html_location_label_fr_fallback(self):
        html = """<h1>Stage - HR Data Analyst (H/F)</h1>
        <main>Apply now Date: 12 Nov 2026 Location: Saint-Ouen, J, FR
        Company: Alstom Description: Workforce Analytics and dashboards.</main>"""
        record = verified_job("Alstom", URL, html)
        self.assertIsNotNone(record)
        self.assertIn("Saint-Ouen", record["location"])
        self.assertEqual(record["publishedAt"], "2026-11-12")

    def test_never_infer_france_from_unlabelled_text_or_footer(self):
        html = """<h1>Stage Data Analyst</h1>
        <div>Role in New York, USA</div><footer>Explore France offices</footer>"""
        self.assertIsNone(verified_job("Alstom", URL, html))

    def test_rejects_non_france_or_irrelevant_role(self):
        html = """<h1>Stage - HR Data Analyst (H/F)</h1>
        <script type="application/ld+json">{
           "@type": "JobPosting", "title": "Stage - HR Data Analyst (H/F)",
           "jobLocation": {"address": {"addressCountry": "US", "addressLocality": "Boston"}}
        }</script>"""
        self.assertIsNone(verified_job("Alstom", URL, html))
        irrelevant = "<h1>Stage Comptabilité</h1><p>Location: Paris, France</p>"
        self.assertIsNone(verified_job("Alstom", URL, irrelevant))

    def test_accepts_all_three_target_directions(self):
        for title in ("Stage Computer Vision", "Stage Data Scientist", "Stage Data Analyst Power BI"):
            with self.subTest(title=title):
                html = f"<h1>{title}</h1><p>Location: Paris, France</p>"
                url = "https://jobsearch.alstom.com/job/Paris-" + title.replace(" ", "-") + "/123456/"
                record = verified_job("Alstom", url, html)
                self.assertIsNotNone(record)
                self.assertEqual(record["title"], title)
                self.assertEqual(record["location"], "Paris, France")

    def test_rejects_off_domain_redirect(self):
        html = "<h1>Stage Data Analyst</h1><p>Location: Paris, France</p>"
        self.assertIsNone(verified_job("Alstom", URL, html, "https://example.com/job/fake"))
        self.assertFalse(is_official_url("Alstom", "https://jobsearch.alstom.com.evil.com/job/x"))
        self.assertFalse(is_official_url("Bel Group", URL))

    def test_publication_date_only_from_actual_date(self):
        self.assertEqual(parse_official_date("12 novembre 2026"), "2026-11-12")
        self.assertIsNone(parse_official_date("Posted 3 days ago"))
        self.assertIsNone(parse_official_date("2029-11-12"))
        self.assertIsNone(labelled_france_location("Apply for worldwide jobs in France"))


if __name__ == "__main__":
    unittest.main()
