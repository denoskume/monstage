import type { InternshipOffer } from '../../api/contract';
import { getOfferPlan, isDataAnalystMission, isVisionMission, targetCompany } from '../../../../../packages/shared/searchScope';
import { sectors, dateKey, followUpDue, matchesCompany } from '../targets/targets';

export type DashboardPlan = 'all' | 'A' | 'B';
export type DashboardStatus = 'À candidater' | 'À qualifier' | 'À vérifier' | 'Envoyée' | 'Relance' | 'Réponse' | 'Entretien' | 'Offre' | 'Refus' | 'Archivée';
export type DashboardPeriod = 'all' | '7d' | '30d' | '90d';
export interface DashboardFilters {
  plan: DashboardPlan;
  sector: string;
  company: string;
  city: string;
  priority: string;
  status: string;
  period: DashboardPeriod;
  search: string;
  sentMonth: string;
  sentWeek: string;
}
export const INITIAL_FILTERS: DashboardFilters = {
  plan: 'all', sector: '', company: '', city: '', priority: '', status: '',
  period: 'all', search: '', sentMonth: '', sentWeek: '',
};
export const statusOrder: DashboardStatus[] = ['À candidater', 'À qualifier', 'À vérifier', 'Envoyée', 'Relance', 'Réponse', 'Entretien', 'Offre', 'Refus', 'Archivée'];

function normalize(s: string | null | undefined) {
  return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}
export function canonicalDate(input: string | null | undefined): string {
  if (!input) return '';
  const value = input.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:T|$)/.exec(value);
  if (iso) return iso[1] + '-' + iso[2] + '-' + iso[3];
  const fr = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s|$)/.exec(value);
  return fr ? fr[3] + '-' + fr[2].padStart(2, '0') + '-' + fr[1].padStart(2, '0') : '';
}
export function dashboardPlan(offer: InternshipOffer): 'A' | 'B' | null {
  const qualified = getOfferPlan(offer);
  if (qualified) return qualified;
  if (isDataAnalystMission(offer)) return 'B';
  if (isVisionMission(offer)) return 'A';
  return null;
}
export function offerSector(offer: InternshipOffer): string {
  const group = targetCompany(offer.company);
  const sector = sectors.find(s => s.companies.some(company => company[0] === group || matchesCompany(offer, company[2])));
  return sector?.id || 'autres';
}
/** Eligibility is not proof of submission. The legacy Sheet occasionally labels
 * published job adverts "Offre reçue", even when no application was sent.
 * Keep those records visible for reconciliation without inflating outcomes.
 */
export function hasSubmissionEvidence(offer: InternshipOffer) {
  const status = normalize(offer.applicationStatus);
  const dated = Boolean(dateKey(offer.appliedAt));
  if (status === 'offre recue') return dated;
  return dated || ['candidature envoyee','reponse recruteur','relance','entretien','test technique','accepte'].includes(status);
}
export function statusGroup(offer: InternshipOffer): DashboardStatus {
  const status = normalize(offer.applicationStatus);
  if (status === 'offre recue') return hasSubmissionEvidence(offer) ? 'Offre' : 'À vérifier';
  if (status === 'accepte') return hasSubmissionEvidence(offer) ? 'Offre' : 'À vérifier';
  if (status === 'refus') return 'Refus';
  if (status === 'abandonne' || status === 'expire' || status.startsWith('ecarte')) return 'Archivée';
  if (status === 'entretien' || status === 'test technique') return 'Entretien';
  if (status === 'reponse recruteur') return 'Réponse';
  if (status === 'relance') return 'Relance';
  if (hasSubmissionEvidence(offer)) return 'Envoyée';
  if (status.startsWith('a candidater')) return 'À candidater';
  return 'À qualifier';
}
export function uniqueDashboardOffers(offers: InternshipOffer[]): InternshipOffer[] {
  const ids = new Set<string>(); const knownLinks = new Set<string>();
  return offers.filter(offer => {
    if (!offer.id || ids.has(offer.id)) return false;
    ids.add(offer.id);
    const url = (offer.applicationUrl || '').split('?')[0].replace(/\/$/, '');
    const normalizedUrl = url && url.toLowerCase();
    if (normalizedUrl && knownLinks.has(normalizedUrl)) return false;
    // Keep the 30-company feed and explicitly saved / tracked applications.
    const eligible = Boolean(targetCompany(offer.company) || offer.id === 'BNP-RHG27-002' ||
      offer.id.startsWith('prospection:') || hasSubmissionEvidence(offer) || statusGroup(offer) === 'Refus');
    if (eligible && normalizedUrl) knownLinks.add(normalizedUrl);
    return eligible;
  });
}
export function filterDashboardOffers(offers: InternshipOffer[], filters: DashboardFilters, now = new Date()): InternshipOffer[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const maxAge = filters.period === '7d' ? 7 : filters.period === '30d' ? 30 : filters.period === '90d' ? 90 : Infinity;
  const needle = normalize(filters.search);
  return offers.filter(o => {
    if (filters.plan !== 'all' && dashboardPlan(o) !== filters.plan) return false;
    if (filters.sector && offerSector(o) !== filters.sector) return false;
    if (filters.company && targetCompany(o.company) !== filters.company && o.company !== filters.company) return false;
    if (filters.city && normalize(o.city) !== normalize(filters.city)) return false;
    if (filters.priority && o.priority !== filters.priority) return false;
    if (filters.status && statusGroup(o) !== filters.status) return false;
    if (filters.sentMonth && canonicalDate(o.appliedAt).slice(0, 7) !== filters.sentMonth) return false;
    if (filters.sentWeek && weekOf(canonicalDate(o.appliedAt)) !== filters.sentWeek) return false;
    if (needle && !normalize([o.company, o.title, o.city, o.domain, o.specialization, ...o.skills].filter(Boolean).join(' ')).includes(needle)) return false;
    if (Number.isFinite(maxAge)) {
      const dt = canonicalDate(o.publishedAt);
      if (!dt) return false; // Never interpret verification as publication.
      const time = new Date(dt + 'T00:00:00').getTime();
      if (!Number.isFinite(time) || time > today || today - time >= maxAge * 86400000) return false;
    }
    return true;
  });
}
export function dashboardMetrics(offers: InternshipOffer[], today: string) {
  const sent = offers.filter(hasSubmissionEvidence);
  const response = sent.filter(o => ['Réponse', 'Entretien', 'Offre', 'Refus'].includes(statusGroup(o)));
  const interviews = sent.filter(o => ['Entretien', 'Offre'].includes(statusGroup(o)));
  const opportunities = offers.filter(o => statusGroup(o) === 'À candidater');
  const due = offers.filter(o => hasSubmissionEvidence(o) && followUpDue(o, today));
  const withCompany = new Set(offers.map(o => targetCompany(o.company)).filter(Boolean));
  return {
    total: offers.length, toApply: opportunities.length, sent: sent.length, interviews: interviews.length,
    responses: response.length, responseRate: sent.length ? Math.round(100 * response.length / sent.length) : 0,
    interviewRate: sent.length ? Math.round(100 * interviews.length / sent.length) : 0,
    due: due.length, offersReceived: sent.filter(o => statusGroup(o) === 'Offre').length,
    unverifiedOutcomes: offers.filter(o => statusGroup(o) === 'À vérifier').length,
    unqualified: offers.filter(o => statusGroup(o) === 'À qualifier').length,
    priority: opportunities.filter(o => ['A+', 'A'].includes(o.priority)).length,
    companies: withCompany.size,
  };
}
export function byStatus(offers: InternshipOffer[]) {
  return statusOrder.map(label => ({ label, count: offers.filter(o => statusGroup(o) === label).length }));
}
export function bySector(offers: InternshipOffer[]) {
  const result: Array<{id:string;label:string;A:number;B:number;other:number}> = sectors.map(s => ({
    id: s.id, label: s.name,
    A: offers.filter(o => offerSector(o) === s.id && dashboardPlan(o) === 'A').length,
    B: offers.filter(o => offerSector(o) === s.id && dashboardPlan(o) === 'B').length,
    other: offers.filter(o => offerSector(o) === s.id && !dashboardPlan(o)).length,
  })).filter(row => row.A + row.B + row.other > 0);
  const outside = offers.filter(o => offerSector(o) === 'autres');
  if (outside.length) {
    result.push({
      id:'autres', label:'Autres candidatures',
      A:outside.filter(o => dashboardPlan(o) === 'A').length,
      B:outside.filter(o => dashboardPlan(o) === 'B').length,
      other:outside.filter(o => !dashboardPlan(o)).length,
    });
  }
  return result;
}
export function byCity(offers: InternshipOffer[]) {
  const counts = new Map<string, number>();
  for (const offer of offers) {
    const label = offer.city?.trim();
    if (label) counts.set(label, (counts.get(label) || 0) + 1);
  }
  return [...counts].map(([city, count]) => ({city, count}))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city, 'fr'));
}

/** ISO Monday identifier for weekly activity. Unknown date => no period. */
export function weekOf(iso:string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const date=new Date(iso+'T12:00:00Z');
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0,10)!==iso) return '';
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay()+6)%7));
  return date.toISOString().slice(0,10);
}
/** Always return a continuous sequence, including genuine zero-activity weeks.
 * Rows without a dated send remain in "sent" KPIs but do not enter a time series. */
export function applicationWeeks(offers: InternshipOffer[], now:Date, numberOfWeeks=10) {
  const today=now.toISOString().slice(0,10);
  const lastMonday=weekOf(today);
  if(!lastMonday) return [];
  const last=new Date(lastMonday+'T12:00:00Z');
  const counts=new Map<string,number>();
  for(const o of offers) {
    if(!hasSubmissionEvidence(o))continue;
    const week=weekOf(canonicalDate(o.appliedAt));
    if(week)counts.set(week,(counts.get(week)||0)+1);
  }
  return Array.from({length:numberOfWeeks},(_,i)=>{
    const date=new Date(last);
    date.setUTCDate(last.getUTCDate() - 7*(numberOfWeeks-1-i));
    const week=date.toISOString().slice(0,10);
    return {week,count:counts.get(week)||0};
  });
}
export function applicationMonths(offers: InternshipOffer[]) {
  const counts = new Map<string, number>();
  for (const o of offers) {
    if (!hasSubmissionEvidence(o)) continue;
    const month = canonicalDate(o.appliedAt).slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(month)) continue;
    counts.set(month, (counts.get(month) || 0) + 1);
  }
  return [...counts].sort(([a], [b]) => a.localeCompare(b)).slice(-9).map(([month, count]) => ({month, count}));
}
export function priorityQueue(offers: InternshipOffer[], today: string) {
  const rank: Record<string, number> = {'A+':4, A:3, 'B+':2, B:1};
  return offers.filter(o => (hasSubmissionEvidence(o) && followUpDue(o, today)) || statusGroup(o) === 'À candidater' || statusGroup(o) === 'À vérifier')
    .sort((a,b) => Number(followUpDue(b,today)) - Number(followUpDue(a,today)) ||
      Number(statusGroup(b)==='À vérifier') - Number(statusGroup(a)==='À vérifier') ||
      (rank[b.priority] || 0) - (rank[a.priority] || 0) ||
      (canonicalDate(b.publishedAt).localeCompare(canonicalDate(a.publishedAt))) ||
      a.company.localeCompare(b.company, 'fr')).slice(0, 12);
}
export function routeForOffer(o: InternshipOffer) {
  return o.id.startsWith('prospection:') ? '/prospection?lead=' + encodeURIComponent(o.id.slice(12))
    : '/workspace?offer=' + encodeURIComponent(o.id);
}
export function countUnknownCities(offers: InternshipOffer[], cityHasLocation: (city: string) => boolean) {
  return offers.filter(o => !o.city || !cityHasLocation(o.city)).length;
}
