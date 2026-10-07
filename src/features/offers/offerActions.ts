import { useCallback, useEffect, useState } from 'react';

type HiddenReason = 'not_relevant' | 'wrong_location' | 'salary' | 'already_applied' | 'not_interested';

interface OfferActionState {
  saved: string[];
  hidden: Record<string, HiddenReason>;
}

const KEY = 'monstage:offer-actions:v1';
const EVENT = 'monstage:offer-actions-changed';
const emptyState: OfferActionState = { saved: [], hidden: {} };

function readState(): OfferActionState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as Partial<OfferActionState>;
    return {
      saved: Array.isArray(parsed.saved) ? parsed.saved.filter((id): id is string => typeof id === 'string') : [],
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
    // Offer actions remain usable for the current session even if persistence is unavailable.
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

  const toggleSaved = useCallback((offerId: string) => {
    const current = readState();
    const saved = current.saved.includes(offerId)
      ? current.saved.filter((id) => id !== offerId)
      : [...current.saved, offerId];
    commit({ ...current, saved });
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
    hidden: state.hidden,
    savedCount: state.saved.length,
    isSaved: (offerId: string) => state.saved.includes(offerId),
    isHidden: (offerId: string) => Boolean(state.hidden[offerId]),
    toggleSaved,
    hideOffer,
    unhideOffer,
  };
}

export type { HiddenReason };
