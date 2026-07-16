import { useState, useEffect, useCallback } from 'react';

/**
 * Lightweight hook for async data fetching.
 * Returns { data, loading, error, reload }.
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then(result => { if (!cancelled) { setData(result); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err.message || 'Unknown error'); setLoading(false); } });
    return () => { cancelled = true; };
  }, [...deps, tick]);

  return { data, loading, error, reload };
}
