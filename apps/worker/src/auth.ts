import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTVerifyGetKey,
} from 'jose';
import type { AuthorizedUser, Env } from './env';

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs'),
);

export class AuthError extends Error {
  constructor(
    public readonly status: 401 | 403,
    public readonly code: string,
  ) {
    super(code);
    this.name = 'AuthError';
  }
}

export async function verifyAuthorizedUser(
  token: string,
  env: Env,
  jwks: JWTVerifyGetKey = GOOGLE_JWKS,
): Promise<AuthorizedUser> {
  if (!token) {
    throw new AuthError(401, 'INVALID_TOKEN');
  }

  try {
    const { payload, protectedHeader } = await jwtVerify(token, jwks, {
      audience: env.GOOGLE_CLIENT_ID,
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      algorithms: ['RS256'],
    });

    if (
      protectedHeader.alg !== 'RS256' ||
      payload.email_verified !== true ||
      typeof payload.email !== 'string'
    ) {
      throw new AuthError(401, 'INVALID_TOKEN');
    }

    if (payload.email.toLowerCase() !== env.ALLOWED_EMAIL.toLowerCase()) {
      throw new AuthError(403, 'ACCESS_DENIED');
    }

    return {
      email: payload.email,
      name: typeof payload.name === 'string' ? payload.name : null,
      picture: typeof payload.picture === 'string' ? payload.picture : null,
    };
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError(401, 'INVALID_TOKEN');
  }
}
