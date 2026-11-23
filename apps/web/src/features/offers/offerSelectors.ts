import type { InternshipOffer } from '../../api/contract';
import { trackedTimestamp } from './offerDates';
import { getCvMatch } from '../workspace/intelligence';
import type { SortMode } from '../../storage/preferences';
import type { OfferFilters } from './offerTypes';

const priorityRank: Record<string, number> = { 'A+': 4, A: 3, 'B+': 2, B: 1 };

// One calculation per immutable offer object, reused by filtering and sorting.
// Sorting 1,000+ offers otherwise recomputes the full CV matcher tens of thousands of times.
const cvMatchCache = new WeakMap<InternshipOffer, number | null>();
export function verifiedCvMatchScore(offer: InternshipOffer): number | null {
  if (cvMatchCache.has(offer)) return cvMatchCache.get(offer)!;
  const score = offer.skills.length > 0 ? getCvMatch(offer).score : null;
  cvMatchCache.set(offer, score);
  return score;
}

/** Stable identity for an original vacancy despite tracking parameters,
 * source-specific IDs and repeated imports. Distinct ATS job URLs are kept.
 */
function canonicalOfferUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  try {
    const url = new URL(input);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    const path = decodeURIComponent(url.pathname).replace(/\/+$/, '').toLowerCase();
    // Generic employer landing pages are not individual job identities.
    if (!path || /^\/(careers?|jobs?|emplois?|offres?|stages?|fr\/carriere[s]?)$/.test(path)) return null;
    const tracking = /^(utm_|gclid$|fbclid$|dclid$|referrer$|source$|campaign$|originid$|boardid$)/i;
    const params = [...url.searchParams.entries()]
      .filter(([key]) => !tracking.test(key.toLowerCase()))
      .sort(([a], [b]) => a.localeCompare(b));
    const query = new URLSearchParams(params).toString();
    return url.hostname.toLowerCase().replace(/^www\./, '') + path + (query ? '?' + query : '');
  } catch { return null; }
}

function identityText(value: string | null | undefined): string {
  return (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function offerIdentity(offer: InternshipOffer): string {
  return offer.id + '::' + offer.company + '::' + offer.title + '::' + offer.city;
}

function duplicateKey(offer: InternshipOffer): string {
  const canonical = canonicalOfferUrl(offer.applicationUrl);
  return canonical ? 'url::' + canonical : 'role::' +
    [offer.company, offer.title, offer.city].map(identityText).join('::');
}

function hasTracking(offer: InternshipOffer): boolean {
  return Boolean(offer.appliedAt) || Boolean(offer.applicationStatus &&
    !['À candidater', 'À qualifier', ''].includes(offer.applicationStatus));
}

function preferredDuplicate(a: InternshipOffer, b: InternshipOffer): InternshipOffer {
  if (hasTracking(a) !== hasTracking(b)) return hasTracking(b) ? b : a;
  const aOfficial = a.sourceQuality?.toLowerCase().includes('officiel') ? 1 : 0;
  const bOfficial = b.sourceQuality?.toLowerCase().includes('officiel') ? 1 : 0;
  if (aOfficial !== bOfficial) return bOfficial ? b : a;
  if (b.skills.length !== a.skills.length) return b.skills.length > a.skills.length ? b : a;
  return trackedTimestamp(b.verifiedAt) > trackedTimestamp(a.verifiedAt) ? b : a;
}

export function dedupeOffers(offers: InternshipOffer[]): InternshipOffer[] {
  const seen = new Map<string, InternshipOffer>();
  for (const offer of offers) {
    const key = duplicateKey(offer);
    const previous = seen.get(key);
    if (!previous) { seen.set(key, offer); continue; }
    const preferred = preferredDuplicate(previous, offer);
    const addedDates = [previous.addedAt, offer.addedAt].filter(Boolean) as string[];
    const updateDates = [previous.updatedAt, offer.updatedAt].filter(Boolean) as string[];
    // An older historic copy with no recorded creation timestamp makes
    // the actual first insertion unknowable. Never backdate it to now.
    const earliestAdded = previous.addedAt && offer.addedAt
      ? addedDates.sort((a, b) => trackedTimestamp(a) - trackedTimestamp(b))[0] : null;
    const latestUpdated = updateDates.sort((a, b) => trackedTimestamp(b) - trackedTimestamp(a))[0] || null;
    seen.set(key, { ...preferred, addedAt: earliestAdded, updatedAt: latestUpdated,
      shortlist: previous.shortlist || offer.shortlist || preferred.shortlist });
  }
  return [...seen.values()];
}

function normalize(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export type OfferIndustry =
  | 'Image Processing'
  | 'Predictive Maintenance & Reliability'
  | 'Aerospace & Space'
  | 'Manufacturing & Industry 4.0'
  | 'Automotive & Mobility'
  | 'MedTech & Healthcare'
  | 'Energy & Environment'
  | 'IT, Data & AI'
  | 'Telecom, Signal & Audio'
  | 'Research & R&D'
  | 'Other';

export const industryOptions: OfferIndustry[] = [
  'Image Processing',
  'Predictive Maintenance & Reliability',
  'Aerospace & Space',
  'Manufacturing & Industry 4.0',
  'Automotive & Mobility',
  'MedTech & Healthcare',
  'Energy & Environment',
  'IT, Data & AI',
  'Telecom, Signal & Audio',
  'Research & R&D',
  'Other',
];

export function offerIndustry(offer: InternshipOffer): OfferIndustry {
  const text = normalize([
    offer.company,
    offer.title,
    offer.domain,
    offer.specialization,
    ...offer.skills,
  ].filter(Boolean).join(' '));

  const hasAny = (terms: string[]) => terms.some((term) => text.includes(normalize(term)));

  if (hasAny(['image processing', 'traitement d image', 'traitement des images', 'image analysis', 'analyse d images', 'segmentation d image'])) return 'Image Processing';
  if (hasAny(['maintenance predictive', 'maintenance prédictive', 'predictive maintenance', 'condition monitoring', 'failure prediction', 'fault detection', 'remaining useful life'])) return 'Predictive Maintenance & Reliability';
  if (hasAny(['airbus', 'safran', 'aeronaut', 'aerospace', 'spatial', 'space', 'satellite', 'avion', 'flight'])) return 'Aerospace & Space';
  if (hasAny(['industrie', 'industrial', 'manufactur', 'production', 'usine', 'factory', 'qualite', 'quality', 'process', 'lean', 'maintenance', 'industrie 4.0'])) return 'Manufacturing & Industry 4.0';
  if (hasAny(['automobile', 'automotive', 'vehicle', 'vehicule', 'adas', 'mobility', 'mobilite', 'rail', 'transport'])) return 'Automotive & Mobility';
  if (hasAny(['medical', 'medtech', 'health', 'sante', 'biomedical', 'biomed', 'clinique', 'radiolog', 'imagerie medicale'])) return 'MedTech & Healthcare';
  if (hasAny(['energy', 'energie', 'renewable', 'renouvelable', 'electric', 'grid', 'environment', 'environnement', 'climate'])) return 'Energy & Environment';
  if (hasAny(['telecom', 'signal', 'audio', 'speech', 'acoustic', 'acoustique', 'communication'])) return 'Telecom, Signal & Audio';
  if (hasAny(['research', 'recherche', 'r&d', 'innovation', 'laboratoire', 'laboratory', 'phd'])) return 'Research & R&D';
  if (hasAny(['data', 'machine learning', 'deep learning', 'computer vision', 'vision', 'ia', 'ai', 'software', 'logiciel', 'python', 'pytorch'])) return 'IT, Data & AI';
  return 'Other';
}

function textMatches(offer: InternshipOffer, query: string): boolean {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = normalize([
    offer.company,
    offer.title,
    offer.city,
    offer.region,
    offer.specialization,
    offer.domain,
    offer.compensation,
    offer.duration,
    offer.sourceQuality,
    ...offer.skills,
  ].filter(Boolean).join(' '));
  return tokens.every((token) => haystack.includes(token));
}

function equalsNullable(actual: string | null | undefined, expected: string | null): boolean {
  return expected === null || normalize(actual) === normalize(expected);
}

export function isForMe(offer: InternshipOffer): boolean {
  const activeStatus = !['Refus', 'Abandonné'].includes(offer.applicationStatus ?? '');
  const strongPriority = ['A+', 'A'].includes(offer.priority);
  const m2Compatible = ['Oui', 'Oui probable'].includes(offer.m2Fit ?? '');
  const strongScore = (verifiedCvMatchScore(offer) ?? 0) >= 85;
  return activeStatus && strongPriority && m2Compatible && strongScore;
}

export function filterOffers(offers: InternshipOffer[], filters: OfferFilters): InternshipOffer[] {
  return offers.filter((offer) => {
    if (!textMatches(offer, filters.query)) return false;
    if (!equalsNullable(offer.specialization, filters.specialization)) return false;
    if (filters.industry !== null && offerIndustry(offer) !== filters.industry) return false;
    if (!equalsNullable(offer.city, filters.city)) return false;
    if (filters.priority !== null && normalize(offer.priority) !== normalize(filters.priority)) return false;
    if (filters.minScore > 0 && ((verifiedCvMatchScore(offer) ?? -1) < filters.minScore)) return false;
    if (!equalsNullable(offer.freshness, filters.freshness)) return false;
    if (!equalsNullable(offer.m2Fit, filters.m2Fit)) return false;
    if (!equalsNullable(offer.sourceQuality, filters.sourceQuality)) return false;
    if (!equalsNullable(offer.applicationStatus, filters.applicationStatus)) return false;
    if (filters.onlyForMe && !isForMe(offer)) return false;
    return true;
  });
}

function parseDateValue(value: string | null): number {
  if (!value) return 0;
  const text = value.trim();
  // Sheets export French dates as DD/MM/YYYY; Date.parse interprets these as
  // MM/DD/YYYY in many JS runtimes and can push September above October.
  const french = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (french) {
    const [, day, month, year, hour = '0', minute = '0', second = '0'] = french;
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
    return date.getFullYear() === Number(year) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day)
      ? date.getTime()
      : 0;
  }
  const direct = Date.parse(text);
  return Number.isFinite(direct) ? direct : 0;
}

function recentValue(offer: InternshipOffer): number {
  // A verification/sync timestamp is not an offer publication date.
  return parseDateValue(offer.publishedAt);
}

export function selectVisibleOffers(
  offers: InternshipOffer[],
  filters: OfferFilters,
  sort: SortMode,
): InternshipOffer[] {
  const filteredOffers = filterOffers(offers, filters);
  return sortOffers(filteredOffers, sort);
}

/** Travel-from-Nantes priority, without hiding strong opportunities elsewhere.
 * Towns here are in or very near Nantes Métropole; no relocation required.
 */
function nantesAreaRank(offer: InternshipOffer): number {
  const place = normalize(offer.city).replace(/[^a-z0-9 -]/g, ' ');
  if (/(^|\b)(nantes|saint herblain|saint-herblain|reze|orvault|carquefou|bouguenais|saint sebastien sur loire|sainte luce sur loire|vertou|la chapelle sur erdre|basse goulaine)(\b|$)/.test(place)) return 2;
  if (normalize(offer.region).includes('pays de la loire')) return 1;
  return 0;
}

function isClosedOpportunity(offer: InternshipOffer): boolean {
  return /\b(ferme confirme|expiree?|pourvue?|closed|filled|retiree?)\b/.test(normalize(offer.offerStatus)) ||
    /\b(refus|abandonne)\b/.test(normalize(offer.applicationStatus));
}

function compareBest(a: InternshipOffer, b: InternshipOffer): number {
  return Number(isClosedOpportunity(a)) - Number(isClosedOpportunity(b))
    || nantesAreaRank(b) - nantesAreaRank(a)
    || (verifiedCvMatchScore(b) ?? -1) - (verifiedCvMatchScore(a) ?? -1)
    || (priorityRank[b.priority] ?? 0) - (priorityRank[a.priority] ?? 0)
    || (b.technicalFit ?? -1) - (a.technicalFit ?? -1)
    || recentValue(b) - recentValue(a)
    || a.company.localeCompare(b.company, 'fr');
}

export function sortOffers(offers: InternshipOffer[], sort: SortMode): InternshipOffer[] {
  const copy = [...offers];
  switch (sort) {
    case 'added':
      return copy.sort((a, b) => trackedTimestamp(b.addedAt) - trackedTimestamp(a.addedAt) || compareBest(a, b));
    case 'updated':
      return copy.sort((a, b) => trackedTimestamp(b.updatedAt) - trackedTimestamp(a.updatedAt) || compareBest(a, b));
    case 'recent':
      return copy.sort((a, b) => recentValue(b) - recentValue(a) || compareBest(a, b));
    case 'detected':
      // Latest verification is a different signal from the publication date.
      // This sort shows recently recovered official postings without claiming
      // they were newly published. Never mutate publishedAt.
      return copy.sort((a, b) => parseDateValue(b.verifiedAt) - parseDateValue(a.verifiedAt) || compareBest(a, b));
    case 'score':
      return copy.sort((a, b) => (b.decisionScore ?? -1) - (a.decisionScore ?? -1) || compareBest(a, b));
    case 'priority':
      return copy.sort((a, b) => (priorityRank[b.priority] ?? 0) - (priorityRank[a.priority] ?? 0) || compareBest(a, b));
    case 'city':
      return copy.sort((a, b) => (a.city ?? '').localeCompare(b.city ?? '', 'fr') || compareBest(a, b));
    case 'best':
    default:
      return copy.sort(compareBest);
  }
}

export function uniqueValues(offers: InternshipOffer[], field: 'specialization' | 'city' | 'freshness' | 'm2Fit' | 'sourceQuality' | 'applicationStatus'): string[] {
  return [...new Set(offers.map((offer) => offer[field]).filter((value): value is string => Boolean(value)))]
    .sort((a, b) => a.localeCompare(b, 'fr'));
}
