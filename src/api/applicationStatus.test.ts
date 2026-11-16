import { afterEach, expect, it, vi } from 'vitest';
import { saveApplicationStatus } from './applications';

afterEach(() => vi.unstubAllGlobals());

it('accepts a backend status only when the exact offer and status are confirmed', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
    updated: true, offerId: 'offer-1', applicationStatus: 'Refus',
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })));
  await expect(saveApplicationStatus('token', 'offer-1', 'Refus')).resolves.toBeUndefined();
});

it('rejects an unconfirmed HTTP 200 instead of showing a false success', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
    updated: true, offerId: 'offer-1', applicationStatus: 'Candidature envoyée',
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })));
  await expect(saveApplicationStatus('token', 'offer-1', 'Refus')).rejects.toThrow(/pas confirmé/);
});

it('reports a backend write conflict rather than silently resetting the status', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
    error: 'STATUS_LOCKED', message: 'Existing final status requires manual review.',
  }), { status: 409, headers: { 'Content-Type': 'application/json' } })));
  await expect(saveApplicationStatus('token', 'offer-1', 'Entretien')).rejects.toThrow(/manual review/);
});
