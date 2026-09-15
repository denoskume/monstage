import { useCallback, useEffect, useState } from 'react';
import { ApiAuthError } from '../api/authClient';
import { fetchOffers } from '../api/client';
import type { OffersApiResponse } from '../api/contract';
import { useAuth } from '../auth/useAuth';

export interface UseOffersState {
  data: OffersApiResponse | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useOffers(): UseOffersState {
  const { status, token, invalidateSession } = useAuth();
  const [data, setData] = useState<OffersApiResponse | null>(null);
  const [loading, setLoading] = useState(status === 'authenticated');
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const retry = useCallback(() => {
    setRefreshNonce((value: number) => value + 1);
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || !token) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    fetchOffers(token)
      .then((fresh) => {
        if (!active) return;
        setData(fresh);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setData(null);

        if (reason instanceof ApiAuthError) {
          if (reason.status === 401) {
            setError(null);
            invalidateSession();
            return;
          }
          setError('Access denied — This MonStage workspace is private.');
          return;
        }

        setError('MonStage data is temporarily unavailable.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [status, token, invalidateSession, refreshNonce]);

  return { data, loading, error, retry };
}
