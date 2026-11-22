import { expect, test } from 'vitest';
import type { InternshipOffer } from '../../api/contract';
import { getCvMatch, getFollowUpAdvice } from './intelligence';

const offer = (partial: Partial<InternshipOffer>): InternshipOffer => ({
  id: 'x',
  company: 'Acme',
  title: 'Computer Vision Intern',
  domain: 'Computer Vision',
  city: 'Paris',
  region: null,
  m2Fit: 'Oui',
  start: null,
  duration: null,
  compensation: null,
  skills: ['Python', 'PyTorch', 'OpenCV', 'Vision Transformers'],
  publishedAt: null,
  offerStatus: 'Active',
  applicationStatus: 'À candidater',
  nextAction: null,
  applicationUrl: null,
  shortlist: true,
  appliedAt: null,
  followUpAt: null,
  specialization: 'Computer Vision',
  technicalFit: 90,
  decisionScore: 92,
  priority: 'A+',
  freshness: null,
  verifiedAt: null,
  sourceQuality: null,
  actionLevel: null,
  calendarFit: null,
  confidence: null,
  relevance: null,
  gaps: null,
  ...partial,
});

test('computes a personalized CV match from known skills', () => {
  const match = getCvMatch(offer({}));
  expect(match.matched).toEqual(['Python', 'PyTorch', 'OpenCV']);
  expect(match.missing).toEqual(['Vision Transformers']);
  expect(match.score).toBeGreaterThan(70);
});

test('recommends a follow-up when seven days have elapsed', () => {
  expect(getFollowUpAdvice(
    offer({ applicationStatus: 'Candidature envoyée', appliedAt: '2026-10-01' }),
    undefined,
    new Date('2026-10-09T12:00:00'),
  )).toContain('Follow up now');
});
