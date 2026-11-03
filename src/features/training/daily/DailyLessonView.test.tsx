import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { DailyLessonView, dailyGuide } from './DailyLessonView';
import { weeks5to8 } from './weeks5to8';
import { validateTraining, emptyTraining } from '../training';
test('lets the learner answer out of order without corrupting the saved review', async () => {
  const user = userEvent.setup();
  const onReview = vi.fn();
  const lesson = weeks5to8[0];
  render(<DailyLessonView lesson={lesson} title="Diagnostic" studied={false} disabled={false} tasksDone={false} onStudy={vi.fn()} onReview={onReview} onPractice={vi.fn()} />);
  await user.click(screen.getByLabelText('Preuve vérifiée : ' + lesson.exercise.acceptance[2]));
  const review = onReview.mock.calls.at(-1)![0];
  expect(() => validateTraining(JSON.parse(JSON.stringify({ ...emptyTraining(), dailyReviews: { w5d1: review } })))).not.toThrow();
  expect(screen.getByRole('option', { name: 'Autonomie démontrée après revue' })).toBeDisabled();
  expect(dailyGuide(lesson, 'Diagnostic')).toContain(lesson.correction.code);
});
