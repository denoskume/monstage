import type { InternshipOffer } from '../../api/contract';
import { withSavedEdfOffer } from './edfSavedOffer';
import { THALES_DATA_DOSSIER_ID, THALES_DATA_TITLE } from './thalesDataDossier';

// Explicitly saved by the user. Keep independent of the 30-company automated feed.
export const THALES_DATA_APPLICATION_URL = 'https://careers.thalesgroup.com/fr/fr/job/R0343178';

export const thalesSavedOffer: InternshipOffer = {
  id: THALES_DATA_DOSSIER_ID,
  company: 'Thales Alenia Space',
  title: THALES_DATA_TITLE,
  domain: 'Spatial — IA appliquée et qualité des données',
  city: 'Cannes',
  region: "Provence-Alpes-Côte d'Azur",
  m2Fit: 'Oui',
  start: 'À confirmer (souhait : février 2027)',
  duration: '6 mois',
  compensation: "Gratification selon niveau d'études",
  skills: ['Python', 'Analyse de données', 'Qualité des données', 'Détection d’anomalies', 'Automatisation', 'Machine Learning', 'Reporting'],
  publishedAt: '2026-10-22',
  offerStatus: 'Disponibilité à vérifier',
  applicationStatus: 'À candidater',
  nextAction: "Vérifier l'ouverture de R0343178 sur Thales Carrières, examiner les documents, puis postuler si l'offre est active",
  applicationUrl: THALES_DATA_APPLICATION_URL,
  shortlist: true,
  appliedAt: null,
  followUpAt: null,
  specialization: 'Data Science · IA industrielle et qualité des données',
  technicalFit: null,
  decisionScore: null,
  priority: 'A',
  freshness: null,
  verifiedAt: null,
  sourceQuality: 'Annonce Thales R0343178 — disponibilité à revérifier',
  actionLevel: null,
  calendarFit: 'Date de début non précisée dans l’annonce',
  confidence: null,
  relevance: 'Contrôles de cohérence, données incomplètes, automatisation et aide à la décision',
  gaps: 'Date de début et disponibilité effective de la référence R0343178 à confirmer',
};

export function withSavedManualOffers(feed: InternshipOffer[]): InternshipOffer[] {
  const withEdf = withSavedEdfOffer(feed);
  // Prefer the stable manually saved record over a duplicate discovery-feed
  // record with a different numeric id, so the saved button and dossier work.
  const unique = withEdf.filter(offer =>
    offer.id !== thalesSavedOffer.id &&
    !(offer.company.toLowerCase().includes('thales') &&
      ((offer.applicationUrl || '').includes('R0343178') || offer.title === thalesSavedOffer.title))
  );
  return [...unique, thalesSavedOffer];
}
