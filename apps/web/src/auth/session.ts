const TOKEN_KEY = 'monstage:google-id-token:v1';
const LEGACY_OFFERS_CACHE_KEY = 'monstage:offers-cache:v1';

export function readSessionToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeSessionToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function cleanupLegacyOfferCache(): void {
  try {
    localStorage.removeItem(LEGACY_OFFERS_CACHE_KEY);
  } catch {
    // Storage may be unavailable in restricted browser modes.
  }
}

export function clearProtectedSession(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage may be unavailable in restricted browser modes.
  }
  cleanupLegacyOfferCache();
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const json = atob(padded);
    const value = JSON.parse(json) as unknown;
    return value && typeof value === 'object' ? value as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export function isTokenExpiredForUx(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  return payload.exp <= Math.floor(Date.now() / 1000);
}
