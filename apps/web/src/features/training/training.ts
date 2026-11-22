import type { DailyReview } from './daily/review';
import { quizzes } from './quizzes';
import { weeks } from './program';
export interface DayLog { minutes: number; notes: string; blocker: string; evidence: string; date: string; }
export interface TrainingState { dailyStudy?: Record<string, boolean>; dailyReviews?: Record<string, DailyReview>; answers?: Record<string, number>; lessonRead?: Record<string, boolean>; version: 1; startDate: string; tasks: Record<string, boolean>; mastered: Record<string, boolean>; logs: Record<string, DayLog>; }
export const emptyTraining = (): TrainingState => ({ version: 1, startDate: '', tasks: {}, mastered: {}, logs: {} });
export const emptyLog = (): DayLog => ({ minutes: 0, notes: '', blocker: '', evidence: '', date: '' });
export function progress(state: TrainingState, weekId?: string) {
  const selected = weeks.filter(w => !weekId || w.id === weekId);
  const tasks = selected.flatMap(w => w.days.flatMap(d => d.tasks));
  const completed = tasks.filter(t => state.tasks[t.id] === true).length;
  return { completed, total: tasks.length, percent: tasks.length ? Math.round(completed / tasks.length * 100) : 0 };
}
export function setTask(state: TrainingState, id: string, done: boolean): TrainingState {
  const week = weeks.find(w => w.days.some(d => d.tasks.some(t => t.id === id)));
  const day = week?.days.find(d => d.tasks.some(t => t.id === id));
  const dailyReviews = !done && day && state.dailyReviews?.[day.id] ? { ...state.dailyReviews, [day.id]: { ...state.dailyReviews[day.id], decision: 'pending' as const } } : state.dailyReviews;
  return { ...state, ...(dailyReviews ? { dailyReviews } : {}), tasks: { ...state.tasks, [id]: done }, mastered: { ...state.mastered, ...(!done && week ? { [week.id]: false } : {}) } };
}
function record(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value); }
function validDate(value: unknown): value is string {
  if (value === '') return true;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T12:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function validateTraining(value: unknown): TrainingState {
  if (!record(value) || value.version !== 1 || !validDate(value.startDate) || !record(value.tasks) || !record(value.mastered) || !record(value.logs)) throw new Error('Sauvegarde de stage invalide.');
  if (![...Object.values(value.tasks), ...Object.values(value.mastered)].every(v => typeof v === 'boolean')) throw new Error('Progression invalide.');
  for (const log of Object.values(value.logs)) {
    if (!record(log) || typeof log.minutes !== 'number' || !Number.isFinite(log.minutes) || log.minutes < 0 || log.minutes > 1440 || !validDate(log.date) || !['notes', 'blocker', 'evidence'].every(k => typeof log[k] === 'string' && (log[k] as string).length <= 10000)) throw new Error('Journal invalide.');
  }
  if (value.answers !== undefined && (!record(value.answers) || !Object.values(value.answers).every(v => Number.isInteger(v) && Number(v) >= 0 && Number(v) < 3))) throw new Error('Réponses invalides.');
  if (value.lessonRead !== undefined && (!record(value.lessonRead) || !Object.values(value.lessonRead).every(v => typeof v === 'boolean'))) throw new Error('Lectures invalides.');
  if (value.dailyStudy !== undefined && (!record(value.dailyStudy) || !Object.values(value.dailyStudy).every(v => typeof v === 'boolean'))) throw new Error('Suivi quotidien invalide.');
  if (value.dailyReviews !== undefined) {
    if (!record(value.dailyReviews)) throw new Error('Revues invalides.');
    for (const review of Object.values(value.dailyReviews)) {
      if (!record(review) || !Array.isArray(review.checks) || review.checks.length > 20 || !review.checks.every(v => typeof v === 'boolean')
        || !Array.isArray(review.answers) || review.answers.length > 20 || !review.answers.every(v => typeof v === 'string' && v.length <= 10000)
        || !['evidence','feedback'].every(k => typeof review[k] === 'string' && (review[k] as string).length <= 10000)
        || !['pending','retry','autonomous'].includes(String(review.decision))) throw new Error('Revue quotidienne invalide.');
    }
  }
  return value as unknown as TrainingState;
}
export function plannedDate(state: TrainingState, weekIndex: number, dayIndex: number): string {
  const override = state.logs[weeks[weekIndex].days[dayIndex].id]?.date;
  if (override) return override;
  if (!state.startDate) return '';
  const date = new Date(state.startDate + 'T12:00:00Z');
  // Five working sessions each week; weekends remain available for catch-up.
  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) date.setUTCDate(date.getUTCDate() + 1);
  let remaining = weekIndex * 5 + dayIndex;
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) remaining--;
  }
  return date.toISOString().slice(0, 10);
}

export function masteryReady(state: TrainingState, index: number): boolean {
  const week = weeks[index];
  return progress(state, week.id).percent === 100 && !!state.lessonRead?.[week.id]
    && quizzes[index].every((q, qi) => state.answers?.[`${week.id}q${qi}`] === q.correct)
    && week.days.some(d => !!state.logs[d.id]?.evidence.trim() || !!state.dailyReviews?.[d.id]?.evidence.trim());
}
