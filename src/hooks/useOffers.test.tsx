import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ApiAuthError } from '../api/authClient';
import { useOffers } from './useOffers';

vi.mock('../api/client', () => ({ fetchOffers: vi.fn() }));
vi.mock('../auth/useAuth', () => ({ useAuth: vi.fn() }));

import { fetchOffers } from '../api/client';
import { useAuth } from '../auth/useAuth';

const mockedFetchOffers = vi.mocked(fetchOffers);
const mockedUseAuth = vi.mocked(useAuth);

const payload = {
  generatedAt: '2026-09-15T07:00:00.000Z',
  source: 'Stage Intelligence France' as const,
  offers: [],
};

function Probe() {
  const state = useOffers();
  return (
    <div>
      <span data-testid="loading">{String(state.loading)}</span>
      <span data-testid="has-data">{String(Boolean(state.data))}</span>
      <span data-testid="error">{state.error ?? ''}</span>
    </div>
  );
}

describe('useOffers protected loading', () => {
  const invalidateSession = vi.fn();

  beforeEach(() => {
    mockedFetchOffers.mockReset();
    invalidateSession.mockReset();
    mockedUseAuth.mockReturnValue({
      status: 'authenticated',
      token: 'owner-token',
      user: { email: 'owner@example.test', name: null, picture: null },
      signInWithCredential: vi.fn(),
      signOut: vi.fn(),
      invalidateSession,
    });
  });

  test('loads offers with the authenticated bearer token', async () => {
    mockedFetchOffers.mockResolvedValue(payload);

    render(<Probe />);

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(mockedFetchOffers).toHaveBeenCalledWith('owner-token');
    expect(screen.getByTestId('has-data')).toHaveTextContent('true');
  });

  test('401 clears protected data and invalidates the auth session', async () => {
    mockedFetchOffers.mockRejectedValue(new ApiAuthError(401));

    render(<Probe />);

    await waitFor(() => expect(invalidateSession).toHaveBeenCalledOnce());
    expect(screen.getByTestId('has-data')).toHaveTextContent('false');
  });

  test('403 exposes private-workspace denial and never retains protected data', async () => {
    mockedFetchOffers.mockRejectedValue(new ApiAuthError(403));

    render(<Probe />);

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('has-data')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('Access denied — This MonStage workspace is private.');
  });
});
