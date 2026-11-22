import { describe, expect, it } from 'vitest';
import { weeks } from './program';
import { emptyTraining, progress, setTask, validateTraining, plannedDate } from './training';

describe('suivi du stage', () => {
  it('starts at zero and counts only completed program tasks', () => {
    const initial = emptyTraining();
    expect(progress(initial).percent).toBe(0);
    const first = weeks[0].days[0].tasks[0];
    const next = setTask(initial, first.id, true);
    expect(progress(next).completed).toBe(1);
    expect(progress({ ...next, tasks: { ...next.tasks, obsolete: true } }).completed).toBe(1);
    expect(progress(setTask(next, first.id, false)).completed).toBe(0);
  });
  it('requires a new mastery review when a task is reopened', () => {
    const state = { ...emptyTraining(), mastered: { 'w1': true } };
    expect(setTask(state, weeks[0].days[0].tasks[0].id, false).mastered.w1).toBe(false);
  });
  it('has 40 distinct practical days across eight weeks, with basics on days 1 and 2', () => {
    expect(weeks).toHaveLength(8);
    const days = weeks.flatMap(w => w.days);
    expect(days).toHaveLength(40);
    expect(new Set(days.map(d => d.id)).size).toBe(40);
    expect(days[0].title).toMatch(/Lire/);
    expect(days[1].title).toMatch(/Extraire/);
  });
  it('rejects invalid backups instead of silently losing progress', () => {
    expect(() => validateTraining({ version: 1, tasks: 'bad' })).toThrow();
    expect(validateTraining(emptyTraining())).toEqual(emptyTraining());
  });
});

it('schedules five working sessions while preserving explicit day overrides', () => {
  const state = { ...emptyTraining(), startDate: '2026-11-07' };
  expect(plannedDate(state, 0, 0)).toBe('2026-11-09');
  expect(plannedDate(state, 1, 0)).toBe('2026-11-16');
  expect(plannedDate({ ...state, logs: { w1d1: { minutes: 0, notes: '', blocker: '', evidence: '', date: '2026-11-08' } } }, 0, 0)).toBe('2026-11-08');
});
it('does not count a mastery declaration after its evidence is removed', async () => {
  const { masteryReady } = await import('./training');
  const { quizzes } = await import('./quizzes');
  const state = emptyTraining();
  state.tasks = Object.fromEntries(weeks[0].days.flatMap(d => d.tasks).map(t => [t.id, true]));
  state.lessonRead = { w1: true };
  state.answers = Object.fromEntries(quizzes[0].map((q, i) => [`w1q${i}`, q.correct]));
  state.logs = { w1d1: { minutes: 60, notes: '', blocker: '', evidence: 'commit abc', date: '' } };
  expect(masteryReady(state, 0)).toBe(true);
  state.logs.w1d1.evidence = '';
  expect(masteryReady(state, 0)).toBe(false);
});
it('preserves legacy progress and accepts daily learning records', () => {
  const original = { ...emptyTraining(), tasks: { w1d1t1: true } };
  const state = { ...original, dailyStudy: { w1d1: true }, dailyReviews: { w1d1: { checks: [false,true,false], answers: ['', 'shape'], evidence: 'commit abc', feedback: 'À revoir', decision: 'pending' as const } } };
  expect(validateTraining(JSON.parse(JSON.stringify(state)))).toEqual(state);
  expect(validateTraining(original).tasks.w1d1t1).toBe(true);
  expect(setTask({ ...state, dailyReviews: { w1d1: { ...state.dailyReviews.w1d1, decision: 'autonomous' } } }, 'w1d1t1', false).dailyReviews?.w1d1.decision).toBe('pending');
});
