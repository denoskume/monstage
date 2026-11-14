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

test('migrates legacy default Recommended-for-me settings so new C-ranked ATS leads remain visible', () => {
  localStorage.setItem('monstage:preferences:v1', JSON.stringify({
    ...defaultPreferences, sort: 'best', onlyForMe: true, query: 'data analyst',
  }));
  const migrated = loadPreferences();
  expect(migrated.onlyForMe).toBe(false);
  expect(migrated.sort).toBe('detected');
  expect(migrated.query).toBe('data analyst');
});
