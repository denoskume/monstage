"""No remaining-target URL may enter the feed on a portal check alone."""
from datetime import datetime, timezone
import json
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ingest_remaining_official import (
    CONFIG, source_matches, canonical_url, extract_listing_links, verify_html,
    publication_from_page, visible_location, JobHTML, extract_rss_job_links,
    clearly_ineligible_calendar
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

    def test_sanofi_labeled_title_matches_verified_stage_not_generic_h1(self):
        s = BY_COMPANY["Sanofi"]
        url = s["seed"][0]
        page = """<html><h1>Postulez chez Sanofi à Gentilly</h1>
            <div>Gentilly, France Apprentice/Intern (Fixed Term)</div>
            <section>Intitulé du poste:stage 6 mois – data analyst audit interne
                Lieu : Gentilly A partir de : mars 2027
                À propos du poste</section>
            <p>Python, SQL et Power BI; suivi des audits du groupe.</p>
            </html>"""
        result = verify_html(s, url, page)
        self.assertIsNotNone(result)
        self.assertEqual(result["title"], "stage 6 mois – data analyst audit interne")
        self.assertEqual(result["location"], "Gentilly, France")
        self.assertIsNone(verify_html(
            s, url, page.replace("stage 6 mois – data analyst audit interne",
                                 "Technicien support CDI")))

    def test_danone_country_supplied_by_exact_flag_alt_near_job_title(self):
        s = BY_COMPANY["Danone"]
        url = s["seed"][0]
        page = ("""<h1>INTERNSHIP – Compliance Data Analyst - March 2027 (M/F)</h1>
            <img src="/flags/fr.svg" alt="France"/>
            <span>PARIS</span><span>On-site</span>
            <h2>About the offer</h2><p>Python SQL analytics</p>""")
        job = verify_html(s, url, page)
        self.assertIsNotNone(job)
        self.assertEqual(job["location"], "Paris, France")
        self.assertIsNone(verify_html(s, url,
            page.replace('alt="France"', 'alt="United States"')))
        self.assertIsNone(verify_html(s, url,
            page.replace('<img src="/flags/fr.svg" alt="France"/>', '')
            + '<footer><img alt="France"/> PARIS On-site</footer>'))

    def test_danone_explicit_job_header_country_and_city(self):
        s = BY_COMPANY["Danone"]
        url = s["seed"][0]
        page = """<h1>INTERNSHIP – Compliance Data Analyst - March 2027 (M/F)</h1>
            <p>France</p><p>PARIS</p><p>On-site</p><p>Temporary Full-Time</p>
            <h2>About the offer</h2><p>Compliance reporting and SQL data analysis.</p>"""
        good = verify_html(s, url, page)
        self.assertIsNotNone(good)
        self.assertEqual(good["location"], "Paris, France")
        self.assertIsNone(verify_html(
            s, url, page.replace("<p>France</p><p>PARIS</p>",
                                "<p>United States</p><p>NEW YORK</p>")))
        self.assertIsNone(verify_html(
            s, url, """<h1>INTERNSHIP – Compliance Data Analyst - March 2027</h1>
                        <p>New York, USA</p><footer>France PARIS On-site</footer>"""))

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

    def test_official_detail_rejection_reasons_are_explicit(self):
        s = BY_COMPANY["Air France-KLM"]
        url = s["seed"][0]
        generic = ("<h1>Détail de l'offre</h1>"
                   "<h3>Intitulé du poste</h3><p>Stage Data Analyst Logistique</p>"
                   "<h3>Métier</h3><p>Data</p>"
                   "<h3>Type de contrat</h3><p>Convention de stage</p>"
                   "<h3>Localisation du poste</h3>"
                   "<p>France, Ile-de-France, Val d'Oise (95)</p>")
        reasons = []
        self.assertIsNone(verify_html(
            s, url, generic.replace("Convention de stage", "CDI"),
            rejection_reasons=reasons))
        self.assertEqual(reasons, ["stage_contract_not_confirmed"])
        reasons = []
        self.assertIsNone(verify_html(
            s, url, generic.replace("France, Ile-de-France, Val d'Oise (95)",
                                    "United States, New York, Manhattan"),
            rejection_reasons=reasons))
        self.assertEqual(reasons, ["french_job_location_not_confirmed"])
        reasons = []
        self.assertIsNone(verify_html(
            s, url, generic.replace("Stage Data Analyst Logistique", "Vendeur Retail"),
            rejection_reasons=reasons))
        self.assertEqual(reasons, ["title_outside_plans_a_b"])

    def test_airfrance_official_metadata_not_generic_heading_is_authoritative(self):
        s = BY_COMPANY["Air France-KLM"]
        url = s["seed"][0]
        page = ("""<html><h1>Détail de l'offre</h1>
            <h2>Description du poste</h2>
            <h3>Intitulé du poste</h3>
            <p>STAGE - Data Analyst Logistique Opérationnelle Aéronautique F/H</p>
            <h3>Métier</h3><p>Systèmes d'informations - Développement</p>
            <h3>Type de contrat</h3><p>Convention de stage</p>
            <h3>Durée du contrat (mois) :</h3><p>6</p>
            <h3>Date de prise de poste souhaitée</h3><p>03/03/2027</p>
            <h2>Localisation du poste</h2><h3>Localisation du poste</h3>
            <p>France, Ile-de-France, Val d'Oise (95)</p>
            <h3>Site</h3><p>45 rue de Paris 95747 ROISSY CEDEX</p>
            </html>""")
        job = verify_html(s, url, page)
        self.assertIsNotNone(job)
        self.assertEqual(job["title"],
            "STAGE - Data Analyst Logistique Opérationnelle Aéronautique F/H")
        self.assertEqual(job["location"], "Ile-de-France, France")
        self.assertIsNone(job["publishedAt"])
        self.assertIsNone(verify_html(s, url,
            page.replace("Convention de stage", "CDI")))
        self.assertIsNone(verify_html(s, url,
            page.replace("France, Ile-de-France, Val d'Oise (95)",
                         "United States, New York, Manhattan")))
        self.assertIsNone(verify_html(s, url, page,
            "https://recrutement.airfrance.com/Pages/Offre/detailoffre.aspx?idOffre=999"))

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

    def test_safran_official_stage_detail_location_and_real_publication_date(self):
        s = BY_COMPANY["Safran"]
        self.assertEqual(len(s["seed"]), 4)
        for job_url in s["seed"]:
            with self.subTest(url=job_url):
                self.assertTrue(source_matches(s, job_url))
        page = ('''<h1>Stage Data Analyst : Modélisation et Prévision de la Demande Aéronautique</h1>
          <section>Société : Safran Ventilation Systems
          Domaine d'activité : Data
          Emplacement : Blagnac , Occitanie , France
          Type de contrat : Stage
          Diplôme requis : BAC+5
          Publié 14.11.2026
          Parlons de votre future mission : prévision de la demande
          et modèles prédictifs de production aéronautique</section>''')
        job = verify_html(s, s["seed"][0], page)
        self.assertIsNotNone(job)
        self.assertEqual(job["location"], "Blagnac, France")
        self.assertEqual(job["publishedAt"], "2026-11-14")
        self.assertIsNone(verify_html(s, s["seed"][0],
                     page.replace("Blagnac , Occitanie , France",
                                  "Blagnac , Occitanie , Allemagne")))
        self.assertIsNone(verify_html(s, s["seed"][0],
                     page.replace("Stage Data Analyst", "CDI Ingénieur logiciel")))

    def test_explicitly_incompatible_start_or_duration_never_enters_monstage(self):
        s = BY_COMPANY["L’Oréal"]
        url = s["seed"][0]
        self.assertTrue(clearly_ineligible_calendar(
            "4-MONTH INTERNSHIP - Starting January 2027 – Data Analyst & Visualisation"))
        self.assertTrue(clearly_ineligible_calendar("Stage 5 mois Data Analyst"))
        self.assertTrue(clearly_ineligible_calendar("Stage Data Analyst Janvier 2027"))
        self.assertFalse(clearly_ineligible_calendar("Stage 6 mois - Data Analyst - Février 2027"))
        self.assertFalse(clearly_ineligible_calendar("Stage - Data Analyst, disponibilité à confirmer"))
        invalid = ('<h1>4-MONTH INTERNSHIP - Starting January 2027 – Data Analyst & Visualisation</h1>'
                   '<p>Paris, France</p>')
        self.assertIsNone(verify_html(s, url, invalid))
        valid = ('<h1>6-MONTH INTERNSHIP - Starting February 2027 – Data Analyst & Visualisation</h1>'
                 '<p>Paris, France</p>')
        self.assertIsNotNone(verify_html(s, url, valid))

    def test_job_page_without_france_or_relevant_internship_rejected(self):
        s=BY_COMPANY["Sanofi"]
        link=s["seed"][0]
        self.assertIsNone(verify_html(s,link,"<h1>Stage Data Analyst</h1><p>Boston, USA</p>"))
        self.assertIsNone(verify_html(s,link,"<h1>Senior Data Analyst</h1><p>Gentilly, France</p>"))
        self.assertIsNone(verify_html(s,link,"<h1>Stage Comptabilité</h1><p>Gentilly, France</p>"))

    def test_three_cv_directions_are_eligible(self):
        s = BY_COMPANY["Sanofi"]
        for title in ("Stage Computer Vision", "Stage Data Scientist", "Stage Data Analyst Power BI"):
            with self.subTest(title=title):
                page = f"<h1>{title}</h1><p>Gentilly, France</p>"
                record = verify_html(s, s["seed"][0], page)
                self.assertIsNotNone(record)
                self.assertEqual(record["title"], title)
                self.assertEqual(record["location"], "Gentilly, France")

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
