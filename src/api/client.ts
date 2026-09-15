import type { OffersApiResponse } from './contract';

const CACHE_KEY = 'monstage:offers-cache:v1';
const JSONP_TIMEOUT_MS = 12_000;

function isOffersApiResponse(value: unknown): value is OffersApiResponse {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<OffersApiResponse>;
  return candidate.source === 'Stage Intelligence France' && Array.isArray(candidate.offers) && typeof candidate.generatedAt === 'string';
}

export function saveCachedOffers(data: OffersApiResponse): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Local storage can be unavailable in private/restricted browser modes.
  }
}

export function loadCachedOffers(): OffersApiResponse | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(CACHE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isOffersApiResponse(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function buildJsonpUrl(url: string, callbackName: string): string {
  const parsed = new URL(url);
  parsed.searchParams.set('callback', callbackName);
  return parsed.toString();
}

function requiresJsonp(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return hostname === 'script.google.com' || hostname.endsWith('.script.googleusercontent.com');
  } catch {
    return false;
  }
}

function fetchOffersViaJsonp(url: string): Promise<OffersApiResponse> {
  return new Promise((resolve, reject) => {
    const callbackName = `__monstage_jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const callbackHost = window as unknown as Record<string, unknown>;
    const script = document.createElement('script');
    let settled = false;

    const cleanup = () => {
      script.remove();
      delete callbackHost[callbackName];
    };

    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('MonStage API request timed out'));
    }, JSONP_TIMEOUT_MS);

    callbackHost[callbackName] = (value: unknown) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      cleanup();

      if (!isOffersApiResponse(value)) {
        reject(new Error('MonStage API returned an invalid payload'));
        return;
      }

      saveCachedOffers(value);
      resolve(value);
    };

    script.async = true;
    script.dataset.monstageJsonp = 'true';
    script.src = buildJsonpUrl(url, callbackName);
    script.onerror = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      cleanup();
      reject(new Error('MonStage API request failed'));
    };
    document.head.appendChild(script);
  });
}

async function fetchOffersViaCors(url: string): Promise<OffersApiResponse> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`MonStage API request failed: ${response.status}`);

  const data = await response.json() as unknown;
  if (!isOffersApiResponse(data)) {
    throw new Error('MonStage API returned an invalid payload');
  }
  saveCachedOffers(data);
  return data;
}

export async function fetchOffers(): Promise<OffersApiResponse> {
  const url = import.meta.env.VITE_MONSTAGE_API_URL;
  if (!url) throw new Error('VITE_MONSTAGE_API_URL is not configured');

  return requiresJsonp(url) ? fetchOffersViaJsonp(url) : fetchOffersViaCors(url);
}
