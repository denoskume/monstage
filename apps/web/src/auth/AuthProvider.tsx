import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiAuthError, fetchSession, type AuthenticatedUser } from '../api/authClient';
import { disableGoogleAutoSelect } from './googleIdentity';
import {
  cleanupLegacyOfferCache,
  clearProtectedSession,
  isTokenExpiredForUx,
  readSessionToken,
  writeSessionToken,
} from './session';
import { AuthContext, type AuthStatus } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  const resetTo = useCallback((nextStatus: Extract<AuthStatus, 'signedOut' | 'denied'>) => {
    clearProtectedSession();
    setToken(null);
    setUser(null);
    setStatus(nextStatus);
  }, []);

  const validateCredential = useCallback(async (credential: string, persist: boolean) => {
    setStatus('checking');
    try {
      const validatedUser = await fetchSession(credential);
      if (persist) writeSessionToken(credential);
      setToken(credential);
      setUser(validatedUser);
      setStatus('authenticated');
    } catch (error) {
      if (error instanceof ApiAuthError && error.status === 403) {
        resetTo('denied');
        return;
      }
      resetTo('signedOut');
    }
  }, [resetTo]);

  useEffect(() => {
    cleanupLegacyOfferCache();
    const stored = readSessionToken();
    if (!stored || isTokenExpiredForUx(stored)) {
      if (stored) clearProtectedSession();
      setStatus('signedOut');
      return;
    }

    void validateCredential(stored, false);
  }, [validateCredential]);

  const signInWithCredential = useCallback(
    async (credential: string) => validateCredential(credential, true),
    [validateCredential],
  );

  const invalidateSession = useCallback(() => {
    resetTo('signedOut');
  }, [resetTo]);

  const signOut = useCallback(() => {
    disableGoogleAutoSelect();
    resetTo('signedOut');
  }, [resetTo]);

  const value = useMemo(() => ({
    status,
    token,
    user,
    signInWithCredential,
    signOut,
    invalidateSession,
  }), [status, token, user, signInWithCredential, signOut, invalidateSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
