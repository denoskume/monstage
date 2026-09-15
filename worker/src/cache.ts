const OFFERS_CACHE_KEY = new Request('https://monstage.internal/cache/offers-v1');

export async function getCachedOffers(): Promise<unknown | null> {
  try {
    const response = await caches.default.match(OFFERS_CACHE_KEY);
    return response ? await response.json() : null;
  } catch {
    return null;
  }
}

export async function putCachedOffers(payload: unknown, ttlSeconds: number): Promise<void> {
  try {
    const response = new Response(JSON.stringify(payload), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': `max-age=${ttlSeconds}`,
      },
    });
    await caches.default.put(OFFERS_CACHE_KEY, response);
  } catch {
    // Cache failures must never make the protected backend unavailable.
  }
}
