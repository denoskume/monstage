import { expect, test } from 'vitest';
import type { InternshipOffer } from '../../api/contract';
import { filterOffers, isForMe, sortOffers } from './offerSelectors';
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

test('recent sort prefers verifiedAt then publishedAt', () => {
  const offers = [
    { ...base, id: 'old', verifiedAt: null, publishedAt: '2026-09-01' },
    { ...base, id: 'new', verifiedAt: '2026-09-15T08:00:00Z' },
  ];
  expect(sortOffers(offers, 'recent').map((offer) => offer.id)).toEqual(['new', 'old']);
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
