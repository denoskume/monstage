import type { InternshipOffer } from '../../api/contract';
import { loadCvDraft, type CvDraft, type CvLanguage } from '../cv/cvStorage';
import { loadCoverLetter, type CoverLetterDraft } from '../cl/clStorage';
import { tailorCvForOffer, tailorLetterForOffer, projectSelectionForOffer } from './tailoredPackage';

export interface ApplicationDossier {
  offerId: string;
  company: string;
  title: string;
  language: CvLanguage;
  cv: CvDraft;
  letter: CoverLetterDraft;
  selectionReasons: string[];
  state: 'awaiting_review';
  preparedAt: string;
  updatedAt: string;
}
const KEY = 'monstage:application-dossiers:v1:';
const keyFor = (id: string, language: CvLanguage) => KEY + encodeURIComponent(id) + ':' + language;
export function loadApplicationDossier(id: string, language: CvLanguage): ApplicationDossier | null {
  try {
    const saved = JSON.parse(localStorage.getItem(keyFor(id, language)) || 'null') as ApplicationDossier | null;
    return saved?.offerId === id && saved?.language === language && saved.state === 'awaiting_review' ? saved : null;
  } catch { return null; }
}
export function saveApplicationDossier(dossier: ApplicationDossier): void {
  localStorage.setItem(keyFor(dossier.offerId, dossier.language), JSON.stringify({
    ...dossier, updatedAt: new Date().toISOString(), state: 'awaiting_review',
  }));
}
export function prepareApplicationDossier(offer: InternshipOffer, language: CvLanguage, replace = false): ApplicationDossier {
  const existing = loadApplicationDossier(offer.id, language);
  if (!replace && existing && existing.company === offer.company && existing.title === offer.title) return existing;
  const selection = projectSelectionForOffer(offer, language);
  const dossier: ApplicationDossier = {
    offerId: offer.id, company: offer.company, title: offer.title, language,
    cv: tailorCvForOffer(offer, language),
    letter: tailorLetterForOffer(offer, language),
    selectionReasons: selection.map(item => item.reason),
    state: 'awaiting_review', preparedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  saveApplicationDossier(dossier);
  return dossier;
}
export function updateApplicationCv(id: string, language: CvLanguage, cv: CvDraft): void {
  const dossier = loadApplicationDossier(id, language);
  if (dossier) saveApplicationDossier({ ...dossier, cv });
}
export function updateApplicationLetter(id: string, language: CvLanguage, letter: CoverLetterDraft): void {
  const dossier = loadApplicationDossier(id, language);
  if (dossier) saveApplicationDossier({ ...dossier, letter });
}
