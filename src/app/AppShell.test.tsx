import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '../auth/useAuth';
import { AppShell } from './AppShell';

const authValue: AuthContextValue = {
  status: 'authenticated',
  token: 'owner-token',
  user: { email: 'owner@example.test', name: null, picture: null },
  signInWithCredential: async () => undefined,
  signOut: () => undefined,
  invalidateSession: () => undefined,
};

test('renders keyboard-focusable primary navigation links', () => {
  render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter><AppShell /></MemoryRouter>
    </AuthContext.Provider>,
  );
  for (const label of ['Jobs', 'Shortlist', 'Applications', 'Dashboard']) {
    const links = screen.getAllByRole('link', { name: label });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute('href');
  }
});
