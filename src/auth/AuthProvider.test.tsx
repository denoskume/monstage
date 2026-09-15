import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ApiAuthError, type AuthenticatedUser } from '../api/authClient';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './useAuth';

vi.mock('../api/authClient', async () => {
  const actual = await vi.importActual<typeof import('../api/authClient')>('../api/authClient');
  return { ...actual, fetchSession: vi.fn() };
});

vi.mock('./googleIdentity', () => ({
  disableGoogleAutoSelect: vi.fn(),
}));

import { fetchSession } from '../api/authClient';
import { disableGoogleAutoSelect } from './googleIdentity';

const mockedFetchSession = vi.mocked(fetchSession);
const mockedDisableAutoSelect = vi.mocked(disableGoogleAutoSelect);

const user: AuthenticatedUser = {
  email: 'owner@example.test',
  name: 'MonStage Owner',
  picture: null,
};

function tokenWithExp(expSeconds: number) {
  const encode = (value: unknown) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ exp: expSeconds })}.signature`;
}

function Probe() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="status">{auth.status}</span>
      <span data-testid="email">{auth.user?.email ?? ''}</span>
      <button onClick={() => void auth.signInWithCredential('new-token')}>Sign in test</button>
      <button onClick={auth.signOut}>Sign out test</button>
      <button onClick={auth.invalidateSession}>Invalidate test</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    mockedFetchSession.mockReset();
    mockedDisableAutoSelect.mockReset();
  });

  afterEach(() => vi.restoreAllMocks());

  test('starts signed out when there is no stored token', async () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('signedOut'));
    expect(mockedFetchSession).not.toHaveBeenCalled();
  });

  test('validates a non-expired stored token with the Worker before authenticating', async () => {
    const token = tokenWithExp(Math.floor(Date.now() / 1000) + 3600);
    sessionStorage.setItem('monstage:google-id-token:v1', token);
    mockedFetchSession.mockResolvedValue(user);

    render(<AuthProvider><Probe /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));
    expect(screen.getByTestId('email')).toHaveTextContent('owner@example.test');
    expect(mockedFetchSession).toHaveBeenCalledWith(token);
  });

  test('clears an expired stored token without calling the Worker', async () => {
    const token = tokenWithExp(Math.floor(Date.now() / 1000) - 60);
    sessionStorage.setItem('monstage:google-id-token:v1', token);

    render(<AuthProvider><Probe /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('signedOut'));
    expect(sessionStorage.getItem('monstage:google-id-token:v1')).toBeNull();
    expect(mockedFetchSession).not.toHaveBeenCalled();
  });

  test('stores a credential only after Worker validation succeeds', async () => {
    mockedFetchSession.mockResolvedValue(user);
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('signedOut'));

    await act(async () => {
      screen.getByRole('button', { name: 'Sign in test' }).click();
    });

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));
    expect(sessionStorage.getItem('monstage:google-id-token:v1')).toBe('new-token');
  });

  test('a valid but unauthorized Google account enters denied state and stores nothing', async () => {
    mockedFetchSession.mockRejectedValue(new ApiAuthError(403));
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('signedOut'));

    await act(async () => {
      screen.getByRole('button', { name: 'Sign in test' }).click();
    });

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('denied'));
    expect(sessionStorage.getItem('monstage:google-id-token:v1')).toBeNull();
  });

  test('sign out clears protected session and disables Google auto-select', async () => {
    mockedFetchSession.mockResolvedValue(user);
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('signedOut'));

    await act(async () => {
      screen.getByRole('button', { name: 'Sign in test' }).click();
    });
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));

    screen.getByRole('button', { name: 'Sign out test' }).click();

    expect(screen.getByTestId('status')).toHaveTextContent('signedOut');
    expect(sessionStorage.getItem('monstage:google-id-token:v1')).toBeNull();
    expect(mockedDisableAutoSelect).toHaveBeenCalledOnce();
  });
});
