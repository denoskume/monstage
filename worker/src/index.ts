import { AuthError, verifyAuthorizedUser } from './auth';
import { addExternalApplicationToAppsScript, fetchOffersFromAppsScript, submitApplicationToAppsScript } from './appsScript';
import { clearCachedOffers, getCachedOffers, putCachedOffers, type CachedOffers } from './cache';
import { allowedOrigin, responseHeaders } from './cors';
import type { AuthorizedUser, Env } from './env';
import { buildCvPdfResponse } from './cvPdf';
import { buildCoverLetterPdfResponse } from './clPdf';

const OFFERS_CACHE_FRESHNESS_MS = 5 * 60 * 1000;
const OFFERS_CACHE_MAX_STALE_MS = 15 * 60 * 1000;
const OFFERS_CACHE_RETENTION_SECONDS = 15 * 60;

export interface WorkerDependencies {
  verifyUser: (token: string, env: Env) => Promise<AuthorizedUser>;
  fetchOffers: (env: Env) => Promise<unknown>;
  submitApplication?: (env: Env, application: unknown) => Promise<{ status: number; payload: unknown }>;
  addExternalApplication?: (env: Env, application: unknown) => Promise<{ status: number; payload: unknown }>;
  getCachedOffers: () => Promise<CachedOffers | null>;
  clearCachedOffers?: () => Promise<void>;
  putCachedOffers: (payload: unknown, ttlSeconds: number) => Promise<void>;
}

const defaultDependencies: WorkerDependencies = {
  verifyUser: verifyAuthorizedUser,
  fetchOffers: fetchOffersFromAppsScript,
  submitApplication: submitApplicationToAppsScript,
  addExternalApplication: addExternalApplicationToAppsScript,
  getCachedOffers,
  clearCachedOffers,
  putCachedOffers,
};

function bearerToken(request: Request): string | null {
  const authorization = request.headers.get('Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) return null;
  const token = authorization.slice('Bearer '.length).trim();
  return token || null;
}

function jsonResponse(payload: unknown, status: number, origin: string | null): Response {
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

function isWithinMaxStale(cached: CachedOffers): boolean {
  return Date.now() - cached.cachedAt <= OFFERS_CACHE_MAX_STALE_MS;
}

export async function handleRequest(
  request: Request,
  env: Env,
  dependencies: WorkerDependencies = defaultDependencies,
): Promise<Response> {
  const origin = allowedOrigin(request, env);
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: responseHeaders(origin) });
  }

  const isSessionRoute = request.method === 'GET' && url.pathname === '/api/session';
  const isOffersRoute = request.method === 'GET' && url.pathname === '/api/offers';
  const isSubmitRoute = request.method === 'POST' && url.pathname === '/api/applications/submit';
  const isExternalApplicationRoute = request.method === 'POST' && url.pathname === '/api/applications/external';
  const isCvPdfRoute = request.method === 'POST' && url.pathname === '/api/cv/pdf';
  const isClPdfRoute = request.method === 'POST' && url.pathname === '/api/cl/pdf';

  if (!isSessionRoute && !isOffersRoute && !isSubmitRoute && !isExternalApplicationRoute && !isCvPdfRoute && !isClPdfRoute) {
    return jsonResponse({ error: 'NOT_FOUND' }, 404, origin);
  }

  let token = bearerToken(request);
  let cvDraftFromForm: unknown = null;

  if ((isCvPdfRoute || isClPdfRoute) && !token) {
    try {
      const form = await request.formData();
      token = String(form.get('credential') || '').trim() || null;
      const draftText = String(form.get('draft') || '');
      cvDraftFromForm = draftText ? JSON.parse(draftText) : null;
    } catch {
      return jsonResponse({ error: 'INVALID_REQUEST' }, 400, origin);
    }
  }

  if (!token) return jsonResponse({ error: 'UNAUTHORIZED' }, 401, origin);

  let user: AuthorizedUser;
  try {
    user = await dependencies.verifyUser(token, env);
  } catch (error) {
    return authErrorResponse(error, origin);
  }

  if (isSessionRoute) return jsonResponse({ user }, 200, origin);

  if (isCvPdfRoute || isClPdfRoute) {
    let draft = cvDraftFromForm;
    if (!draft) {
      try { draft = await request.json(); } catch { return jsonResponse({ error: 'INVALID_REQUEST' }, 400, origin); }
    }
    if (!draft || typeof draft !== 'object') return jsonResponse({ error: 'INVALID_REQUEST' }, 400, origin);
    try {
      return isClPdfRoute
        ? await buildCoverLetterPdfResponse(draft as Record<string, unknown>, origin)
        : await buildCvPdfResponse(draft as Record<string, unknown>, origin);
    } catch {
      return jsonResponse({ error: 'PDF_GENERATION_FAILED' }, 500, origin);
    }
  }

  if (isExternalApplicationRoute) {
    let body: unknown;
    try { body = await request.json(); } catch { return jsonResponse({ error: 'INVALID_REQUEST' }, 400, origin); }
    if (!body || typeof body !== 'object') return jsonResponse({ error: 'INVALID_REQUEST' }, 400, origin);

    try {
      const addExternalApplication = dependencies.addExternalApplication ?? defaultDependencies.addExternalApplication!;
      const result = await addExternalApplication(env, {
        ...(body as Record<string, unknown>),
        authenticatedEmail: user.email,
        authenticatedName: user.name,
      });
      if (result.status >= 200 && result.status < 300) {
        await (dependencies.clearCachedOffers ?? clearCachedOffers)();
      }
      return jsonResponse(result.payload, result.status, origin);
    } catch {
      return jsonResponse({ error: 'BACKEND_UNAVAILABLE', message: 'Application tracking backend unavailable.' }, 502, origin);
    }
  }

  if (isSubmitRoute) {
    let body: unknown;
    try { body = await request.json(); } catch { return jsonResponse({ error: 'INVALID_REQUEST' }, 400, origin); }
    if (!body || typeof body !== 'object') return jsonResponse({ error: 'INVALID_REQUEST' }, 400, origin);

    const candidate = body as Record<string, unknown>;
    const application = {
      ...candidate,
      authenticatedEmail: user.email,
      authenticatedName: user.name,
    };

    try {
      const submitApplication = dependencies.submitApplication ?? defaultDependencies.submitApplication!;
      const result = await submitApplication(env, application);
      return jsonResponse(result.payload, result.status, origin);
    } catch {
      return jsonResponse({ error: 'BACKEND_UNAVAILABLE', message: 'Application backend unavailable.' }, 502, origin);
    }
  }

  const cachedOffers = await dependencies.getCachedOffers();
  if (cachedOffers && isFresh(cachedOffers)) return jsonResponse(cachedOffers.payload, 200, origin);

  try {
    const offers = await dependencies.fetchOffers(env);
    await dependencies.putCachedOffers(offers, OFFERS_CACHE_RETENTION_SECONDS);
    return jsonResponse(offers, 200, origin);
  } catch {
    if (cachedOffers && isWithinMaxStale(cachedOffers)) return jsonResponse(cachedOffers.payload, 200, origin);
    return jsonResponse({ error: 'BACKEND_UNAVAILABLE' }, 502, origin);
  }
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
};
