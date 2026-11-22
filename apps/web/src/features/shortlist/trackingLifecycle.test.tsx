import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useOfferActions, readManualApplicationStatus } from '../offers/offerActions';
import { withSavedManualOffers } from '../applications/thalesSavedOffer';
import { EDF_EOD_DOSSIER_ID } from '../applications/edfEodDossier';
import { THALES_DATA_DOSSIER_ID } from '../applications/thalesDataDossier';
import { resolveTrackingStage, trackingStageForStatus } from './trackingStage';

describe('application lifecycle integrity (all manually saved offers)', () => {
  beforeEach(() => localStorage.clear());

  it.each([
    ['Candidature envoyée', 'application'],
    ['Relance', 'application'],
    ['Entretien', 'interview'],
    ['Test technique', 'interview'],
    ['Offre reçue', 'application'],
    ['Refus', 'refused'],
    ['Abandonné', 'archived'],
  ] as const)('persists %s and its matching tab after reloading', (status, expected) => {
    const { result, unmount } = renderHook(() => useOfferActions());
    act(() => result.current.setManualTracking(EDF_EOD_DOSSIER_ID, status, trackingStageForStatus(status)));
    expect(readManualApplicationStatus(EDF_EOD_DOSSIER_ID)).toBe(status);
    unmount(); // emulate full navigation and recreated hook
    const { result: reloaded } = renderHook(() => useOfferActions());
    expect(reloaded.current.stages[EDF_EOD_DOSSIER_ID]).toBe(expected);
    const edf = withSavedManualOffers([]).find(o => o.id === EDF_EOD_DOSSIER_ID)!;
    expect(edf.applicationStatus).toBe(status);
    expect(resolveTrackingStage(edf, reloaded.current.stages[edf.id], false, true)).toBe(expected);
  });

  it('does not change another application when one offer is refused', () => {
    const { result } = renderHook(() => useOfferActions());
    act(() => result.current.setManualTracking(THALES_DATA_DOSSIER_ID, 'Entretien', 'interview'));
    act(() => result.current.setManualTracking(EDF_EOD_DOSSIER_ID, 'Refus', 'refused'));
    const rows = withSavedManualOffers([]);
    expect(rows.find(o => o.id === EDF_EOD_DOSSIER_ID)?.applicationStatus).toBe('Refus');
    expect(rows.find(o => o.id === THALES_DATA_DOSSIER_ID)?.applicationStatus).toBe('Entretien');
  });

  it('keeps a terminal refused outcome even when an old local tab says application', () => {
    const edf = withSavedManualOffers([]).find(o => o.id === EDF_EOD_DOSSIER_ID)!;
    expect(resolveTrackingStage(edf, 'application', true, true)).toBe('refused');
  });

  it('rejects an unsuccessful local write instead of falsely claiming success', () => {
    const { result } = renderHook(() => useOfferActions());
    const fail = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded'); });
    try {
      expect(() => act(() => result.current.setManualTracking(THALES_DATA_DOSSIER_ID, 'Refus', 'refused'))).toThrow(/Stockage local indisponible/);
      expect(result.current.stages[THALES_DATA_DOSSIER_ID]).toBeUndefined();
    } finally { fail.mockRestore(); }
  });
});
