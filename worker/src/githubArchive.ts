import type { Env } from './env';

const OWNER = 'denoskume';
const REPO = 'Candidatures_Stages';
const ROOT = 'Stage_2027';
const CATEGORIES = ['01_En_preparation', '02_Candidatures_envoyees', '03_En_cours', '04_Entretiens', '05_Acceptees', '06_Refusees', '07_Archivees'] as const;
export function categoryForStatus(status: string): string {
  if (status === 'Candidature envoyée') return CATEGORIES[1];
  if (status === 'Entretien' || status === 'Test technique') return CATEGORIES[3];
  if (status === 'Offre reçue' || status === 'Acceptée') return CATEGORIES[4];
  if (status === 'Refus') return CATEGORIES[5];
  if (status === 'Abandonné') return CATEGORIES[6];
  if (status === 'Relance' || status === 'Réponse recruteur') return CATEGORIES[2];
  return CATEGORIES[0];
}

function validId(value: unknown): string {
  const id = String(value || '').trim();
  if (!/^[a-zA-Z0-9_-]{1,110}$/.test(id)) throw new Error('INVALID_OFFER_ID');
  return id;
}
function filename(value: unknown): string {
  const name = String(value || '').trim();
  if (!/^[a-zA-Z0-9À-ÿ_. -]{1,140}\.pdf$/i.test(name) || name.includes('..')) throw new Error('INVALID_PDF_NAME');
  return name;
}
async function github(env: Env, path: string, method = 'GET', body?: unknown): Promise<Response> {
  if (!env.GITHUB_ARCHIVE_TOKEN) throw new Error('GITHUB_ARCHIVE_NOT_CONFIGURED');
  return fetch('https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/' + path.split('/').map(encodeURIComponent).join('/'), {
    method, headers: {
      Authorization: 'Bearer ' + env.GITHUB_ARCHIVE_TOKEN,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'MonStage-Archive-Worker',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
interface GithubFile { name: string; path: string; sha: string; html_url: string; type: string; content?: string }
async function locate(env: Env, id: string): Promise<{ folder: string; files: GithubFile[] }> {
  for (const category of CATEGORIES) {
    const folder = ROOT + '/' + category + '/' + id;
    const response = await github(env, folder);
    if (response.status === 404) continue;
    if (!response.ok) throw new Error('GITHUB_READ_FAILED_' + response.status);
    const files = await response.json() as GithubFile[];
    if (Array.isArray(files)) return { folder, files };
  }
  return { folder: ROOT + '/' + CATEGORIES[0] + '/' + id, files: [] };
}
export async function moveGithubApplicationArchive(env: Env, offerId: unknown, status: string): Promise<void> {
  if (!env.GITHUB_ARCHIVE_TOKEN) return;
  const id = validId(offerId);
  const source = await locate(env, id);
  const target = ROOT + '/' + categoryForStatus(status) + '/' + id;
  if (source.folder === target) return;
  const files = source.files.filter(file => file.type === 'file' && /\.pdf$/i.test(file.name));
  // Commit each destination file and verify before deleting any originals.
  for (const file of files) {
    const oldFile = await github(env, file.path);
    if (!oldFile.ok) throw new Error('GITHUB_SOURCE_READ_FAILED');
    const original = await oldFile.json() as GithubFile;
    if (!original.content) throw new Error('GITHUB_SOURCE_CONTENT_MISSING');
    const newPath = target + '/' + file.name;
    const destination = await github(env, newPath);
    if (destination.status !== 404 && !destination.ok) throw new Error('GITHUB_TARGET_READ_FAILED');
    const prior = destination.ok ? (await destination.json() as GithubFile).sha : undefined;
    const written = await github(env, newPath, 'PUT', {
      message: 'Classement candidature ' + id + ' vers ' + categoryForStatus(status),
      content: original.content.replace(/\s/g, ''), branch: 'main', ...(prior ? { sha: prior } : {}),
    });
    if (!written.ok) throw new Error('GITHUB_MOVE_WRITE_FAILED_' + written.status);
    const verified = await github(env, newPath);
    if (!verified.ok || (await verified.json() as GithubFile).sha !== file.sha) throw new Error('GITHUB_MOVE_VERIFY_FAILED');
  }
  for (const file of files) {
    const deleted = await github(env, file.path, 'DELETE', {
      message: 'Reclassement candidature ' + id, sha: file.sha, branch: 'main',
    });
    if (!deleted.ok) throw new Error('GITHUB_MOVE_CLEANUP_FAILED_' + deleted.status);
  }
}
export async function handleGithubDocuments(env: Env, action: string, input: Record<string, unknown>): Promise<{ status: number; payload: Record<string, unknown> }> {
  if (!env.GITHUB_ARCHIVE_TOKEN) return { status: 503, payload: { error: 'GITHUB_ARCHIVE_NOT_CONFIGURED', message: 'Configuration du stockage GitHub privé requise.' } };
  let id: string;
  try { id = validId(input.offerId); } catch { return { status: 400, payload: { error: 'INVALID_OFFER_ID' } }; }
  const location = await locate(env, id).catch(() => null);
  if (!location) return { status: 502, payload: { error: 'GITHUB_ARCHIVE_READ_FAILED' } };
  const folder = location.folder;
  const folderUrl = 'https://github.com/' + OWNER + '/' + REPO + '/tree/main/' + folder;
  try {
    if (action === 'listApplicationDocuments') {
      const files = location.files;
      return { status: 200, payload: { folderUrl, documents: files.filter(f => f.type === 'file' && /\.pdf$/i.test(f.name)).map(f => ({
        id: f.sha, name: f.name, url: f.html_url, kind: /^(?:BROUILLON_)?CV[_ -]/i.test(f.name) ? 'cv' : /^(?:BROUILLON_)?(?:LM|LETTRE)[_ -]/i.test(f.name) ? 'letter' : 'other', createdAt: '',
      })) } };
    }
    if (action === 'uploadApplicationDocument') {
      const name = filename(input.name);
      const data = String(input.contentBase64 || '');
      if (data.length < 12 || data.length > 7_100_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data) || !data.startsWith('JVBER')) return { status: 400, payload: { error: 'INVALID_PDF' } };
      const path = folder + '/' + name;
      const existing = await github(env, path);
      if (existing.status !== 404 && !existing.ok) throw new Error('GITHUB_LOOKUP_FAILED_' + existing.status);
      const sha = existing.ok ? String(((await existing.json()) as { sha: string }).sha) : undefined;
      const put = await github(env, path, 'PUT', { message: 'Archive candidature ' + id + ': ' + name, content: data, branch: 'main', ...(sha ? { sha } : {}) });
      if (!put.ok) throw new Error('GITHUB_WRITE_FAILED_' + put.status);
      const saved = await put.json() as { content?: { sha?: string; html_url?: string } };
      return { status: 200, payload: { status: 200, saved: true, id: saved.content?.sha, name, kind: input.kind, url: saved.content?.html_url, folderUrl } };
    }
    if (action === 'deleteApplicationDocument') {
      // Deletion is intentionally disabled until the authenticated UI can select an exact path.
      return { status: 409, payload: { error: 'ARCHIVE_DELETE_DISABLED', message: 'Les documents archivés sont conservés pour éviter toute perte.' } };
    }
    return { status: 400, payload: { error: 'INVALID_ACTION' } };
  } catch (error) {
    return { status: 502, payload: { error: error instanceof Error ? error.message : 'GITHUB_ARCHIVE_FAILED' } };
  }
}
