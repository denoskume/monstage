"""Per-company evidence report for the strict 30 MonStage target groups.

Portal HTTP 200 != an extracted vacancy. A configured connector != verified
feed coverage. Publication date != last time we visited the listing.
This report contains aggregate counts only, never personal application data.
"""
from collections import Counter
from datetime import datetime, timedelta, timezone
import json
import os
from pathlib import Path
import re
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "artifacts"
TARGETS = ROOT / "scripts" / "target_career_sources.json"

# Configured provider IDs are grounded in allowlists enforced by Apps Script.
ATS_COMPANIES = {
    "workday": {
        "ag": "Airbus", "thales": "Thales", "evoyageurs": "SNCF",
        "alliancewd": "Renault Group", "airliquidehr": "Air Liquide",
        "ratp": "RATP", "valeo": "Valeo", "michelinhr": "Michelin",
        "gehc": "GE HealthCare",
    },
    "smartrecruiters": {"veoliaenvironnementsa": "Veolia"},
    "official": {
        "alstom": "Alstom", "nestle": "Nestlé", "lactalis": "Lactalis",
        "bel": "Bel Group", "essilor": "EssilorLuxottica",
        "engie": "ENGIE", "forvia": "FORVIA HELLA",
        "safran": "Safran", "dassault": "Dassault Aviation",
        "airfrance": "Air France-KLM", "siemensmobility": "Siemens Mobility",
        "hitachirail": "Hitachi Rail", "stellantis": "Stellantis",
        "danone": "Danone", "sanofi": "Sanofi",
        "siemenshealthineers": "Siemens Healthineers",
        "schneider": "Schneider Electric", "saintgobain": "Saint-Gobain",
        "edf": "EDF", "loreal": "L’Oréal",
    },
}


def load_optional(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def publication_date(value):
    s = str(value or "").strip()
    m = re.match(r"^(\d{4}-\d{2}-\d{2})(?:$|T|\s)", s)
    if m:
        try:
            return datetime.strptime(m.group(1), "%Y-%m-%d").date()
        except ValueError:
            return None
    m = re.match(r"^(\d{1,2})/(\d{1,2})/(\d{4})(?:$|\s)", s)
    if m:
        try:
            return datetime(int(m.group(3)), int(m.group(2)), int(m.group(1))).date()
        except ValueError:
            return None
    return None


def last_verified(value):
    try:
        moment = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return moment if moment.tzinfo else moment.replace(tzinfo=timezone.utc)
    except (ValueError, TypeError):
        return None


def saved_official_counts(offers, now):
    counts = {}
    for row in offers:
        rid = str(row.get("id") or "").lower()
        bits = rid.split(":", 2)
        if len(bits) != 3:
            continue
        provider, source_id, _ = bits
        company = ATS_COMPANIES.get(provider, {}).get(source_id)
        if not company:
            continue
        c = counts.setdefault(company, {
            "saved_official": 0, "verified_48h": 0, "published_7d": 0,
            "by_provider": Counter()
        })
        c["saved_official"] += 1
        c["by_provider"][provider] += 1
        verified = last_verified(row.get("verifiedAt"))
        if verified and now - timedelta(hours=48) <= verified <= now:
            c["verified_48h"] += 1
        publication = publication_date(row.get("publishedAt"))
        if publication and now.date() - timedelta(days=7) <= publication <= now.date():
            c["published_7d"] += 1
    return counts


def report(targets, audit, sf, page_details, offers, now, remaining=None):
    names = [item["name"] for item in targets.get("companies", [])]
    if len(names) != 30 or len(set(names)) != 30:
        raise ValueError("The target company list must contain EXACTLY 30 unique groups")
    lookup = {item.get("company"): item for item in audit.get("companies", [])}
    sf_lookup = {item.get("company"): item for item in sf.get("companies", [])}
    verified_pages = page_details.get("companies", {})
    remaining = remaining or {}
    remaining_sources = {item.get("company"): item for item in remaining.get("sources", [])}
    saved = saved_official_counts(offers, now)
    configured = {}
    for kind, sources in ATS_COMPANIES.items():
        for _, company in sources.items():
            configured.setdefault(company, []).append(kind)

    companies = []
    for name in names:
        a = lookup.get(name, {})
        s = sf_lookup.get(name, {})
        detail = verified_pages.get(name, {})
        remaining_detail = remaining_sources.get(name, {})
        c = saved.get(name, {})
        integrations = sorted(configured.get(name, []))
        fresh = c.get("verified_48h", 0)
        if fresh:
            status = "recent_official_listing_saved"
        elif integrations:
            status = "connector_configured_no_recent_saved_listing"
        elif a.get("portal", {}).get("ok"):
            status = "portal_only_no_ingestion"
        else:
            status = "no_confirmed_job_feed"
        companies.append({
            "company": name,
            "status": status,
            "portal_reachable": bool(a.get("portal", {}).get("ok")),
            "configured_integrations": integrations,
            "successfactors_searches_ok": int(s.get("queries_reachable") or 0),
            "individual_successfactors_leads": int(s.get("individual_leads") or 0),
            "official_pages_verified": int(detail.get("verified_details") or 0) +
                int(remaining_detail.get("verified_fr_internships") or 0),
            "listing_pages_reachable": int(remaining_detail.get("listing_pages_reachable") or 0),
            "individual_candidate_urls_checked": int(remaining_detail.get("individual_job_urls") or 0),
            "saved_official": c.get("saved_official", 0),
            "verified_48h": fresh,
            "published_7d": c.get("published_7d", 0),
            "provider_rows": dict(c.get("by_provider", {})),
        })
    summary = {
        "checked_at_utc": now.isoformat(),
        "target_groups": len(names),
        "groups_attempted_in_portal_audit": audit.get("summary", {}).get("groups_attempted"),
        "groups_with_a_configured_ingestion": sum(bool(x["configured_integrations"]) for x in companies),
        "groups_without_configured_ingestion": sum(not x["configured_integrations"] for x in companies),
        "groups_with_official_listings_verified_48h": sum(x["verified_48h"] > 0 for x in companies),
        "official_rows_saved": sum(x["saved_official"] for x in companies),
        "remaining_13_with_verified_job_detail": sum(int(x["official_pages_verified"] > 0)
            for x in companies if x["company"] in set(
                item.get("company") for item in remaining.get("sources", []))),
        "remaining_13_with_listing_page_reachable": sum(int(x["listing_pages_reachable"] > 0)
            for x in companies),
        "official_rows_verified_48h": sum(x["verified_48h"] for x in companies),
        "official_rows_published_7d": sum(x["published_7d"] for x in companies),
        "full_30_group_ats_coverage_verified": False,
        "notes": [
            "A successfully fetched career homepage is not a verified jobs feed.",
            "Configured ingestion does not guarantee complete discovery of all open vacancies.",
            "All 30 employer configurations may exist even if most source listings are inaccessible or unverified.",
            "Publication counts only use employer-supplied publication dates, never last-verified time.",
            "An employer with zero saved listings may still have open roles outside current queries.",
        ],
    }
    return {"summary": summary, "companies": companies}


def get_backend_offers():
    endpoint, secret = os.environ.get("APPS_SCRIPT_URL"), os.environ.get("APPS_SCRIPT_GATEWAY_SECRET")
    if not endpoint or not secret:
        raise RuntimeError("Backend gateway URL or secret missing")
    body = json.dumps({"gatewaySecret": secret, "action": "offers"}).encode("utf-8")
    request = urllib.request.Request(endpoint, data=body, method="POST", headers={
        "Accept": "application/json", "Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=90) as response:
        payload = json.load(response)
    if payload.get("source") != "Stage Intelligence France" or not isinstance(payload.get("offers"), list):
        raise RuntimeError("The backend did not return a valid persisted offer list")
    return payload["offers"]


def main():
    targets = load_optional(TARGETS)
    audit = load_optional(ART / "career-source-coverage.json")
    sf = load_optional(ART / "career-successfactors-leads.json")
    official_pages = load_optional(ART / "career-verified-official-jobs.json")
    remaining_pages = load_optional(ART / "career-remaining-13-verified.json")
    payload = report(targets, audit, sf, official_pages, get_backend_offers(),
                     datetime.now(timezone.utc), remaining=remaining_pages)
    ART.mkdir(exist_ok=True)
    (ART / "ats-health-30.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    m = payload["summary"]
    lines = [
        "# MonStage — Couverture réelle des 30 entreprises",
        "",
        f"- Portails audités : {m['groups_attempted_in_portal_audit']}/30",
        f"- Connecteurs configurés : {m['groups_with_a_configured_ingestion']}/30 (ne prouve pas exhaustivité)",
        f"- Sans adaptateur configuré : {m['groups_without_configured_ingestion']}/30",
        f"- Parmi les 13 nouveaux adaptateurs, avec fiche d'offre effectivement vérifiée : {m['remaining_13_with_verified_job_detail']}/13",
        f"- Entreprises avec offre officielle revérifiée <48h : {m['groups_with_official_listings_verified_48h']}/30",
        f"- Offres officielles sauvegardées : {m['official_rows_saved']} (pas toutes récentes)",
        "",
        "| Entreprise | Intégration | Portail | Offres sauvées | Revérifiées <48h | Publication 7j |",
        "|---|---|---|---:|---:|---:|",
    ]
    for row in payload["companies"]:
        lines.append(
            f"| {row['company']} | {', '.join(row['configured_integrations']) or 'Aucune'}"
            f" | {'Oui' if row['portal_reachable'] else 'Non vérifié'}"
            f" | {row['saved_official']} | {row['verified_48h']} | {row['published_7d']} |")
    lines += ["", "Note : 30/30 portails testés ne signifie jamais 30/30 flux d'offres effectivement analysés."]
    (ART / "ats-health-30.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(m, ensure_ascii=False))
    if m["groups_without_configured_ingestion"]:
        print("::warning::MonStage: " + str(m["groups_without_configured_ingestion"]) +
              "/30 entreprises ciblées n'ont toujours pas de connecteur d'annonces opérationnel")


if __name__ == "__main__":
    main()
