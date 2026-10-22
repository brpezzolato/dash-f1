import { useEffect, useState } from 'react';

export interface AsyncState<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ loading: true });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true });
    fn()
      .then((data) => !cancelled && setState({ data, loading: false }))
      .catch((err: Error) => !cancelled && setState({ error: err.message, loading: false }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
