import type { ExternalOffer } from './externalOffers';

const CACHE_NAME = 'monstage-external-offers-v1';
const CACHE_KEY = new Request('https://monstage.internal/cache/external-offers-v1');
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;
const RETAIN_UNCONFIRMED_MS = 14 * 24 * 60 * 60 * 1000;
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

/** Keep recent, still-unverified listings without pretending they were re-posted. */
export function reconcileExternalOffers(previous: ExternalOffer[], fresh: ExternalOffer[], now = Date.now()): ExternalOffer[] {
  const active = new Set(fresh.map(offer => offer.id));
  const retained = previous.filter(offer => {
    if (active.has(offer.id)) return false;
    const lastSeen = Date.parse(offer.verifiedAt ?? '');
    return Number.isFinite(lastSeen) && lastSeen <= now &&
      now - lastSeen <= RETAIN_UNCONFIRMED_MS;
  }).map(offer => ({
    ...offer,
    offerStatus: 'À vérifier',
    freshness: 'Source à revérifier',
    sourceQuality: 'Dernière collecte précédente',
  }));
  return [...fresh, ...retained];
}

export async function writeExternalOffersSnapshot(offers: ExternalOffer[]): Promise<ExternalOffer[]> {
  // A temporary outage or an empty upstream response must not erase a known-good feed.
  const previous = await readExternalOffersSnapshot();
  if (!offers.length) return previous?.offers ?? [];
  const reconciled = reconcileExternalOffers(previous?.offers ?? [], offers);
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify({ offers: reconciled, updatedAt: Date.now() }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
      },
    });
    await cache.put(CACHE_KEY, response);
  } catch {
    // Cache outages must not prevent the authenticated job board from loading.
  }
  return reconciled;
}
