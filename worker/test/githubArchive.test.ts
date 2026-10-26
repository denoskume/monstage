import { afterEach, expect, test, vi } from 'vitest';
import { handleGithubDocuments, moveGithubApplicationArchive } from '../src/githubArchive';
import type { Env } from '../src/env';

const env = { GITHUB_ARCHIVE_TOKEN: 'test-token' } as Env;
const files = new Map<string, { content: string; sha: string }>();
let version = 0;
const prefix = '/repos/denoskume/Candidatures_Stages/contents/';
function mockGithub() {
  vi.stubGlobal('fetch', vi.fn(async (request: string | URL | Request, init?: RequestInit) => {
    const url = new URL(typeof request === 'string' ? request : request instanceof URL ? request.href : request.url);
    const path = decodeURIComponent(url.pathname.slice(prefix.length));
    const method = init?.method ?? 'GET';
    const body = init?.body ? JSON.parse(String(init.body)) as Record<string, string> : {};
    if (method === 'GET') {
      const entry = files.get(path);
      if (entry) return Response.json({ name: path.split('/').at(-1), path, sha: entry.sha, content: entry.content, type: 'file' });
      const children = [...files.entries()].filter(([key]) => key.startsWith(path + '/') && !key.slice(path.length + 1).includes('/'));
      if (children.length) return Response.json(children.map(([key, f]) => ({ name: key.split('/').at(-1), path: key, type: 'file', sha: f.sha, html_url: 'https://github.com/example' })));
      return Response.json({ message: 'Not Found' }, { status: 404 });
    }
    if (method === 'PUT') {
      if (!body.content) return Response.json({ error: 'content' }, { status: 400 });
      const sha = 'sha' + (++version);
      files.set(path, { content: body.content, sha });
      return Response.json({ content: { sha, html_url: 'https://github.com/example' } });
    }
    if (method === 'DELETE') {
      const item = files.get(path);
      if (!item || item.sha !== body.sha) return Response.json({}, { status: 409 });
      files.delete(path);
      return Response.json({});
    }
    return Response.json({}, { status: 405 });
  }));
}
afterEach(() => { vi.unstubAllGlobals(); files.clear(); version = 0; });
test('archives two PDFs and lists them under an isolated application folder', async () => {
  mockGithub();
  const offerId = 'CI-PDF-2027';
  const pdf = 'JVBERi0xLjQKJUVPRgo=';
  for (const [name, kind] of [['CV_Test.pdf','cv'],['LM_Test.pdf','letter']] as const) {
    const result = await handleGithubDocuments(env, 'uploadApplicationDocument', { offerId, name, kind, contentBase64: pdf });
    expect(result.status).toBe(200);
    expect(result.payload.saved).toBe(true);
  }
  const listing = await handleGithubDocuments(env, 'listApplicationDocuments', { offerId });
  expect(listing.status).toBe(200);
  expect((listing.payload.documents as Array<{ name: string }>).map(x => x.name).sort()).toEqual(['CV_Test.pdf', 'LM_Test.pdf']);
});
test('reclassifies PDFs across sent, interview and refused statuses without losing documents', async () => {
  mockGithub();
  const offerId = 'CI-STATUS-2027';
  const pdf = 'JVBERi0xLjQKJUVPRgo=';
  for (const name of ['CV_Test.pdf','LM_Test.pdf']) {
    expect((await handleGithubDocuments(env, 'uploadApplicationDocument', { offerId, name, contentBase64: pdf })).status).toBe(200);
  }
  for (const [status, folder] of [['Candidature envoyée','02_Candidatures_envoyees'],['Entretien','04_Entretiens'],['Refus','06_Refusees']] as const) {
    await moveGithubApplicationArchive(env, offerId, status);
    const listing = await handleGithubDocuments(env, 'listApplicationDocuments', { offerId });
    expect(listing.status).toBe(200);
    expect(listing.payload.folderUrl).toContain(folder);
    expect((listing.payload.documents as unknown[]).length).toBe(2);
    expect([...files.keys()].filter(x => x.endsWith('.pdf')).length).toBe(2);
  }
});
