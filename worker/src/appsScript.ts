import type { Env } from './env';

interface OffersPayload {
  generatedAt?: unknown;
  source?: unknown;
  offers?: unknown;
}

export async function fetchOffersFromAppsScript(
  env: Env,
  fetchImpl: typeof fetch = fetch,
): Promise<unknown> {
  const response = await fetchImpl(env.APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gatewaySecret: env.APPS_SCRIPT_GATEWAY_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error('BACKEND_UNAVAILABLE');
  }

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
