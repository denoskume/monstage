import { expect, test } from 'vitest';
import type { InternshipOffer } from '../../api/contract';
import { countByCity, countBySpecialization, getApplicationFunnel, getDashboardKpis } from './dashboardSelectors';

const makeOffer = (partial: Partial<InternshipOffer>): InternshipOffer => ({
  id: '1', company: 'Acme', title: 'ML Intern', domain: null, city: 'Paris', region: null, m2Fit: 'Oui', start: null, duration: null,
  compensation: null, skills: [], publishedAt: null, offerStatus: 'Active', applicationStatus: 'À candidater', nextAction: null,
  applicationUrl: null, shortlist: false, appliedAt: null, followUpAt: null, specialization: 'Machine Learning / Deep Learning', technicalFit: 90,
  decisionScore: 90, priority: 'A', freshness: 'Vérifié <24h', verifiedAt: null, sourceQuality: 'Officiel / direct', actionLevel: null,
  calendarFit: null, confidence: null, relevance: null, gaps: null, ...partial,
});

const offers = [
  makeOffer({ id: 'a', applicationStatus: 'Candidature envoyée', shortlist: true, actionLevel: 'CANDIDATER 24H', city: 'Paris', specialization: 'Computer Vision / 3D', priority: 'A+' }),
  makeOffer({ id: 'b', applicationStatus: 'Entretien', city: 'Nantes', specialization: 'Computer Vision / 3D', priority: 'A' }),
  makeOffer({ id: 'c', applicationStatus: 'Refus', city: 'Paris', specialization: 'Data / AI', priority: 'B+' }),
];

test('derives dashboard KPIs exactly', () => {
  expect(getDashboardKpis(offers)).toEqual({ activeOpportunities: 2, aOrAPlus: 2, apply24h: 1, shortlist: 1, applicationsSent: 2, interviews: 1 });
});

test('groups specialization and city counts', () => {
  expect(countBySpecialization(offers)[0]).toEqual({ label: 'Computer Vision / 3D', count: 2 });
  expect(countByCity(offers, 8)[0]).toEqual({ label: 'Paris', count: 2 });
});

test('returns ordered application funnel', () => {
  const funnel = getApplicationFunnel(offers);
  expect(funnel.map((item) => item.label)).toEqual(['Candidature envoyée','Relance','Entretien','Test technique','Offre reçue']);
  expect(funnel.find((item) => item.label === 'Entretien')?.count).toBe(1);
});
