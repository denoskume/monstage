import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { AccountMenu } from './AccountMenu';

vi.mock('../../auth/useAuth', () => ({ useAuth: vi.fn() }));
import { useAuth } from '../../auth/useAuth';

const mockedUseAuth = vi.mocked(useAuth);
const signOut = vi.fn();

beforeEach(() => {
  signOut.mockReset();
  mockedUseAuth.mockReturnValue({
    status: 'authenticated',
    token: 'owner-token',
    user: { email: 'owner@example.test', name: 'MonStage Owner', picture: null },
    signInWithCredential: vi.fn(),
    signOut,
    invalidateSession: vi.fn(),
  });
});

test('shows the Worker-validated email and signs out', async () => {
  const user = userEvent.setup();
  render(<AccountMenu />);

  expect(screen.getByText('owner@example.test')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Sign out' }));

  expect(signOut).toHaveBeenCalledOnce();
});
