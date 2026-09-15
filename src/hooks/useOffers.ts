import { useCallback, useEffect, useState } from 'react';
import type { OffersApiResponse } from '../api/contract';
import { fetchOffers } from '../api/client';

export interface UseOffersState {
  data: OffersApiResponse | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useOffers(): UseOffersState {
  const [data, setData] = useState<OffersApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const retry = useCallback(() => {
    setRefreshNonce((value: number) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchOffers()
      .then((fresh) => {
        if (!active) return;
        setData(fresh);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : 'MonStage data is temporarily unavailable.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshNonce]);

  return { data, loading, error, retry };
}
