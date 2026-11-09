import { beforeEach, describe, expect, test } from 'vitest';
import {
  INSPemon_OFFER_ID, inspemonInterviewOffer, defaultInterviewPrep,
  loadInterviewPrep, saveInterviewPrep, sessionsForOffer, practicedCount, interviewPrepComplete,
} from './interviewPrep';

beforeEach(() => localStorage.clear());

describe('interview sessions', () => {
  test('gives Inspemon 8 questions across 3 focused sessions and one mock session', () => {
    const sessions = sessionsForOffer(inspemonInterviewOffer);
    expect(sessions).toHaveLength(3);
    expect(sessions.map(s => s.questions.length)).toEqual([2, 2, 4]);
    const questions = sessions.flatMap(session => session.questions);
    expect(questions).toHaveLength(8);
    expect(new Set(questions.map(q => q.id)).size).toBe(8);
    expect(questions.find(q => q.id === 'ros-level')?.example).toContain('Je n’ai pas encore développé');
    expect(questions.find(q => q.id === 'vision-project')?.example).toContain('0,475');
  });

  test('saves progress only for the relevant offer and keeps interview time unguessed', () => {
    const initial = defaultInterviewPrep(INSPemon_OFFER_ID);
    expect(initial.date).toBe('2026-11-13');
    expect(initial.time).toBe('');
    const edited = { ...initial, answers: { pitch: 'Ma propre version.' }, practiced: { pitch: true }, contact: 'À confirmer' };
    saveInterviewPrep(INSPemon_OFFER_ID, edited);
    expect(loadInterviewPrep(INSPemon_OFFER_ID)).toEqual(edited);
    expect(loadInterviewPrep('another-interview').answers).toEqual({});
    expect(loadInterviewPrep('another-interview').date).toBe('');
  });

  test('marks completion only after all eight rehearsals and mock interview', () => {
    const questions = sessionsForOffer(inspemonInterviewOffer).flatMap(s => s.questions);
    const start = defaultInterviewPrep(INSPemon_OFFER_ID);
    expect(practicedCount(start, questions)).toBe(0);
    expect(interviewPrepComplete(start, questions)).toBe(false);
    const all = Object.fromEntries(questions.map(q => [q.id, true]));
    const after = { ...start, practiced: all };
    expect(practicedCount(after, questions)).toBe(8);
    expect(interviewPrepComplete(after, questions)).toBe(false);
    expect(interviewPrepComplete({ ...after, mockComplete: true }, questions)).toBe(true);
  });
});
