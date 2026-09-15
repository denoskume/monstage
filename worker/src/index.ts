import { AuthError, verifyAuthorizedUser } from './auth';
import { fetchOffersFromAppsScript } from './appsScript';
import { getCachedOffers, putCachedOffers } from './cache';
import { allowedOrigin, responseHeaders } from './cors';
import type { AuthorizedUser, Env } from './env';

const OFFERS_CACHE_TTL_SECONDS = 300;

export interface WorkerDependencies {
  verifyUser: (token: string, env: Env) => Promise<AuthorizedUser>;
  fetchOffers: (env: Env) => Promise<unknown>;
  getCachedOffers: () => Promise<unknown | null>;
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

  try {
    const cachedOffers = await dependencies.getCachedOffers();
    if (cachedOffers !== null) {
      return jsonResponse(cachedOffers, 200, origin);
    }

    const offers = await dependencies.fetchOffers(env);
    await dependencies.putCachedOffers(offers, OFFERS_CACHE_TTL_SECONDS);
    return jsonResponse(offers, 200, origin);
  } catch {
    return jsonResponse({ error: 'BACKEND_UNAVAILABLE' }, 502, origin);
  }
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
};
