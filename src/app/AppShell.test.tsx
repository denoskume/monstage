import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from './AppShell';

test('renders keyboard-focusable primary navigation links', () => {
  render(<MemoryRouter><AppShell /></MemoryRouter>);
  for (const label of ['Jobs', 'Shortlist', 'Applications', 'Dashboard']) {
    const links = screen.getAllByRole('link', { name: label });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute('href');
  }
});
