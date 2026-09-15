const exactTranslations: Record<string, string> = {
  'À candidater': 'To apply',
  'Candidature envoyée': 'Application sent',
  'Relance': 'Follow-up',
  'Entretien': 'Interview',
  'Test technique': 'Technical test',
  'Offre reçue': 'Offer received',
  'Refus': 'Rejected',
  'Abandonné': 'Withdrawn',
  'Vérifié <24h': 'Verified <24h',
  'Vérifié 24–72h': 'Verified 24–72h',
  'Vérifié cette semaine': 'Verified this week',
  'À recontrôler': 'Recheck required',
  'À revalider': 'Revalidation required',
  'Revalidation requise': 'Revalidation required',
  'Oui': 'Yes',
  'Oui probable': 'Likely yes',
  'À vérifier': 'Needs verification',
  'À confirmer': 'To confirm',
  'Non précisé': 'Not specified',
  'NC': 'Not specified',
  'Officiel / direct': 'Official / direct',
  'Agrégateur / réseau': 'Aggregator / network',
  'Haute': 'High',
  'Moyenne': 'Medium',
  'Faible': 'Low',
  'CANDIDATER 24H': 'Apply within 24h',
  'CANDIDATER 72H': 'Apply within 72h',
  'BACKLOG': 'Backlog',
  '✅ Probable': '✅ Likely',
  '⚠️ À vérifier': '⚠️ Needs verification',
  '⚠️ À confirmer': '⚠️ To confirm',
  'PFE / à confirmer': 'Final-year / to confirm',
  'Stage': 'Internship',
  'Stage PFE': 'Final-year internship',
  'Annonce récente': 'Recently posted',
  'Annonce en ligne': 'Listing online',
  'Annonce encore visible; publication ancienne': 'Listing still visible; older posting',
  'Vision par ordinateur': 'Computer Vision',
  "Traitement d'images": 'Image Processing',
};

const monthTranslations: Record<string, string> = {
  Janvier: 'January', Février: 'February', Mars: 'March', Avril: 'April', Mai: 'May', Juin: 'June',
  Juillet: 'July', Août: 'August', Septembre: 'September', Octobre: 'October', Novembre: 'November', Décembre: 'December',
};

export function displayValue(value: string | null): string | null {
  if (value === null) return null;
  const exact = exactTranslations[value];
  if (exact) return exact;

  let translated = value;
  for (const [fr, en] of Object.entries(monthTranslations)) {
    translated = translated.replace(new RegExp(`\\b${fr}\\b`, 'g'), en);
  }
  translated = translated
    .replace(/(\d+)\s*[–-]\s*(\d+)\s+mois\b/gi, '$1–$2 months')
    .replace(/(\d+)\s+mois\b/gi, '$1 months')
    .replace(/€\/mois\b/gi, '€/month');

  return translated;
}
