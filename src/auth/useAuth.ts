import { createContext, useContext } from 'react';
import type { AuthenticatedUser } from '../api/authClient';

export type AuthStatus = 'checking' | 'signedOut' | 'authenticated' | 'denied';

export interface AuthContextValue {
  status: AuthStatus;
  token: string | null;
  user: AuthenticatedUser | null;
  signInWithCredential: (credential: string) => Promise<void>;
  signOut: () => void;
  invalidateSession: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
