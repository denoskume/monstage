import { beforeEach, expect, test } from 'vitest';
import { defaultPreferences, loadPreferences, savePreferences } from './preferences';

beforeEach(() => localStorage.clear());

test('returns defaults when no preferences exist', () => {
  expect(loadPreferences()).toEqual(defaultPreferences);
});

test('persists user view settings', () => {
  const next = { ...defaultPreferences, sort: 'score' as const, query: 'vision' };
  savePreferences(next);
  expect(loadPreferences()).toEqual(next);
});
