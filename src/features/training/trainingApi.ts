import { ApiAuthError, apiBaseUrl } from '../../api/authClient';
import { validateTraining, type TrainingState } from './training';
export async function trainingRequest(token: string | null, body: Record<string, unknown>): Promise<{ state: TrainingState | null; revision: string | null }> {
  if (!token) throw new ApiAuthError(401);
  const response = await fetch(apiBaseUrl() + '/api/training', { method: 'POST', cache: 'no-store', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (response.status === 401 || response.status === 403) throw new ApiAuthError(response.status);
  const result = await response.json() as { state?: unknown; revision?: string | null; error?: string };
  if (!response.ok) throw new Error(result.error || 'Sauvegarde indisponible.');
  return { state: result.state ? validateTraining(result.state) : null, revision: result.revision ?? null };
}
