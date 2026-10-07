import { useCallback, useEffect, useState } from 'react';

type HiddenReason = 'not_relevant' | 'wrong_location' | 'salary' | 'already_applied' | 'not_interested';

interface OfferActionState {
  saved: string[];
  unsaved: string[];
  hidden: Record<string, HiddenReason>;
}

const KEY = 'monstage:offer-actions:v1';
const EVENT = 'monstage:offer-actions-changed';
const emptyState: OfferActionState = { saved: [], unsaved: [], hidden: {} };

function readState(): OfferActionState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as Partial<OfferActionState>;
    return {
      saved: Array.isArray(parsed.saved) ? parsed.saved.filter((id): id is string => typeof id === 'string') : [],
      unsaved: Array.isArray(parsed.unsaved) ? parsed.unsaved.filter((id): id is string => typeof id === 'string') : [],
      hidden: parsed.hidden && typeof parsed.hidden === 'object' ? parsed.hidden as Record<string, HiddenReason> : {},
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

  const isSaved = useCallback((offerId: string, sourceSaved = false) => {
    if (state.unsaved.includes(offerId)) return false;
    return state.saved.includes(offerId) || sourceSaved;
  }, [state.saved, state.unsaved]);

  const toggleSaved = useCallback((offerId: string, sourceSaved = false) => {
    const current = readState();
    const currentlySaved = !current.unsaved.includes(offerId) && (current.saved.includes(offerId) || sourceSaved);

    if (currentlySaved) {
      commit({
        ...current,
        saved: current.saved.filter((id) => id !== offerId),
        unsaved: sourceSaved ? Array.from(new Set([...current.unsaved, offerId])) : current.unsaved.filter((id) => id !== offerId),
      });
      return false;
    }

    commit({
      ...current,
      saved: Array.from(new Set([...current.saved, offerId])),
      unsaved: current.unsaved.filter((id) => id !== offerId),
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

  return {
    savedIds: state.saved,
    unsavedIds: state.unsaved,
    hidden: state.hidden,
    isSaved,
    isHidden: (offerId: string) => Boolean(state.hidden[offerId]),
    toggleSaved,
    hideOffer,
    unhideOffer,
  };
}

export type { HiddenReason };
