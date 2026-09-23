import { AuthError, verifyAuthorizedUser } from './auth';
import { fetchOffersFromAppsScript } from './appsScript';
import { getCachedOffers, putCachedOffers, type CachedOffers } from './cache';
import { allowedOrigin, responseHeaders } from './cors';
import type { AuthorizedUser, Env } from './env';

const OFFERS_CACHE_FRESHNESS_MS = 5 * 60 * 1000;
const OFFERS_CACHE_MAX_STALE_MS = 15 * 60 * 1000;\nconst OFFERS_CACHE_RETENTION_SECONDS = 15 * 60;

export interface WorkerDependencies {
  verifyUser: (token: string, env: Env) => Promise<AuthorizedUser>;
  fetchOffers: (env: Env) => Promise<unknown>;
  getCachedOffers: () => Promise<CachedOffers | null>;
  putCachedOffers: (payload: unknown, ttlSeconds: number) => Promise<void>;
}

const defaultDependencies: WorkerDependencies = {
  verifyUser: verifyAuthorizedUser,
  fetchOffers: fetchOffersFromAppsScript,
  getCachedOffers,
  putCachedOffers,
};

function bearerToken(request: Request): string | null {
  const authorization = request.headers.get('Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) return null;
  const token = authorization.slice('Bearer '.length).trim();
  return token || null;
}

function jsonResponse(
  payload: unknown,
  status: number,
  origin: string | null,
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: responseHeaders(origin),
  });
}

function authErrorResponse(error: unknown, origin: string | null): Response {
  if (error instanceof AuthError && error.status === 403) {
    return jsonResponse({ error: 'ACCESS_DENIED' }, 403, origin);
  }
  return jsonResponse({ error: 'UNAUTHORIZED' }, 401, origin);
}

function isFresh(cached: CachedOffers): boolean {
  return Date.now() - cached.cachedAt <= OFFERS_CACHE_FRESHNESS_MS;
}

export async function handleRequest(
  request: Request,
  env: Env,
  dependencies: WorkerDependencies = defaultDependencies,
): Promise<Response> {
  const origin = allowedOrigin(request, env);
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: responseHeaders(origin),
    });
  }

  const isSessionRoute = request.method === 'GET' && url.pathname === '/api/session';
  const isOffersRoute = request.method === 'GET' && url.pathname === '/api/offers';

  if (!isSessionRoute && !isOffersRoute) {
    return jsonResponse({ error: 'NOT_FOUND' }, 404, origin);
  }

  const token = bearerToken(request);
  if (!token) {
    return jsonResponse({ error: 'UNAUTHORIZED' }, 401, origin);
  }

  let user: AuthorizedUser;
  try {
    user = await dependencies.verifyUser(token, env);
  } catch (error) {
    return authErrorResponse(error, origin);
  }

  if (isSessionRoute) {
    return jsonResponse({ user }, 200, origin);
  }

  const cachedOffers = await dependencies.getCachedOffers();
  if (cachedOffers && isFresh(cachedOffers)) {
    return jsonResponse(cachedOffers.payload, 200, origin);
  }

  try {
    const offers = await dependencies.fetchOffers(env);
    await dependencies.putCachedOffers(offers, OFFERS_CACHE_RETENTION_SECONDS);
    return jsonResponse(offers, 200, origin);
  } catch {
    if (cachedOffers) {
      return jsonResponse(cachedOffers.payload, 200, origin);
    }
    return jsonResponse({ error: 'BACKEND_UNAVAILABLE' }, 502, origin);
  }
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
};
