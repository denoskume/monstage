import { describe, expect, test } from 'vitest';
import { reconcileExternalOffers } from '../src/externalCache';
import type { ExternalOffer } from '../src/externalOffers';

const NOW = Date.parse('2026-11-07T12:00:00Z');
function sample(id: string, verifiedAt: string): ExternalOffer {
  return {
    id,
    company: 'Airbus',
    title: 'STAGE 2027 - Stage en Analyse de Données',
    domain: 'Data Analyst',
    city: 'Toulouse',
    region: null,
    m2Fit: 'Oui probable',
    start: '2027',
    duration: '6 mois',
    compensation: null,
    skills: [],
    publishedAt: '2026-11-06',
    offerStatus: 'Active',
    applicationStatus: 'À candidater',
    nextAction: null,
    applicationUrl: 'https://example.test/' + id,
    shortlist: false,
    appliedAt: null,
    followUpAt: null,
    specialization: 'Data Analyst',
    technicalFit: 80,
    decisionScore: 80,
    priority: 'A',
    freshness: 'Vérifié <24h',
    verifiedAt,
    sourceQuality: 'Officiel / direct',
    actionLevel: 'À ÉVALUER',
    calendarFit: null,
    confidence: 'Haute',
    relevance: null,
    gaps: null,
  };
}

describe('incremental ATS cache', () => {
  test('does not erase a recent listing when another provider responds partially', () => {
    const prior = sample('airbus-1', '2026-11-06T12:00:00Z');
    const newOffer = sample('thales-1', '2026-11-07T11:00:00Z');
    const merged = reconcileExternalOffers([prior], [newOffer], NOW);
    expect(merged.map(offer => offer.id)).toEqual(['thales-1', 'airbus-1']);
    expect(merged[1].offerStatus).toBe('À vérifier');
    expect(merged[1].publishedAt).toBe('2026-11-06');
    expect(merged[1].verifiedAt).toBe('2026-11-06T12:00:00Z');
  });

  test('replaces verified listing rather than accumulating duplicates', () => {
    const prior = sample('airbus-1', '2026-11-06T12:00:00Z');
    const updated = sample('airbus-1', '2026-11-07T11:00:00Z');
    expect(reconcileExternalOffers([prior], [updated], NOW)).toEqual([updated]);
  });

  test('does not advertise old unverified postings indefinitely', () => {
    const old = sample('old-1', '2026-10-01T12:00:00Z');
    expect(reconcileExternalOffers([old], [sample('new-1', '2026-11-07T11:00:00Z')], NOW)).toHaveLength(1);
  });
});
