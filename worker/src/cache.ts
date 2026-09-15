const OFFERS_CACHE_KEY = new Request('https://monstage.internal/cache/offers-v1');
const OFFERS_CACHE_NAME = 'monstage-offers-v1';

async function offersCache(): Promise<Cache> {
  return caches.open(OFFERS_CACHE_NAME);
}

export async function getCachedOffers(): Promise<unknown | null> {
  try {
    const cache = await offersCache();
    const response = await cache.match(OFFERS_CACHE_KEY);
    return response ? await response.json() : null;
  } catch {
    return null;
  }
}

export async function putCachedOffers(payload: unknown, ttlSeconds: number): Promise<void> {
  try {
    const cache = await offersCache();
    const response = new Response(JSON.stringify(payload), {
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
