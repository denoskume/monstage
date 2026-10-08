import type { Env } from './env';

interface OffersPayload {
  generatedAt?: unknown;
  source?: unknown;
  offers?: unknown;
}

export async function postToAppsScript(
  env: Env,
  payload: Record<string, unknown>,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  return fetchImpl(env.APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gatewaySecret: env.APPS_SCRIPT_GATEWAY_SECRET,
      ...payload,
    }),
  });
}

export async function fetchOffersFromAppsScript(
  env: Env,
  fetchImpl: typeof fetch = fetch,
): Promise<unknown> {
  const response = await postToAppsScript(env, { action: 'offers' }, fetchImpl);

  if (!response.ok) throw new Error('BACKEND_UNAVAILABLE');

  const payload = await response.json() as OffersPayload;
  if (
    payload.source !== 'Stage Intelligence France' ||
    !Array.isArray(payload.offers) ||
    typeof payload.generatedAt !== 'string'
  ) {
    throw new Error('INVALID_BACKEND_PAYLOAD');
  }

  return payload;
}

export async function submitApplicationToAppsScript(
  env: Env,
  application: unknown,
  fetchImpl: typeof fetch = fetch,
): Promise<{ status: number; payload: unknown }> {
  const response = await postToAppsScript(env, {
    action: 'submitApplication',
    application,
  }, fetchImpl);

  let payload: unknown = null;
  try { payload = await response.json(); } catch { payload = { error: 'INVALID_BACKEND_PAYLOAD' }; }
  const logicalStatus = payload && typeof payload === 'object' && typeof (payload as { status?: unknown }).status === 'number'
    ? Number((payload as { status: number }).status)
    : response.status;
  return { status: logicalStatus, payload };
}


export async function addExternalApplicationToAppsScript(
  env: Env,
  application: unknown,
  fetchImpl: typeof fetch = fetch,
): Promise<{ status: number; payload: unknown }> {
  const response = await postToAppsScript(env, {
    action: 'addExternalApplication',
    application,
  }, fetchImpl);

  let payload: unknown = null;
  try { payload = await response.json(); } catch { payload = { error: 'INVALID_BACKEND_PAYLOAD' }; }
  const logicalStatus = payload && typeof payload === 'object' && typeof (payload as { status?: unknown }).status === 'number'
    ? Number((payload as { status: number }).status)
    : response.status;
  return { status: logicalStatus, payload };
}
