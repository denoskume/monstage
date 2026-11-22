import { beforeEach, describe, expect, test } from 'vitest';
import {
  cleanupLegacyOfferCache,
  clearProtectedSession,
  isTokenExpiredForUx,
  readSessionToken,
  writeSessionToken,
} from './session';

function tokenWithExp(exp: number): string {
  const payload = btoa(JSON.stringify({ exp }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `header.${payload}.signature`;
}

describe('protected session storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  test('stores the Google credential only in sessionStorage', () => {
    writeSessionToken('credential');

    expect(readSessionToken()).toBe('credential');
    expect(localStorage.getItem('monstage:google-id-token:v1')).toBeNull();
  });

  test('clears the credential and legacy offers cache', () => {
    writeSessionToken('credential');
    localStorage.setItem('monstage:offers-cache:v1', '{"private":true}');

    clearProtectedSession();

    expect(readSessionToken()).toBeNull();
    expect(localStorage.getItem('monstage:offers-cache:v1')).toBeNull();
  });

  test('removes the legacy cache independently at startup', () => {
    localStorage.setItem('monstage:offers-cache:v1', '{"private":true}');
    cleanupLegacyOfferCache();
    expect(localStorage.getItem('monstage:offers-cache:v1')).toBeNull();
  });

  test('treats expired or malformed tokens as expired for UX', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(isTokenExpiredForUx(tokenWithExp(now - 10))).toBe(true);
    expect(isTokenExpiredForUx(tokenWithExp(now + 300))).toBe(false);
    expect(isTokenExpiredForUx('not-a-jwt')).toBe(true);
  });
});
