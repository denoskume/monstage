import { useCallback, useEffect, useState } from 'react';

type HiddenReason = 'not_relevant' | 'wrong_location' | 'salary' | 'already_applied' | 'not_interested';

type ManualJobStage = 'application' | 'interview' | 'archived';

interface OfferActionState {
  saved: string[];
  unsaved: string[];
  hidden: Record<string, HiddenReason>;
  stages: Record<string, ManualJobStage>;
}

const KEY = 'monstage:offer-actions:v1';
const EVENT = 'monstage:offer-actions-changed';
const emptyState: OfferActionState = { saved: [], unsaved: [], hidden: {}, stages: {} };

function readState(): OfferActionState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as Partial<OfferActionState>;
    return {
      saved: Array.isArray(parsed.saved) ? parsed.saved.filter((id): id is string => typeof id === 'string') : [],
      unsaved: Array.isArray(parsed.unsaved) ? parsed.unsaved.filter((id): id is string => typeof id === 'string') : [],
      hidden: parsed.hidden && typeof parsed.hidden === 'object' ? parsed.hidden as Record<string, HiddenReason> : {},
      stages: parsed.stages && typeof parsed.stages === 'object' ? parsed.stages as Record<string, ManualJobStage> : {},
    };
  } catch {
    return emptyState;
  }
}

function writeState(state: OfferActionState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    // Non-critical local persistence failure.
  }
}

export function useOfferActions() {
  const [state, setState] = useState<OfferActionState>(() => readState());

  useEffect(() => {
    const refresh = () => setState(readState());
    window.addEventListener(EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const commit = useCallback((next: OfferActionState) => {
    setState(next);
    writeState(next);
  }, []);

  const isSaved = useCallback((offerId: string, _sourceSaved = false) => {
    return state.saved.includes(offerId);
  }, [state.saved]);

  const toggleSaved = useCallback((offerId: string, _sourceSaved = false) => {
    const current = readState();
    const currentlySaved = current.saved.includes(offerId);

    if (currentlySaved) {
      commit({
        ...current,
        saved: current.saved.filter((id) => id !== offerId),
        unsaved: [],
      });
      return false;
    }

    commit({
      ...current,
      saved: Array.from(new Set([...current.saved, offerId])),
      unsaved: [],
    });
    return true;
  }, [commit]);

  const hideOffer = useCallback((offerId: string, reason: HiddenReason = 'not_interested') => {
    const current = readState();
    commit({ ...current, hidden: { ...current.hidden, [offerId]: reason } });
  }, [commit]);

  const unhideOffer = useCallback((offerId: string) => {
    const current = readState();
    const hidden = { ...current.hidden };
    delete hidden[offerId];
    commit({ ...current, hidden });
  }, [commit]);

  const setStage = useCallback((offerId: string, stage: ManualJobStage | null) => {
    const current = readState();
    const stages = { ...current.stages };
    if (stage === null) delete stages[offerId];
    else stages[offerId] = stage;
    commit({ ...current, stages });
  }, [commit]);

  return {
    savedIds: state.saved,
    unsavedIds: state.unsaved,
    hidden: state.hidden,
    stages: state.stages,
    isSaved,
    isHidden: (offerId: string) => Boolean(state.hidden[offerId]),
    toggleSaved,
    hideOffer,
    unhideOffer,
    setStage,
  };
}

export type { HiddenReason, ManualJobStage };
