import { render, screen, waitFor } from '@testing-library/react';
import { App } from './App';

test('renders the private MonStage login screen when signed out', async () => {
  sessionStorage.clear();
  render(<App />);

  await waitFor(() => expect(screen.getByRole('heading', { name: 'MonStage' })).toBeInTheDocument());
  expect(screen.getByText('Private internship intelligence workspace')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'MonStage — Jobs home' })).not.toBeInTheDocument();
});
