import type { OffersApiResponse } from './contract';
import { ApiAuthError, apiBaseUrl } from './authClient';

function isOffersApiResponse(value: unknown): value is OffersApiResponse {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<OffersApiResponse>;
  return candidate.source === 'Stage Intelligence France' && Array.isArray(candidate.offers) && typeof candidate.generatedAt === 'string';
}

export async function fetchOffers(token?: string | null): Promise<OffersApiResponse> {
  if (!token) throw new ApiAuthError(401);

  const response = await fetch(`${apiBaseUrl()}/api/offers`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401 || response.status === 403) {
    throw new ApiAuthError(response.status);
  }
  if (!response.ok) {
    throw new Error(`MonStage API request failed: ${response.status}`);
  }

  const data = await response.json() as unknown;
  if (!isOffersApiResponse(data)) {
    throw new Error('MonStage API returned an invalid payload');
  }

  return data;
}
