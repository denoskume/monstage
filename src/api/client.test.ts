import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { fetchOffers, loadCachedOffers, saveCachedOffers } from './client';

const payload = {
  generatedAt: '2026-09-15T06:00:00.000Z',
  source: 'Stage Intelligence France' as const,
  offers: [],
};

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

test('fetchOffers returns validated API payload and caches it', async () => {
  vi.stubEnv('VITE_MONSTAGE_API_URL', 'https://example.test/exec');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => payload }));
  await expect(fetchOffers()).resolves.toEqual(payload);
  expect(loadCachedOffers()).toEqual(payload);
});

test('fetchOffers uses JSONP for Google Apps Script web apps', async () => {
  vi.stubEnv('VITE_MONSTAGE_API_URL', 'https://script.google.com/macros/s/example/exec');
  const request = fetchOffers();
  const script = document.querySelector<HTMLScriptElement>('script[data-monstage-jsonp="true"]');
  expect(script).not.toBeNull();
  const callback = new URL(script!.src).searchParams.get('callback');
  expect(callback).toMatch(/^__monstage_jsonp_/);
  (window as unknown as Record<string, (value: unknown) => void>)[callback!](payload);
  await expect(request).resolves.toEqual(payload);
  expect(loadCachedOffers()).toEqual(payload);
  expect(document.querySelector('script[data-monstage-jsonp="true"]')).toBeNull();
});

test('fetchOffers throws on non-ok response', async () => {
  vi.stubEnv('VITE_MONSTAGE_API_URL', 'https://example.test/exec');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
  await expect(fetchOffers()).rejects.toThrow('MonStage API request failed: 500');
});

test('saveCachedOffers round-trips data', () => {
  saveCachedOffers(payload);
  expect(loadCachedOffers()).toEqual(payload);
});
