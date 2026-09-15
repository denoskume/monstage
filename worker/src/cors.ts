import type { Env } from './env';

export function allowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin');
  if (!origin) return null;

  const allowed = env.ALLOWED_ORIGINS
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return allowed.includes(origin) ? origin : null;
}

export function responseHeaders(origin: string | null): Headers {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
  });

  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  }

  return headers;
}
