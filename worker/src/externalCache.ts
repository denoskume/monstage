import type { ExternalOffer } from './externalOffers';

const CACHE_NAME = 'monstage-external-offers-v1';
const CACHE_KEY = new Request('https://monstage.internal/cache/external-offers-v1');
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;
export const EXTERNAL_FRESHNESS_MS = 30 * 60 * 1000;

export interface ExternalOffersSnapshot {
  offers: ExternalOffer[];
  updatedAt: number;
}

export async function readExternalOffersSnapshot(): Promise<ExternalOffersSnapshot | null> {
  try {
    const response = await (await caches.open(CACHE_NAME)).match(CACHE_KEY);
    if (!response) return null;
    const value: unknown = await response.json();
    if (!value || typeof value !== 'object') return null;
    const snapshot = value as Partial<ExternalOffersSnapshot>;
    if (!Array.isArray(snapshot.offers) || typeof snapshot.updatedAt !== 'number') return null;
    return { offers: snapshot.offers, updatedAt: snapshot.updatedAt };
  } catch {
    return null;
  }
}

export async function writeExternalOffersSnapshot(offers: ExternalOffer[]): Promise<void> {
  // A temporary outage or an empty upstream response must not erase a known-good feed.
  if (!offers.length) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify({ offers, updatedAt: Date.now() }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
      },
    });
    await cache.put(CACHE_KEY, response);
  } catch {
    // Cache outages must not prevent the authenticated job board from loading.
  }
}
