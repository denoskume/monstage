import type { InternshipOffer } from '../../api/contract';
import type { SortMode } from '../../storage/preferences';
import type { OfferFilters } from './offerTypes';

const priorityRank: Record<string, number> = { 'A+': 4, A: 3, 'B+': 2, B: 1 };

function normalize(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
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
  const strongScore = (offer.decisionScore ?? 0) >= 85;
  return activeStatus && strongPriority && m2Compatible && strongScore;
}

export function filterOffers(offers: InternshipOffer[], filters: OfferFilters): InternshipOffer[] {
  return offers.filter((offer) => {
    if (!textMatches(offer, filters.query)) return false;
    if (!equalsNullable(offer.specialization, filters.specialization)) return false;
    if (!equalsNullable(offer.city, filters.city)) return false;
    if (filters.priority !== null && normalize(offer.priority) !== normalize(filters.priority)) return false;
    if (filters.minScore > 0 && (offer.decisionScore === null || offer.decisionScore < filters.minScore)) return false;
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
  const direct = Date.parse(value);
  if (!Number.isNaN(direct)) return direct;

  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!match) return 0;
  const [, day, month, year, hour = '0', minute = '0', second = '0'] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)).getTime();
}

function recentValue(offer: InternshipOffer): number {
  return parseDateValue(offer.publishedAt) || parseDateValue(offer.verifiedAt);
}

export function selectVisibleOffers(
  offers: InternshipOffer[],
  filters: OfferFilters,
  sort: SortMode,
): InternshipOffer[] {
  const filteredOffers = filterOffers(offers, filters);
  return sortOffers(filteredOffers, sort);
}

function compareBest(a: InternshipOffer, b: InternshipOffer): number {
  return (b.decisionScore ?? -1) - (a.decisionScore ?? -1)
    || (priorityRank[b.priority] ?? 0) - (priorityRank[a.priority] ?? 0)
    || (b.technicalFit ?? -1) - (a.technicalFit ?? -1)
    || recentValue(b) - recentValue(a)
    || a.company.localeCompare(b.company, 'fr');
}

export function sortOffers(offers: InternshipOffer[], sort: SortMode): InternshipOffer[] {
  const copy = [...offers];
  switch (sort) {
    case 'recent':
      return copy.sort((a, b) => recentValue(b) - recentValue(a) || compareBest(a, b));
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
