import { weeks1to4 } from './weeks1to4';
import { weeks5to8 } from './weeks5to8';
import type { DailyLesson } from './types';
export const dailyLessons: Record<string, DailyLesson> = Object.fromEntries([...weeks1to4, ...weeks5to8].map(lesson => [lesson.id, lesson]));
