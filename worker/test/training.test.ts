import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleTraining } from '../src/training';
import type { Env } from '../src/env';
const env = { GITHUB_ARCHIVE_TOKEN: 'test-only' } as Env;
afterEach(() => vi.unstubAllGlobals());
describe('private training persistence', () => {
  it('returns empty state only for a confirmed missing file', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 404 })));
    expect((await handleTraining(env, { action: 'load' })).payload).toEqual({ state: null, revision: null });
  });
  it('does not turn a read failure into an empty state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 403 })));
    expect((await handleTraining(env, { action: 'load' })).status).toBe(502);
  });
  it('refuses stale updates and never writes them', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ sha: 'new-sha' }), { status: 200 }));
    vi.stubGlobal('fetch', fetcher);
    const state = { version: 1, startDate: '', tasks: {}, mastered: {}, logs: {} };
    expect((await handleTraining(env, { action: 'save', revision: 'old-sha', state })).status).toBe(409);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('round-trips Unicode through the private archive', async () => {
    const state = { version: 1, startDate: '', tasks: {}, mastered: {}, logs: { w1d1: { minutes: 120, notes: 'Pièce défectueuse — vérifiée', blocker: '', evidence: '', date: '' } } };
    const fetcher = vi.fn().mockResolvedValueOnce(new Response('', { status: 404 })).mockImplementationOnce(async (_url, init) => {
      const body = JSON.parse(init.body);
      const decoded = new TextDecoder().decode(Uint8Array.from(atob(body.content), c => c.charCodeAt(0)));
      expect(JSON.parse(decoded)).toEqual(state);
      return new Response(JSON.stringify({ content: { sha: 'saved-sha' } }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetcher);
    const result = await handleTraining(env, { action: 'save', revision: null, state });
    expect(result).toEqual({ status: 200, payload: { revision: 'saved-sha', saved: true } });
  });
});
it('isolates Data Analysis storage from the historical CV archive', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response('', {status:404}));
  vi.stubGlobal('fetch',fetcher);
  await handleTraining(env,{action:'load',course:'data-analysis'});
  expect(fetcher.mock.calls[0][0]).toContain('/Formation_Data_Analysis/progression.json');
  await handleTraining(env,{action:'load'});
  expect(fetcher.mock.calls[1][0]).toContain('/Formation_CV/progression.json');
});
it('rejects unknown courses and mismatched saves before writing', async () => {
  const fetcher = vi.fn(); vi.stubGlobal('fetch',fetcher);
  expect((await handleTraining(env,{action:'load',course:'../../private'})).status).toBe(400);
  expect(fetcher).not.toHaveBeenCalled();
});
