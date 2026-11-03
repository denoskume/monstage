import type { DailyLesson } from './types';
export interface DailyReview { checks: boolean[]; answers: string[]; evidence: string; feedback: string; decision: 'pending' | 'retry' | 'autonomous'; }
export const emptyDailyReview = (): DailyReview => ({ checks: [], answers: [], evidence: '', feedback: '', decision: 'pending' });
export function dailyReviewReady(lesson: DailyLesson, review?: DailyReview): boolean {
  return !!review && lesson.exercise.acceptance.every((_, i) => review.checks[i] === true)
    && lesson.review.every((_, i) => (review.answers[i]?.trim().length ?? 0) >= 3)
    && review.evidence.trim().length >= 8 && review.feedback.trim().length >= 8;
}
