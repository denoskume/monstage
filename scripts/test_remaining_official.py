"""No remaining-target URL may enter the feed on a portal check alone."""
from datetime import datetime, timezone
import json
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ingest_remaining_official import (
    CONFIG, source_matches, canonical_url, extract_listing_links, verify_html,
    publication_from_page, visible_location, JobHTML, extract_rss_job_links
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

    def test_dassault_uses_employer_talentsoft_exact_host(self):
        s = BY_COMPANY["Dassault Aviation"]
        self.assertEqual(s["host"], "dassault-aviation-cand.talent-soft.com")
        self.assertEqual(len(s["rss"]), 1)
        self.assertTrue("Rss_Contract=4161" in s["rss"][0])
        self.assertFalse(source_matches(s, "https://dassault-aviation-cand.talent-soft.com.evil.net/offre-de-emploi/emploi-stage-data_15827.aspx"))
        self.assertFalse(source_matches(s, "https://dassault-aviation-cand.talent-soft.com/Pages/Offre/detailoffre.aspx"))
        self.assertTrue(source_matches(s, s["seed"][0]))

    def test_dassault_rss_filters_cross_domain_and_deduplicates(self):
        s = BY_COMPANY["Dassault Aviation"]
        xml = """<rss version="2.0"><channel>
            <item><title>Stage Modèles IA</title>
              <link>https://dassault-aviation-cand.talent-soft.com/offre-de-emploi/emploi-stage-modeles-d-ia_15827.aspx</link></item>
            <item><title>Stage Modèles IA duplicate</title>
              <link>https://dassault-aviation-cand.talent-soft.com/Pages/Offre/detailoffre.aspx?idOffre=15827&amp;LCID=1036</link></item>
            <item><title>Stage frauduleux</title>
              <link>https://dassault-aviation-cand.talent-soft.com.evil.net/offre-de-emploi/emploi-stage-ia_9999.aspx</link></item>
        </channel></rss>"""
        jobs = extract_rss_job_links(s, s["rss"][0], xml)
        self.assertEqual(len(jobs), 1)
        self.assertIn("15827.aspx", jobs[0])

    def test_dassault_talentsoft_stage_metadata_and_location(self):
        s = BY_COMPANY["Dassault Aviation"]
        page = """<html><h1>Stage : Intelligence Artificielle (IA) au service de la maintenance aéronautique F/H</h1>
           <p>Projet de machine learning et LLM pour la maintenance des Falcon.</p>
           <section>Informations générales Localisation France, Nouvelle Aquitaine, 33 - Mérignac
             Domaine professionnel / métier Conception des systèmes
             Type de contrat Stage Durée du stage 6 mois Niveau du stage M2/Ingé3</section></html>"""
        url = "https://dassault-aviation-cand.talent-soft.com/offre-de-emploi/emploi-stage-intelligence-artificielle-ia-au-service-de-la-maintenance-aeronautique-f-h_15900.aspx"
        result = verify_html(s, url, page)
        self.assertIsNotNone(result)
        self.assertEqual(result["location"], "Mérignac, France")
        self.assertIn("Intelligence Artificielle", result["title"])
        self.assertIsNone(result["publishedAt"])
        self.assertIsNone(verify_html(s, url, page.replace("Type de contrat Stage", "Type de contrat CDI")))

    def test_sanofi_location_next_to_h1_not_page_header(self):
        s = BY_COMPANY["Sanofi"]
        url = s["seed"][0]
        page = ("<nav>" + "Welcome Careers " * 160 + "</nav>"
                "<h1>stage 6 mois – data analyst audit interne</h1>"
                "<p>Gentilly, France Apprentice/Intern (Fixed Term)</p>"
                "<section>Python SQL Power BI and dashboards</section>")
        result = verify_html(s, url, page)
        self.assertIsNotNone(result)
        self.assertEqual(result["location"], "Gentilly, France")
        self.assertIsNone(verify_html(s, url, page.replace("Gentilly, France", "Boston, USA")
                                      + "<footer>Location: Paris, France</footer>"))

    def test_airfrance_talentsoft_location_below_navigation(self):
        s = BY_COMPANY["Air France-KLM"]
        url = s["seed"][0]
        page = ("<nav>" + "Connexion espace candidat " * 140 + "</nav>"
                "<h1>Stage Data Analyst - Analyse de données</h1>"
                "<section>Localisation France, Ile de France, 95 - Roissy "
                "Domaine professionnel / métier Data Type de contrat Stage</section>")
        result = verify_html(s, url, page)
        self.assertIsNotNone(result)
        self.assertEqual(result["location"], "Roissy, France")

    def test_dassault_public_url_variants_share_stable_job_id(self):
        s = BY_COMPANY["Dassault Aviation"]
        a = "https://dassault-aviation-cand.talent-soft.com/Pages/Offre/detailoffre.aspx?LCID=1036&idOffre=15827&idOrigine=502"
        b = "https://dassault-aviation-cand.talent-soft.com/offre-de-emploi/emploi-stage-modeles-d-ia_15827.aspx"
        self.assertEqual(canonical_url(s, a), canonical_url(s, b))

    def test_airfrance_official_stage_contract_rss(self):
        s = BY_COMPANY["Air France-KLM"]
        self.assertEqual(s["rss"][0], "https://recrutement.airfrance.com/handlers/offerRss.ashx?LCID=1036&Rss_Contract=3442")
        xml = """<rss><channel>
          <item><title>Stage – Methods &amp; Data Analyst F/H</title>
            <link>https://recrutement.airfrance.com/offre-de-emploi/emploi-stage-methods-data-analyst-f-h_25738.aspx</link></item>
          <item><title>Stage – Methods &amp; Data Analyst F/H</title>
            <link>https://recrutement.airfrance.com/Pages/Offre/detailoffre.aspx?LCID=1036&amp;idOffre=25738</link></item>
          <item><title>Fake stage</title>
            <link>https://recrutement.airfrance.com.evil.net/offre-de-emploi/emploi-stage-data_12.aspx</link></item>
        </channel></rss>"""
        urls = extract_rss_job_links(s, s["rss"][0], xml)
        self.assertEqual(len(urls), 1)
        self.assertIn("25738", urls[0])
        self.assertEqual(extract_rss_job_links(s, s["rss"][0].replace("3442", "3441"), xml), [])

    def test_airfrance_talentsoft_slug_shares_same_job_id_as_aspx_detail(self):
        s = BY_COMPANY["Air France-KLM"]
        long_url = s["seed"][1]
        slug = "https://recrutement.airfrance.com/offre-de-emploi/emploi-stage-methods-data-analyst-f-h_25738.aspx"
        self.assertTrue(source_matches(s, slug))
        self.assertEqual(canonical_url(s, long_url), canonical_url(s, slug))
        self.assertFalse(source_matches(s, "https://recrutement.airfrance.com/Pages/Offre/detailoffre.aspx"))

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
