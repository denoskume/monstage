import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '../../auth/useAuth';
import { TrainingPage } from './TrainingPage';
import { trainingRequest } from './trainingApi';
vi.mock('./trainingApi', () => ({ trainingRequest: vi.fn() }));
const auth = { token: 'test', user: { email: 'owner@example.test' }, invalidateSession: vi.fn() } as unknown as AuthContextValue;
beforeEach(() => { localStorage.clear(); vi.mocked(trainingRequest).mockReset().mockResolvedValue({ state: null, revision: null }); });
function mount() { return render(<MemoryRouter><AuthContext.Provider value={auth}><TrainingPage /></AuthContext.Provider></MemoryRouter>); }
test('lets the learner study, complete a task and retain progress after reopening', async () => {
  const user = userEvent.setup();
  const view = mount();
  await screen.findByText('Suivi privé chargé');
  await user.click(screen.getByRole('tab', { name: 'Apprendre' }));
  expect(screen.getByText('Comprendre ce qui entre réellement dans ton pipeline')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Télécharger le guide complet' })).toBeInTheDocument();
  await user.click(screen.getByRole('tab', { name: 'Missions & journal' }));
  const task = screen.getAllByRole('checkbox')[0];
  await user.click(task);
  expect(task).toBeChecked();
  await user.click(screen.getByRole('button', { name: 'Enregistrer le suivi' }));
  await waitFor(() => expect(trainingRequest).toHaveBeenLastCalledWith('test', expect.objectContaining({ action: 'save', state: expect.objectContaining({ tasks: { w1d1t1: true } }) })));
  const saved = vi.mocked(trainingRequest).mock.calls.at(-1)![1].state;
  view.unmount();
  vi.mocked(trainingRequest).mockResolvedValue({ state: saved as import('./training').TrainingState, revision: 'saved' });
  mount();
  await screen.findByText('Suivi privé chargé');
  await user.click(screen.getByRole('tab', { name: 'Missions & journal' }));
  expect(screen.getAllByRole('checkbox')[0]).toBeChecked();
});
test('does not allow saving after a cloud read failure', async () => {
  vi.mocked(trainingRequest).mockRejectedValue(new Error('Lecture impossible'));
  mount();
  await screen.findByText('Lecture impossible');
  expect(screen.getByRole('button', { name: 'Enregistrer le suivi' })).toBeDisabled();
});
test('keeps the local draft exportable when the private backend is unavailable', async () => {
  const { emptyTraining } = await import('./training');
  localStorage.setItem('monstage:lms:v1:owner@example.test', JSON.stringify({ state: { ...emptyTraining(), tasks: { w1d1t1: true } }, revision: 'old' }));
  vi.mocked(trainingRequest).mockRejectedValue(new Error('Backend unavailable'));
  mount();
  await screen.findByText('Backend unavailable');
  expect(screen.getByRole('button', { name: 'Exporter le brouillon' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Enregistrer le suivi' })).toBeDisabled();
});
