import type { InternshipOffer } from '../../api/contract';
import { EDF_EOD_DOSSIER_ID, EDF_EOD_TITLE } from './edfEodDossier';

// A manually selected offer is not an automatically discovered feed result.
// Keep it in the user's saved area even if it is absent from the 30-group feed.
export const EDF_EOD_APPLICATION_URL = 'https://www.edf.fr/edf-recrute/offre/detail/2026-185820?idOrigine=35052';

export const edfSavedOffer: InternshipOffer = {
  id: EDF_EOD_DOSSIER_ID,
  company: 'EDF',
  title: EDF_EOD_TITLE,
  domain: 'Énergie — Prévision de la consommation',
  city: 'Saint-Denis',
  region: 'Île-de-France',
  m2Fit: 'Oui',
  start: 'Février 2027',
  duration: '6 mois',
  compensation: 'Selon convention et niveau d’études',
  skills: ['Python', 'SQL', 'Modélisation', 'Analyse de données', 'Prévision', 'Optimisation des flux'],
  publishedAt: '2026-11-03',
  offerStatus: 'Publiée',
  applicationStatus: 'À candidater',
  nextAction: 'Vérifier le CV et la lettre, puis postuler sur EDF Recrute',
  applicationUrl: EDF_EOD_APPLICATION_URL,
  shortlist: true,
  appliedAt: null,
  followUpAt: null,
  specialization: 'Data Science · Prévision & modélisation',
  technicalFit: null,
  decisionScore: null,
  priority: 'A',
  freshness: null,
  verifiedAt: null,
  sourceQuality: 'Offre officielle EDF',
  actionLevel: null,
  calendarFit: 'Dès février 2027',
  confidence: null,
  relevance: null,
  gaps: null,
};

export function withSavedEdfOffer(feed: InternshipOffer[]): InternshipOffer[] {
  return feed.some(offer => offer.id === edfSavedOffer.id) ? feed : [...feed, edfSavedOffer];
}
