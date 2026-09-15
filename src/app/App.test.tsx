import { render, screen } from '@testing-library/react';
import { App } from './App';

test('renders the MonStage brand link', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: 'MonStage — Accueil des offres' })).toBeInTheDocument();
});
