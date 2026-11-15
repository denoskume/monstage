"""No remaining-target URL may enter the feed on a portal check alone."""
from datetime import datetime, timezone
import json
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ingest_remaining_official import (
    CONFIG, source_matches, canonical_url, extract_listing_links, verify_html,
    publication_from_page, visible_location, JobHTML
)

REGISTRY=json.loads(CONFIG.read_text(encoding="utf-8"))["sources"]
BY_COMPANY={s["company"]:s for s in REGISTRY}


class RemainingOfficialTests(unittest.TestCase):
    def test_strict_thirteen_unique_group_configuration(self):
        self.assertEqual(len(REGISTRY),13)
        self.assertEqual(len(BY_COMPANY),13)
        names=set(BY_COMPANY)
        self.assertIn("Air France-KLM",names)
        self.assertIn("Saint-Gobain",names)
        self.assertIn("Siemens Mobility",names)
        self.assertIn("Siemens Healthineers",names)
        self.assertIn("L’Oréal",names)

    def test_seed_urls_all_use_exact_hostname_and_valid_individual_job(self):
        for s in REGISTRY:
            for link in s["seed"]:
                with self.subTest(company=s["company"],link=link):
                    self.assertTrue(source_matches(s,link))
                    self.assertTrue(canonical_url(s,link))

    def test_block_cross_company_and_malicious_redirects(self):
        s=BY_COMPANY["Air France-KLM"]
        link=s["seed"][0]
        self.assertFalse(source_matches(s,"https://recrutement.airfrance.com.evil.net/Pages/Offre/detailoffre.aspx?idOffre=77"))
        self.assertFalse(source_matches(s,"https://recrutement.airfrance.com/Pages/Offre/detailoffre.aspx"))
        self.assertFalse(source_matches(s,"http://recrutement.airfrance.com/Pages/Offre/detailoffre.aspx?idOffre=1"))
        self.assertIsNone(verify_html(s,link,'<h1>Stage Data Analyst</h1><p>Location: Paris, France</p>',
                     "https://example.com/job/fake"))

    def test_air_france_identity_keeps_offer_number(self):
        s=BY_COMPANY["Air France-KLM"]
        first=canonical_url(s,s["seed"][0])
        second=canonical_url(s,s["seed"][0].replace("idOffre=25467","idOffre=25468"))
        self.assertNotEqual(first,second)
        self.assertEqual(first,"https://recrutement.airfrance.com/Pages/Offre/detailoffre.aspx?idOffre=25467")

    def test_verified_stellantis_schema_is_accepted_only_for_france(self):
        s=BY_COMPANY["Stellantis"]
        html='''<h1>STAGE : Purchasing Data Analyst</h1>
        <script type="application/ld+json">{
          "@type":"JobPosting", "title":"STAGE : Purchasing Data Analyst",
          "datePosted":"2026-11-12",
          "jobLocation":{"address":{"addressCountry":"FR","addressLocality":"Poissy"}}
        }</script>'''
        result=verify_html(s,s["seed"][0],html)
        self.assertIsNotNone(result)
        self.assertEqual(result["location"],"Poissy, France")
        self.assertEqual(result["publishedAt"],"2026-11-12")
        self.assertEqual(len(result["id"]),20)
        self.assertIsNone(verify_html(s,s["seed"][0],html.replace('"FR"','"US"')))

    def test_hitachi_requires_rail_division_not_parent_brand(self):
        s=BY_COMPANY["Hitachi Rail"]
        html="<h1>Stage Data Analyst</h1><div>Location: Paris, France</div>"
        self.assertIsNone(verify_html(s,s["seed"][0],html))
        self.assertIsNotNone(verify_html(s,s["seed"][0],html+"<div>Hitachi Rail RCS France SAS</div>"))

    def test_job_page_without_france_or_relevant_internship_rejected(self):
        s=BY_COMPANY["Sanofi"]
        link=s["seed"][0]
        self.assertIsNone(verify_html(s,link,"<h1>Stage Data Analyst</h1><p>Boston, USA</p>"))
        self.assertIsNone(verify_html(s,link,"<h1>Senior Data Analyst</h1><p>Gentilly, France</p>"))
        self.assertIsNone(verify_html(s,link,"<h1>Stage Data Scientist</h1><p>Gentilly, France</p>"))

    def test_extracts_only_official_individual_job_links(self):
        s=BY_COMPANY["Stellantis"]
        listing='''<a href="/job/23942476/stage-purchasing-data-analyst-green-campus-poissy-fr/">Stage Purchasing Data Analyst</a>
        <a href="https://careers.stellantis.com.evil.example/job/1/stage-data-analyst/">Stage Data Analyst</a>
        <a href="/jobs/">Stage Data Analyst</a>'''
        jobs=extract_listing_links(s,"https://careers.stellantis.com/",listing)
        self.assertEqual(len(jobs),1)
        self.assertIn("23942476",jobs[0])

    def test_publication_date_only_from_labeled_employer_data(self):
        s=BY_COMPANY["Saint-Gobain"]
        page="""<h1>Stage - Data Analyst (H/F)</h1>
          <div>Location: Nantes, France</div><p>Date de publication : 14/11/2026</p>"""
        result=verify_html(s,s["seed"][0],page)
        self.assertIsNotNone(result)
        self.assertEqual(result["publishedAt"],"2026-11-14")
        self.assertIsNone(verify_html(s,s["seed"][0],page.replace("Nantes, France","Nantes (44)")))


if __name__ == "__main__":
    unittest.main()
