import { expect, test } from 'vitest';
import type { InternshipOffer } from '../../api/contract';
import { dedupeOffers, filterOffers, isForMe, selectVisibleOffers, sortOffers } from './offerSelectors';
import type { OfferFilters } from './offerTypes';

const base: InternshipOffer = {
  id: '1', company: 'Acme', title: 'Computer Vision Intern', domain: 'AI', city: 'Nantes', region: 'Pays de la Loire',
  m2Fit: 'Oui', start: 'Janvier 2027', duration: '6 mois', compensation: null, skills: ['Python', 'OpenCV'], publishedAt: '2026-09-10',
  offerStatus: 'Active', applicationStatus: 'À candidater', nextAction: null, applicationUrl: 'https://example.com', shortlist: false,
  appliedAt: null, followUpAt: null, specialization: 'Computer Vision / 3D', technicalFit: 95, decisionScore: 96, priority: 'A+',
  freshness: 'Vérifié <24h', verifiedAt: '2026-09-15T06:00:00Z', sourceQuality: 'Officiel / direct', actionLevel: 'CANDIDATER 24H',
  calendarFit: '✅ Aligné', confidence: 'Haute', relevance: null, gaps: null,
};

const filters: OfferFilters = { query: '', specialization: null, city: null, priority: null, minScore: 0, freshness: null, m2Fit: null, sourceQuality: null, applicationStatus: null, onlyForMe: false };

test('searches company title city specialization and skills', () => {
  expect(filterOffers([base], { ...filters, query: 'opencv' })).toHaveLength(1);
  expect(filterOffers([base], { ...filters, query: 'lyon' })).toHaveLength(0);
});

test('filters by minimum decision score', () => {
  expect(filterOffers([{ ...base, decisionScore: 89 }], { ...filters, minScore: 90 })).toHaveLength(0);
});

test('Pour moi requires active A/A+, M2 compatibility and score >= 85', () => {
  expect(isForMe(base)).toBe(true);
  expect(isForMe({ ...base, priority: 'B+' })).toBe(false);
  expect(isForMe({ ...base, m2Fit: 'Possible' })).toBe(false);
  expect(isForMe({ ...base, decisionScore: 84 })).toBe(false);
  expect(isForMe({ ...base, applicationStatus: 'Abandonné' })).toBe(false);
});

test('best sort ranks decision score then priority then technical fit', () => {
  const offers = [
    { ...base, id: 'a', decisionScore: 95, priority: 'A', technicalFit: 99 },
    { ...base, id: 'b', decisionScore: 96, priority: 'B+', technicalFit: 90 },
    { ...base, id: 'c', decisionScore: 95, priority: 'A+', technicalFit: 90 },
  ];
  expect(sortOffers(offers, 'best').map((offer) => offer.id)).toEqual(['b', 'c', 'a']);
});

test('recent sort prefers publication date and uses verification date only as fallback', () => {
  const offers = [
    { ...base, id: 'older-published', publishedAt: '2026-09-01', verifiedAt: '2026-10-01T08:00:00Z' },
    { ...base, id: 'newer-published', publishedAt: '2026-09-20', verifiedAt: '2026-09-21T08:00:00Z' },
    { ...base, id: 'fallback-verified', publishedAt: '', verifiedAt: '2026-09-25T08:00:00Z' },
  ];
  expect(sortOffers(offers, 'recent').map((offer) => offer.id)).toEqual(['fallback-verified', 'newer-published', 'older-published']);
});

test('filtering is applied before sorting and sorting never reintroduces excluded cities', () => {
  const offers = [
    { ...base, id: 'nantes-old', city: 'Nantes', publishedAt: '2026-09-01' },
    { ...base, id: 'paris-new', city: 'Paris', publishedAt: '2026-10-01' },
    { ...base, id: 'nantes-new', city: 'Nantes', publishedAt: '2026-09-25' },
    { ...base, id: 'lyon-newer', city: 'Lyon', publishedAt: '2026-10-05' },
  ];

  const result = selectVisibleOffers(offers, { ...filters, city: 'Nantes' }, 'recent');

  expect(result.map((offer) => offer.id)).toEqual(['nantes-new', 'nantes-old']);
  expect(result.every((offer) => offer.city === 'Nantes')).toBe(true);
});


test('search is accent-insensitive and supports multiple tokens in any order', () => {
  const offer = { ...base, company: 'Électricité de France', title: 'Vision par ordinateur', city: 'Saint-Étienne' };
  expect(filterOffers([offer], { ...filters, query: 'vision france' })).toHaveLength(1);
  expect(filterOffers([offer], { ...filters, query: 'saint etienne' })).toHaveLength(1);
  expect(filterOffers([offer], { ...filters, query: 'vision lyon' })).toHaveLength(0);
});

test('each exact filter criterion is enforced', () => {
  expect(filterOffers([base], { ...filters, specialization: 'Computer Vision / 3D' })).toHaveLength(1);
  expect(filterOffers([base], { ...filters, city: 'Nantes' })).toHaveLength(1);
  expect(filterOffers([base], { ...filters, priority: 'A+' })).toHaveLength(1);
  expect(filterOffers([base], { ...filters, freshness: 'Vérifié <24h' })).toHaveLength(1);
  expect(filterOffers([base], { ...filters, m2Fit: 'Oui' })).toHaveLength(1);
  expect(filterOffers([base], { ...filters, sourceQuality: 'Officiel / direct' })).toHaveLength(1);
  expect(filterOffers([base], { ...filters, applicationStatus: 'À candidater' })).toHaveLength(1);
  expect(filterOffers([base], { ...filters, city: 'Lyon' })).toHaveLength(0);
});

test('minimum score excludes offers with missing scores when a threshold is active', () => {
  expect(filterOffers([{ ...base, decisionScore: null }], { ...filters, minScore: 70 })).toHaveLength(0);
  expect(filterOffers([{ ...base, decisionScore: null }], filters)).toHaveLength(1);
});


test('city filter returns only offers from the selected city', () => {
  const offers = [
    { ...base, id: 'nantes', city: 'Nantes' },
    { ...base, id: 'paris', city: 'Paris' },
    { ...base, id: 'lyon', city: 'Lyon' },
  ];
  const result = filterOffers(offers, { ...filters, city: 'Nantes' });
  expect(result.map((offer) => offer.id)).toEqual(['nantes']);
  expect(result.every((offer) => offer.city === 'Nantes')).toBe(true);
});


test('every categorical filter returns only matching offers across a mixed dataset', () => {
  const offers = [
    { ...base, id: 'match', city: 'Nantes', specialization: 'Computer Vision / 3D', priority: 'A+', freshness: 'Vérifié <24h', m2Fit: 'Oui', sourceQuality: 'Officiel / direct', applicationStatus: 'À candidater', decisionScore: 96 },
    { ...base, id: 'other-city', city: 'Paris' },
    { ...base, id: 'other-specialization', specialization: 'Data Science' },
    { ...base, id: 'other-priority', priority: 'B' },
    { ...base, id: 'other-freshness', freshness: 'Ancien' },
    { ...base, id: 'other-m2', m2Fit: 'Possible' },
    { ...base, id: 'other-source', sourceQuality: 'Agrégateur' },
    { ...base, id: 'other-status', applicationStatus: 'Entretien' },
    { ...base, id: 'other-score', decisionScore: 72 },
  ];

  const cases: Array<[Partial<OfferFilters>, string]> = [
    [{ city: 'Nantes' }, 'match'],
    [{ specialization: 'Computer Vision / 3D' }, 'match'],
    [{ priority: 'A+' }, 'match'],
    [{ freshness: 'Vérifié <24h' }, 'match'],
    [{ m2Fit: 'Oui' }, 'match'],
    [{ sourceQuality: 'Officiel / direct' }, 'match'],
    [{ applicationStatus: 'À candidater' }, 'match'],
    [{ minScore: 90 }, 'match'],
  ];

  for (const [partial, expectedId] of cases) {
    const result = filterOffers(offers, { ...filters, ...partial });
    expect(result.some((offer) => offer.id === expectedId)).toBe(true);
    for (const offer of result) {
      if (partial.city) expect(offer.city).toBe(partial.city);
      if (partial.specialization) expect(offer.specialization).toBe(partial.specialization);
      if (partial.priority) expect(offer.priority).toBe(partial.priority);
      if (partial.freshness) expect(offer.freshness).toBe(partial.freshness);
      if (partial.m2Fit) expect(offer.m2Fit).toBe(partial.m2Fit);
      if (partial.sourceQuality) expect(offer.sourceQuality).toBe(partial.sourceQuality);
      if (partial.applicationStatus) expect(offer.applicationStatus).toBe(partial.applicationStatus);
      if (partial.minScore) expect(offer.decisionScore).not.toBeNull(), expect(offer.decisionScore!).toBeGreaterThanOrEqual(partial.minScore);
    }
  }
});

test('combined filters use AND logic and exclude any partially matching offer', () => {
  const offers = [
    { ...base, id: 'exact', city: 'Nantes', specialization: 'Computer Vision / 3D', priority: 'A+', m2Fit: 'Oui', sourceQuality: 'Officiel / direct', freshness: 'Vérifié <24h', applicationStatus: 'À candidater', decisionScore: 96 },
    { ...base, id: 'wrong-city', city: 'Paris' },
    { ...base, id: 'wrong-priority', priority: 'B+' },
    { ...base, id: 'wrong-score', decisionScore: 89 },
    { ...base, id: 'wrong-status', applicationStatus: 'Entretien' },
  ];

  const result = filterOffers(offers, {
    ...filters,
    city: 'Nantes',
    specialization: 'Computer Vision / 3D',
    priority: 'A+',
    minScore: 90,
    m2Fit: 'Oui',
    sourceQuality: 'Officiel / direct',
    freshness: 'Vérifié <24h',
    applicationStatus: 'À candidater',
  });

  expect(result.map((offer) => offer.id)).toEqual(['exact']);
});

test('query and structured filters are combined with AND logic', () => {
  const offers = [
    { ...base, id: 'nantes-cv', city: 'Nantes', title: 'Computer Vision Intern', skills: ['OpenCV'] },
    { ...base, id: 'nantes-data', city: 'Nantes', title: 'Data Analyst Intern', skills: ['Pandas'] },
    { ...base, id: 'paris-cv', city: 'Paris', title: 'Computer Vision Intern', skills: ['OpenCV'] },
  ];

  const result = filterOffers(offers, { ...filters, query: 'opencv', city: 'Nantes' });
  expect(result.map((offer) => offer.id)).toEqual(['nantes-cv']);
});


test('deduplication prevents repeated cards when backend ids collide', () => {
  const offers = [
    { ...base, id: '', company: 'Acme', title: 'Computer Vision Intern', city: 'Nantes', applicationUrl: 'https://example.com/a' },
    { ...base, id: '', company: 'Acme', title: 'Computer Vision Intern', city: 'Nantes', applicationUrl: 'https://example.com/a' },
    { ...base, id: '', company: 'Acme', title: 'Computer Vision Intern', city: 'Paris', applicationUrl: 'https://example.com/b' },
  ];

  const unique = dedupeOffers(offers);
  expect(unique).toHaveLength(2);

  const filtered = filterOffers(unique, { ...filters, city: 'Nantes' });
  expect(filtered).toHaveLength(1);
  expect(filtered.every((offer) => offer.city === 'Nantes')).toBe(true);
});
