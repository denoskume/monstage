export interface AuthenticatedUser {
  email: string;
  name: string | null;
  picture: string | null;
}

export class ApiAuthError extends Error {
  constructor(public readonly status: 401 | 403) {
    super(status === 403 ? 'ACCESS_DENIED' : 'UNAUTHORIZED');
    this.name = 'ApiAuthError';
  }
}

export function apiBaseUrl(): string {
  const url = import.meta.env.VITE_MONSTAGE_API_URL;
  if (!url) throw new Error('VITE_MONSTAGE_API_URL is not configured');
  return url.replace(/\/+$/, '');
}

export async function fetchSession(token: string): Promise<AuthenticatedUser> {
  if (!token) throw new ApiAuthError(401);

  const response = await fetch(`${apiBaseUrl()}/api/session`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401 || response.status === 403) {
    throw new ApiAuthError(response.status);
  }
  if (!response.ok) {
    throw new Error(`MonStage session request failed: ${response.status}`);
  }

  const payload = await response.json() as unknown;
  if (!payload || typeof payload !== 'object') {
    throw new Error('MonStage session returned an invalid payload');
  }

  const user = (payload as { user?: unknown }).user;
  if (!user || typeof user !== 'object') {
    throw new Error('MonStage session returned an invalid payload');
  }

  const candidate = user as Partial<AuthenticatedUser>;
  if (
    typeof candidate.email !== 'string' ||
    !(candidate.name === null || typeof candidate.name === 'string') ||
    !(candidate.picture === null || typeof candidate.picture === 'string')
  ) {
    throw new Error('MonStage session returned an invalid payload');
  }

  return {
    email: candidate.email,
    name: candidate.name ?? null,
    picture: candidate.picture ?? null,
  };
}
