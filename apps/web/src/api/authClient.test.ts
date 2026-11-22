import { afterEach, expect, test, vi } from 'vitest';
import { ApiAuthError, fetchSession } from './authClient';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

test('fetchSession validates the bearer credential through the Worker', async () => {
  vi.stubEnv('VITE_MONSTAGE_API_URL', 'https://monstage-auth.example');
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      user: { email: 'owner@example.test', name: 'Owner', picture: null },
    }),
  });
  vi.stubGlobal('fetch', fetchMock);

  await expect(fetchSession('google-id-token')).resolves.toEqual({
    email: 'owner@example.test',
    name: 'Owner',
    picture: null,
  });

  expect(fetchMock).toHaveBeenCalledWith(
    'https://monstage-auth.example/api/session',
    expect.objectContaining({
      cache: 'no-store',
      headers: { Authorization: 'Bearer google-id-token' },
    }),
  );
});

test.each([401, 403] as const)('fetchSession exposes auth status %s without leaking server detail', async (status) => {
  vi.stubEnv('VITE_MONSTAGE_API_URL', 'https://monstage-auth.example');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status }));

  const error = await fetchSession('google-id-token').catch((reason: unknown) => reason);
  expect(error).toBeInstanceOf(ApiAuthError);
  expect((error as ApiAuthError).status).toBe(status);
});
