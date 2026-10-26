import type { Env } from './env';

const OWNER = 'denoskume';
const REPO = 'Candidatures_Stages';
const ROOT = 'Stage_2027/01_En_preparation';

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
export async function handleGithubDocuments(env: Env, action: string, input: Record<string, unknown>): Promise<{ status: number; payload: Record<string, unknown> }> {
  if (!env.GITHUB_ARCHIVE_TOKEN) return { status: 503, payload: { error: 'GITHUB_ARCHIVE_NOT_CONFIGURED', message: 'Configuration du stockage GitHub privé requise.' } };
  let id: string;
  try { id = validId(input.offerId); } catch { return { status: 400, payload: { error: 'INVALID_OFFER_ID' } }; }
  const folder = ROOT + '/' + id;
  const folderUrl = 'https://github.com/' + OWNER + '/' + REPO + '/tree/main/' + folder;
  try {
    if (action === 'listApplicationDocuments') {
      const response = await github(env, folder);
      if (response.status === 404) return { status: 200, payload: { documents: [], folderUrl } };
      if (!response.ok) throw new Error('GITHUB_READ_FAILED_' + response.status);
      const files = await response.json() as Array<{ name: string; path: string; sha: string; html_url: string; type: string }>;
      return { status: 200, payload: { folderUrl, documents: files.filter(f => f.type === 'file' && /\.pdf$/i.test(f.name)).map(f => ({
        id: f.sha, name: f.name, url: f.html_url, kind: f.name.toLowerCase().startsWith('cv') ? 'cv' : f.name.toLowerCase().startsWith('lm') ? 'letter' : 'other', createdAt: '',
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
