import { describe, expect, test, vi } from 'vitest';
import { AuthError } from '../src/auth';
import { fetchOffersFromAppsScript } from '../src/appsScript';
import { handleRequest, type WorkerDependencies } from '../src/index';
import type { CachedOffers } from '../src/cache';
import type { Env } from '../src/env';

const env: Env = {
  GOOGLE_CLIENT_ID: 'monstage-client-id.apps.googleusercontent.com',
  ALLOWED_ORIGINS: 'https://denoskume.github.io,http://localhost:5173',
  ALLOWED_EMAIL: 'owner@example.test',
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/example/exec',
  APPS_SCRIPT_GATEWAY_SECRET: 'gateway-secret',
};

const user = {
  email: 'owner@example.test',
  name: 'MonStage Owner',
  picture: null,
};

const offersPayload = {
  generatedAt: '2026-09-15T07:00:00.000Z',
  source: 'Stage Intelligence France',
  offers: [{ id: 'offer-1', company: 'Example', title: 'ML Intern' }],
};

const refreshedOffersPayload = {
  generatedAt: '2026-09-15T08:00:00.000Z',
  source: 'Stage Intelligence France',
  offers: [{ id: 'offer-2', company: 'Example 2', title: 'CV Intern' }],
};

function request(path: string, options: { token?: string; origin?: string; method?: string } = {}) {
  const headers = new Headers();
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`);
  if (options.origin) headers.set('Origin', options.origin);
  return new Request(`https://monstage-auth.example${path}`, {
    method: options.method ?? 'GET',
    headers,
  });
}

function dependencies(): WorkerDependencies {
  return {
    verifyUser: vi.fn(async (token: string) => {
      if (token === 'authorized-token') return user;
      if (token === 'wrong-account-token') throw new AuthError(403, 'ACCESS_DENIED');
      throw new AuthError(401, 'INVALID_TOKEN');
    }),
    fetchOffers: vi.fn(async () => offersPayload),
    getCachedOffers: vi.fn(async () => null),
    putCachedOffers: vi.fn(async () => undefined),
  };
}

describe('MonStage Worker routes', () => {
  test('requires a bearer token for protected routes', async () => {
    const deps = dependencies();
    const response = await handleRequest(
      request('/api/session', { origin: 'https://denoskume.github.io' }),
      env,
      deps,
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'UNAUTHORIZED' });
    expect(deps.verifyUser).not.toHaveBeenCalled();
  });

  test('returns 403 for a valid but unauthorized Google account', async () => {
    const response = await handleRequest(
      request('/api/session', {
        token: 'wrong-account-token',
        origin: 'https://denoskume.github.io',
      }),
      env,
      dependencies(),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'ACCESS_DENIED' });
  });

  test('returns the authorized user from the session route', async () => {
    const response = await handleRequest(
      request('/api/session', {
        token: 'authorized-token',
        origin: 'https://denoskume.github.io',
      }),
      env,
      dependencies(),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ user });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://denoskume.github.io');
    expect(response.headers.get('Vary')).toBe('Origin');
  });

  test('returns offers only after authorization', async () => {
    const deps = dependencies();
    const response = await handleRequest(
      request('/api/offers', {
        token: 'authorized-token',
        origin: 'https://denoskume.github.io',
      }),
      env,
      deps,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(offersPayload);
    expect(deps.fetchOffers).toHaveBeenCalledWith(env);
    expect(deps.putCachedOffers).toHaveBeenCalledWith(offersPayload, 900);
  });

  test('serves fresh cached offers after authorization without refetching Apps Script', async () => {
    const deps = dependencies();
    deps.getCachedOffers = vi.fn(async () => ({
      payload: offersPayload,
      cachedAt: Date.now() - 60_000,
    }));

    const response = await handleRequest(
      request('/api/offers', {
        token: 'authorized-token',
        origin: 'https://denoskume.github.io',
      }),
      env,
      deps,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(offersPayload);
    expect(deps.fetchOffers).not.toHaveBeenCalled();
    expect(deps.putCachedOffers).not.toHaveBeenCalled();
  });

  test('refreshes stale cached offers when Apps Script is available', async () => {
    const deps = dependencies();
    deps.getCachedOffers = vi.fn(async () => ({
      payload: offersPayload,
      cachedAt: Date.now() - (10 * 60 * 1000),
    }));
    deps.fetchOffers = vi.fn(async () => refreshedOffersPayload);

    const response = await handleRequest(
      request('/api/offers', {
        token: 'authorized-token',
        origin: 'https://denoskume.github.io',
      }),
      env,
      deps,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(refreshedOffersPayload);
    expect(deps.fetchOffers).toHaveBeenCalledTimes(1);
    expect(deps.putCachedOffers).toHaveBeenCalledWith(refreshedOffersPayload, 900);
  });

  test('serves stale cached offers when Apps Script refresh fails', async () => {
    const deps = dependencies();
    deps.getCachedOffers = vi.fn(async () => ({
      payload: offersPayload,
      cachedAt: Date.now() - (10 * 60 * 1000),
    }));
    deps.fetchOffers = vi.fn(async () => {
      throw new Error('BACKEND_UNAVAILABLE');
    });

    const response = await handleRequest(
      request('/api/offers', {
        token: 'authorized-token',
        origin: 'https://denoskume.github.io',
      }),
      env,
      deps,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(offersPayload);
    expect(deps.fetchOffers).toHaveBeenCalledTimes(1);
    expect(deps.putCachedOffers).not.toHaveBeenCalled();
  });

  test('rejects cache older than 15 minutes when Apps Script refresh fails', async () => {\n    const deps = dependencies();\n    deps.getCachedOffers = vi.fn(async () => ({\n      payload: offersPayload,\n      cachedAt: Date.now() - (16 * 60 * 1000),\n    }));\n    deps.fetchOffers = vi.fn(async () => {\n      throw new Error('BACKEND_UNAVAILABLE');\n    });\n\n    const response = await handleRequest(\n      request('/api/offers', {\n        token: 'authorized-token',\n        origin: 'https://denoskume.github.io',\n      }),\n      env,\n      deps,\n    );\n\n    expect(response.status).toBe(502);\n    expect(await response.json()).toEqual({ error: 'BACKEND_UNAVAILABLE' });\n  });\n\n  test('never exposes cached offers to an unauthorized account', async () => {
    const deps = dependencies();
    deps.getCachedOffers = vi.fn(async (): Promise<CachedOffers> => ({
      payload: offersPayload,
      cachedAt: Date.now(),
    }));

    const response = await handleRequest(
      request('/api/offers', {
        token: 'wrong-account-token',
        origin: 'https://denoskume.github.io',
      }),
      env,
      deps,
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'ACCESS_DENIED' });
    expect(deps.getCachedOffers).not.toHaveBeenCalled();
    expect(deps.fetchOffers).not.toHaveBeenCalled();
  });

  test('returns 502 only when both cache and Apps Script are unavailable', async () => {
    const deps = dependencies();
    deps.fetchOffers = vi.fn(async () => {
      throw new Error('BACKEND_UNAVAILABLE');
    });

    const response = await handleRequest(
      request('/api/offers', {
        token: 'authorized-token',
        origin: 'https://denoskume.github.io',
      }),
      env,
      deps,
    );

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'BACKEND_UNAVAILABLE' });
  });

  test('does not grant CORS to an unconfigured origin', async () => {
    const response = await handleRequest(
      request('/api/session', {
        token: 'authorized-token',
        origin: 'https://evil.example',
      }),
      env,
      dependencies(),
    );

    expect(response.status).toBe(200);
    expect(response.headers.has('Access-Control-Allow-Origin')).toBe(false);
  });

  test('handles CORS preflight without authentication', async () => {
    const response = await handleRequest(
      request('/api/offers', {
        method: 'OPTIONS',
        origin: 'https://denoskume.github.io',
      }),
      env,
      dependencies(),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://denoskume.github.io');
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Authorization');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
  });

  test('returns 404 for unknown routes', async () => {
    const response = await handleRequest(
      request('/api/unknown', {
        token: 'authorized-token',
        origin: 'https://denoskume.github.io',
      }),
      env,
      dependencies(),
    );

    expect(response.status).toBe(404);
  });
});

describe('Apps Script proxy', () => {
  test('sends the gateway secret in a POST body and never returns it', async () => {
    const mockFetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe('POST');
      expect(init?.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(JSON.parse(String(init?.body))).toEqual({ gatewaySecret: 'gateway-secret' });
      return new Response(JSON.stringify(offersPayload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const payload = await fetchOffersFromAppsScript(env, mockFetch as typeof fetch);

    expect(payload).toEqual(offersPayload);
    expect(JSON.stringify(payload)).not.toContain('gateway-secret');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('rejects an invalid backend payload', async () => {
    const mockFetch = vi.fn(async () => new Response(JSON.stringify({ offers: [] }), { status: 200 }));
    await expect(fetchOffersFromAppsScript(env, mockFetch as typeof fetch)).rejects.toThrow('INVALID_BACKEND_PAYLOAD');
  });
});
