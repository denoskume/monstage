const OFFERS_CACHE_KEY = new Request('https://monstage.internal/cache/offers-v3');
const OFFERS_CACHE_NAME = 'monstage-offers-v3';

export interface CachedOffers {
  payload: unknown;
  cachedAt: number;
}

async function offersCache(): Promise<Cache> {
  return caches.open(OFFERS_CACHE_NAME);
}

function isCachedOffers(value: unknown): value is CachedOffers {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CachedOffers>;
  return typeof candidate.cachedAt === 'number' && 'payload' in candidate;
}

export async function getCachedOffers(): Promise<CachedOffers | null> {
  try {
    const cache = await offersCache();
    const response = await cache.match(OFFERS_CACHE_KEY);
    if (!response) return null;

    const cached = await response.json() as unknown;
    return isCachedOffers(cached) ? cached : null;
  } catch {
    return null;
  }
}

export async function putCachedOffers(payload: unknown, ttlSeconds: number): Promise<void> {
  try {
    const cache = await offersCache();
    const cached: CachedOffers = {
      payload,
      cachedAt: Date.now(),
    };
    const response = new Response(JSON.stringify(cached), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': `max-age=${ttlSeconds}`,
      },
    });
    await cache.put(OFFERS_CACHE_KEY, response);
  } catch {
    // Cache failures must never make the protected backend unavailable.
  }
}
