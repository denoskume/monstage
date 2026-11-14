"""Deterministic checks for employer-verified public vacancy URLs."""
import unittest

from discover_official_jobs import candidate_plans, extract_official_jobs, dedupe_official_leads


class OfficialDiscoveryTests(unittest.TestCase):
    def test_safran_data_internship_on_actual_official_job_url(self):
        company = {"name": "Safran", "domain": "safran-group.com"}
        html = ('<a href="/fr/offres/france/tarnos/stage-data-analyst-cockpit-189829">'
                'Stage Data Analyst : Développement d’un cockpit digital</a>')
        rows = extract_official_jobs(company, "https://www.safran-group.com/fr/offres", html)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["plan"], "B")
        self.assertEqual(rows[0]["status"], "REVALIDATION_REQUIRED")

    def test_alstom_computer_vision_internship_is_plan_a(self):
        company = {"name": "Alstom", "domain": "alstom.com"}
        rows = extract_official_jobs(
            company, "https://jobsearch.alstom.com/",
            '<a href="/job/Villeurbanne-Stage-Computer-Vision/1448328133/">'
            'Stage 6 mois - Computer Vision & Inspections automatisées</a>')
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["plan"], "A")

    def test_nestle_cross_domain_official_jobdetail_is_allowed(self):
        company = {"name": "Nestlé", "domain": "nestle.fr"}
        rows = extract_official_jobs(
            company, "https://www.nestle.fr/emplois",
            '<a href="https://jobdetails.nestle.com/job/Issy-stage-Business-Analyst/1451777833/">'
            'Stage Business Analyst Supply Chain</a>')
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["plan"], "B")

    def test_non_official_jobboards_are_rejected(self):
        company = {"name": "Safran", "domain": "safran-group.com"}
        rows = extract_official_jobs(
            company, "https://www.safran-group.com/fr/offres",
            '<a href="https://www.indeed.com/viewjob?jk=123">Stage Data Analyst</a>'
            '<a href="https://www.safran-group.com/fr/offres">Stage Data Analyst</a>')
        self.assertEqual(rows, [])

    def test_exclude_finance_and_deduplicate_same_job(self):
        company = {"name": "Safran", "domain": "safran-group.com"}
        html = ('<a href="/fr/offres/france/ville/stage-data-analyst-1">'
                'Stage Data Analyst pour le contrôle de gestion finance</a>'
                '<a href="/fr/offres/france/ville/stage-data-analyst-2?ref=1">'
                'Stage Data Analyst reporting</a>'
                '<a href="/fr/offres/france/ville/stage-data-analyst-2?ref=2">'
                'Stage Data Analyst reporting</a>')
        rows = extract_official_jobs(company, "https://www.safran-group.com/fr/offres", html)
        self.assertEqual(len(dedupe_official_leads(rows)), 1)


if __name__ == "__main__":
    unittest.main()
