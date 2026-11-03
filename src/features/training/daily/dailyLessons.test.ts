import { describe, expect, it } from 'vitest';
import { weeks } from '../program';
import { dailyLessons } from './index';
import { dailyReviewReady } from './review';
describe('daily learning materials', () => {
  it('provides a distinct guided lesson and detailed correction for every planned day', () => {
    const ids = weeks.flatMap(w => w.days.map(d => d.id));
    expect(Object.keys(dailyLessons).sort()).toEqual(ids.sort());
    for (const lesson of Object.values(dailyLessons)) {
      expect(lesson.concepts.length).toBeGreaterThanOrEqual(2);
      expect(lesson.demonstration.code.length).toBeGreaterThan(100);
      expect(lesson.correction.code.length).toBeGreaterThan(100);
      expect(lesson.correction.steps.length).toBeGreaterThanOrEqual(3);
      expect(lesson.exercise.acceptance.length).toBeGreaterThanOrEqual(3);
      expect(lesson.review.length).toBeGreaterThanOrEqual(2);
      expect(lesson.troubleshooting.length).toBeGreaterThanOrEqual(2);
      expect(lesson.reading.every(r => r.url.startsWith('https://'))).toBe(true);
    }
    expect(new Set(Object.values(dailyLessons).map(l => l.demonstration.code)).size).toBe(40);
  });
  it('requires evidence and written explanations for an autonomy review', () => {
    const lesson = { exercise: { acceptance: ['a','b','c'] }, review: [{ question: 'why' }, { question: 'how' }] } as typeof dailyLessons[string];
    expect(dailyReviewReady(lesson, undefined)).toBe(false);
    expect(dailyReviewReady(lesson, { checks: [true,true,true], answers: ['because','like this'], evidence: 'commit https://example.test/123', feedback: 'Test indépendant concluant', decision: 'autonomous' })).toBe(true);
    expect(dailyReviewReady(lesson, { checks: [true,true,false], answers: ['because','like this'], evidence: 'commit https://example.test/123', feedback: 'Test indépendant concluant', decision: 'autonomous' })).toBe(false);
  });
});
