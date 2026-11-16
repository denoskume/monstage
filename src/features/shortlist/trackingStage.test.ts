import { describe, expect, it } from 'vitest';
import { resolveTrackingStage, trackingStageForStatus } from './trackingStage';

describe('manual candidate tracking statuses', () => {
  it('keeps a manually saved EDF refusal in Refus even when the static EDF record says À candidater', () => {
    const edf = { applicationStatus: 'À candidater', appliedAt: null };
    const stored = trackingStageForStatus('Refus');
    expect(stored).toBe('refused');
    expect(resolveTrackingStage(edf, stored, true, true)).toBe('refused');
    expect(resolveTrackingStage(edf, stored, true, true)).toBe('refused'); // same state after reloading feed
  });

  it('prioritizes a locally recorded rejection over the static Thales submitted state', () => {
    const thales = { applicationStatus: 'Candidature envoyée', appliedAt: '2026-11-11' };
    expect(resolveTrackingStage(thales, 'refused', true, true)).toBe('refused');
  });

  it('keeps backend statuses authoritative for feed-backed offers', () => {
    const interview = { applicationStatus: 'Entretien', appliedAt: '2026-11-14' };
    expect(resolveTrackingStage(interview, 'application', true, false)).toBe('interview');
    const refusal = { applicationStatus: 'Refus', appliedAt: null };
    expect(resolveTrackingStage(refusal, undefined, false, false)).toBe('refused');
  });

  it('does not turn an untouched saved EDF job into an application', () => {
    expect(resolveTrackingStage({ applicationStatus: 'À candidater', appliedAt: null }, undefined, false, true)).toBeNull();
  });
});
