import type { InternshipOffer } from '../../api/contract';
import { normalize, dateKey } from './targets';
export const PROSPECTION_EVENT = 'monstage:prospection-changed';
export function readProspectionOffers(): InternshipOffer[] {
  try {
    const rows: unknown = JSON.parse(localStorage.getItem('monstage.prospection.v1') || '[]');
    if (!Array.isArray(rows)) return [];
    return rows.filter(row => row && typeof row.id === 'string' && typeof row.company === 'string' && typeof row.role === 'string').map(row => ({
      id: 'prospection:' + row.id, company: row.company, title: row.role,
      domain: row.team || '', specialization: null, skills: [], city: row.site || null,
      applicationStatus: row.status === 'Entretien' ? 'Entretien' : row.status === 'Candidature envoyée' ? 'Candidature envoyée' : row.status === 'Relance prévue' ? 'Relance' : row.status === 'Terminé' ? 'Abandonné' : 'À candidater',
      // A contact date is not evidence that an application was sent.
      appliedAt: ['Candidature envoyée', 'Entretien', 'Relance prévue'].includes(row.status) ? row.date || null : null,
      followUpAt: row.status === 'Terminé' ? null : row.followUp || null,
      nextAction: row.notes || null, applicationUrl: null, region: null, m2Fit: null,
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
  return [...remote, ...local.filter(o => !remoteKeys.has(key(o)))];
}
