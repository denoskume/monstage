import { describe, expect, it } from 'vitest';
import type { InternshipOffer } from '../../api/contract';
import { relevantCoursesForOffer, selectConvincingProjects } from './strategicCvSelection';

const exampleOffer = (title: string, skills: string[]): InternshipOffer => ({
  id: 'strategy-example', company: 'Example Industries', title,
  domain: 'Industrial Data', city: 'Nantes', region: 'Pays de la Loire',
  m2Fit: 'Oui', start: 'Février 2027', duration: '6 mois',
  compensation: null, skills, publishedAt: null, offerStatus: 'À vérifier',
  applicationStatus: 'À candidater', nextAction: null, applicationUrl: '',
  shortlist: false, appliedAt: null, followUpAt: null, specialization: null,
  technicalFit: null, decisionScore: null, priority: 'B',
  freshness: null, verifiedAt: null, sourceQuality: null, actionLevel: null,
  calendarFit: null, confidence: null, relevance: null, gaps: null,
});

describe('strategic CV selection rules', () => {
  it('selects database and data courses, never the unfiltered Java/PHP list', () => {
    const courses = relevantCoursesForOffer(exampleOffer('Stage IA & Analyse de données', ['SQL', 'Python']), 'FR');
    expect(courses.ecn).toContain('Analyse de données');
    expect(courses.kju).toBe('Bases de données · Programmation Python');
    expect(courses.kju).not.toMatch(/Java|PHP/);
  });
  it('switches to image processing only for relevant positions', () => {
    const offer = exampleOffer('Stage Computer Vision Engineer', ['OpenCV']);
    const courses = relevantCoursesForOffer(offer, 'FR');
    expect(courses.ecn).toContain('Vision par ordinateur');
    expect(courses.kju).toContain('Traitement numérique du signal');
  });
  it('keeps one strong project when the second is weak', () => {
    expect(selectConvincingProjects([{ score: 35, id: 'aligned' }, { score: 8, id: 'generic' }]).map(p=>p.id))
      .toEqual(['aligned']);
  });
  it('allows two if both independently match strongly, and none if no proof matches', () => {
    expect(selectConvincingProjects([{ score: 30, id: 'a' }, { score: 27, id: 'b' }]).map(p=>p.id))
      .toEqual(['a', 'b']);
    expect(selectConvincingProjects([{ score: 0, id: 'none' }])).toEqual([]);
  });
});
