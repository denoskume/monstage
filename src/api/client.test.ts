import { afterEach, expect, test, vi } from 'vitest';
import { ApiAuthError } from './authClient';
import { fetchOffers } from './client';

const payload = {
  generatedAt: '2026-09-15T06:00:00.000Z',
  source: 'Stage Intelligence France' as const,
  offers: [],
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  document.querySelectorAll('script[data-monstage-jsonp="true"]').forEach((element) => element.remove());
  localStorage.clear();
});

test('fetchOffers requests the protected Worker endpoint with bearer auth', async () => {
  vi.stubEnv('VITE_MONSTAGE_API_URL', 'https://monstage-auth.example/');
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => payload,
  });
  vi.stubGlobal('fetch', fetchMock);

  await expect(fetchOffers('google-id-token')).resolves.toEqual(payload);

  expect(fetchMock).toHaveBeenCalledWith(
    'https://monstage-auth.example/api/offers',
    expect.objectContaining({
      cache: 'no-store',
      headers: { Authorization: 'Bearer google-id-token' },
    }),
  );
  expect(document.querySelector('script[data-monstage-jsonp="true"]')).toBeNull();
  expect(localStorage.getItem('monstage:offers-cache:v1')).toBeNull();
});

test.each([401, 403] as const)('fetchOffers exposes auth status %s', async (status) => {
  vi.stubEnv('VITE_MONSTAGE_API_URL', 'https://monstage-auth.example');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status }));

  const error = await fetchOffers('google-id-token').catch((reason: unknown) => reason);
  expect(error).toBeInstanceOf(ApiAuthError);
  expect((error as ApiAuthError).status).toBe(status);
});

test('fetchOffers rejects an invalid Worker payload', async () => {
  vi.stubEnv('VITE_MONSTAGE_API_URL', 'https://monstage-auth.example');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ source: 'wrong', offers: [] }),
  }));

  await expect(fetchOffers('google-id-token')).rejects.toThrow('MonStage API returned an invalid payload');
});
