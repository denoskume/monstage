import type { Env } from './env';
import { validateTraining } from '../../src/features/training/training';
const FILE = 'https://api.github.com/repos/denoskume/Candidatures_Stages/contents/Formation_CV/progression.json';
export async function handleTraining(env: Env, body: Record<string, unknown>): Promise<{ status: number; payload: Record<string, unknown> }> {
  const error = (status: number, message: string) => ({ status, payload: { error: message } });
  if (!['load', 'save'].includes(String(body.action))) return error(400, 'Action invalide.');
  if (!env.GITHUB_ARCHIVE_TOKEN) return error(503, 'Le stockage privé du stage n’est pas configuré.');
  const headers = { Authorization: `Bearer ${env.GITHUB_ARCHIVE_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'MonStage-LMS' };
  try {
    const response = await fetch(FILE + '?ref=main', { headers });
    if (!response.ok && response.status !== 404) return error(502, 'Lecture du suivi privé impossible. Réessaie sans remplacer tes données.');
    const file = response.ok ? await response.json() as { sha: string; content: string } : null;
    if (body.action === 'load') {
      if (!file) return { status: 200, payload: { state: null, revision: null } };
      const bytes = Uint8Array.from(atob(file.content.replace(/\s/g, '')), c => c.charCodeAt(0));
      return { status: 200, payload: { state: validateTraining(JSON.parse(new TextDecoder().decode(bytes))), revision: file.sha } };
    }
    let state;
    try { state = validateTraining(body.state); } catch { return error(400, 'Données de suivi invalides.'); }
    if ((body.revision ?? null) !== (file?.sha ?? null)) return error(409, 'Le suivi a changé sur un autre appareil. Exporte ton brouillon, puis recharge avant de réappliquer tes changements.');
    const bytes = new TextEncoder().encode(JSON.stringify(state));
    if (bytes.length > 250000) return error(413, 'Journal trop volumineux : limite de 250 Ko.');
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    const written = await fetch(FILE, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Suivi du stage Computer Vision', content: btoa(binary), branch: 'main', ...(file ? { sha: file.sha } : {}) }) });
    if (written.status === 409 || written.status === 422) return error(409, 'Conflit de sauvegarde. Exporte ton brouillon avant de recharger.');
    if (!written.ok) return error(502, 'Enregistrement privé impossible. Ton brouillon reste disponible.');
    const saved = await written.json() as { content?: { sha?: string } };
    if (!saved.content?.sha) return error(502, 'La sauvegarde n’a pas été confirmée.');
    return { status: 200, payload: { revision: saved.content.sha, saved: true } };
  } catch { return error(502, 'Le stockage privé est indisponible. Ton brouillon reste disponible.'); }
}
