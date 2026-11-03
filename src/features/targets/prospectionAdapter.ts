import type { InternshipOffer } from '../../api/contract';
import { normalize, dateKey } from './targets';
export const PROSPECTION_EVENT = 'monstage:prospection-changed';

/** The rejected 25 October Safran.AI spontaneous application has two display titles
 * in the historical sheet and local prospecting archive. This is one application. */
function isKnownSafranAiApplication(company: string, title: string, date?: string | null): boolean {
  const firm = normalize(company).replace(/[^a-z0-9]/g, '');
  const role = normalize(title).replace(/[^a-z0-9]+/g, ' ').trim();
  const originalTitle = role === 'stage de fin d etudes machine learning et computer vision'
    || role === 'candidature spontanee stage machine learning computer vision';
  return firm === 'safranai' && originalTitle && (!date || dateKey(date) === '2026-10-25');
}
export function readProspectionOffers(): InternshipOffer[] {
  try {
    const rows: unknown = JSON.parse(localStorage.getItem('monstage.prospection.v1') || '[]');
    if (!Array.isArray(rows)) return [];
    return rows.filter(row => row && typeof row.id === 'string' && typeof row.company === 'string' && typeof row.role === 'string').map(row => ({
      id: 'prospection:' + row.id, company: row.company, title: row.role,
      domain: row.team || '', specialization: null, skills: [], city: row.site || null,
      applicationStatus: isKnownSafranAiApplication(row.company, row.role, row.date) ? 'Refus' : row.status === 'Entretien' ? 'Entretien' : row.status === 'Candidature envoyée' ? 'Candidature envoyée' : row.status === 'Relance prévue' ? 'Relance' : row.status === 'Refus' ? 'Refus' : row.status === 'Terminé' ? 'Abandonné' : 'À candidater',
      // A contact date is not evidence that an application was sent.
      appliedAt: isKnownSafranAiApplication(row.company, row.role, row.date) ? (row.date || '2026-10-25') : ['Candidature envoyée', 'Entretien', 'Relance prévue'].includes(row.status) ? row.date || null : null,
      followUpAt: isKnownSafranAiApplication(row.company, row.role, row.date) || ['Terminé','Refus'].includes(row.status) ? null : row.followUp || null,
      nextAction: isKnownSafranAiApplication(row.company, row.role, row.date) ? [row.notes, 'Refus du 02/11/2026 confirmé ; ne pas relancer cette candidature.'].filter(Boolean).join('\n\n') : row.notes || null, applicationUrl: null, region: null, m2Fit: null,
      start: null, duration: null, compensation: null, publishedAt: null, offerStatus: null,
      shortlist: false, technicalFit: null, decisionScore: null, priority: '', freshness: null,
      verifiedAt: null, sourceQuality: null, actionLevel: null, calendarFit: null,
      confidence: null, relevance: null, gaps: null,
    }));
  } catch { return []; }
}
export function combineDossiers(remote: InternshipOffer[], local: InternshipOffer[]) {
  const key = (o: InternshipOffer) => [normalize(o.company).trim(), normalize(o.title).trim(), dateKey(o.appliedAt)].join('|');
  const remoteKeys = new Set(remote.map(key));
  const hasVerifiedSafranAiRecord = remote.some(offer => offer.id === 'EXT-SAFRANAI-20261025');
  return [...remote, ...local.filter(offer => {
    // The locally stored draft and the confirmed Lever submission use
    // different titles. Do not count them as two separate candidatures.
    if (hasVerifiedSafranAiRecord && offer.id.startsWith('prospection:') &&
        isKnownSafranAiApplication(offer.company, offer.title, offer.appliedAt)) return false;
    return !remoteKeys.has(key(offer));
  })];
}
