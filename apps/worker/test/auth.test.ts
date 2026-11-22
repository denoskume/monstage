import { beforeAll, describe, expect, test } from 'vitest';
import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  SignJWT,
  type JWTVerifyGetKey,
} from 'jose';
import { AuthError, verifyAuthorizedUser } from '../src/auth';
import type { Env } from '../src/env';

const env: Env = {
  GOOGLE_CLIENT_ID: 'monstage-client-id.apps.googleusercontent.com',
  ALLOWED_ORIGINS: 'https://denoskume.github.io',
  ALLOWED_EMAIL: 'owner@example.test',
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/example/exec',
  APPS_SCRIPT_GATEWAY_SECRET: 'gateway-secret',
};

let privateKey: Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];
let jwks: JWTVerifyGetKey;

beforeAll(async () => {
  const pair = await generateKeyPair('RS256');
  privateKey = pair.privateKey;
  const jwk = await exportJWK(pair.publicKey);
  jwk.kid = 'test-key';
  jwk.alg = 'RS256';
  jwks = createLocalJWKSet({ keys: [jwk] });
});

async function makeToken(overrides: {
  audience?: string;
  email?: string;
  emailVerified?: boolean;
  expiresAt?: number;
  signingKey?: Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];
} = {}) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    email: overrides.email ?? 'owner@example.test',
    email_verified: overrides.emailVerified ?? true,
    name: 'MonStage Owner',
    picture: 'https://example.test/avatar.png',
  })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
    .setIssuedAt(now)
    .setIssuer('https://accounts.google.com')
    .setAudience(overrides.audience ?? env.GOOGLE_CLIENT_ID)
    .setExpirationTime(overrides.expiresAt ?? now + 300)
    .sign(overrides.signingKey ?? privateKey);
}

async function statusForToken(token: string, testEnv: Env, keySet: JWTVerifyGetKey) {
  try {
    await verifyAuthorizedUser(token, testEnv, keySet);
    return 200;
  } catch (error) {
    return error instanceof AuthError ? error.status : 500;
  }
}

describe('verifyAuthorizedUser', () => {
  test('rejects missing and malformed credentials with 401', async () => {
    expect(await statusForToken('', env, jwks)).toBe(401);
    expect(await statusForToken('not.a.jwt', env, jwks)).toBe(401);
  });

  test('rejects an invalid signature with 401', async () => {
    const otherPair = await generateKeyPair('RS256');
    const token = await makeToken({ signingKey: otherPair.privateKey });
    expect(await statusForToken(token, env, jwks)).toBe(401);
  });

  test('rejects the wrong audience with 401', async () => {
    const token = await makeToken({ audience: 'another-client-id' });
    expect(await statusForToken(token, env, jwks)).toBe(401);
  });

  test('rejects expired credentials with 401', async () => {
    const token = await makeToken({ expiresAt: Math.floor(Date.now() / 1000) - 30 });
    expect(await statusForToken(token, env, jwks)).toBe(401);
  });

  test('rejects an unverified Google email with 401', async () => {
    const token = await makeToken({ emailVerified: false });
    expect(await statusForToken(token, env, jwks)).toBe(401);
  });

  test('rejects a valid Google identity for the wrong account with 403', async () => {
    const token = await makeToken({ email: 'intruder@example.test' });
    expect(await statusForToken(token, env, jwks)).toBe(403);
  });

  test('returns minimal user metadata for the authorized account', async () => {
    const token = await makeToken();
    await expect(verifyAuthorizedUser(token, env, jwks)).resolves.toEqual({
      email: 'owner@example.test',
      name: 'MonStage Owner',
      picture: 'https://example.test/avatar.png',
    });
  });
});
