/**
 * @fileoverview Small custom hook that loads data from a service function and exposes a reload action.
 */

import { useCallback, useEffect, useState } from 'react';
import type { NotifyFn } from '../types';
import { getErrorMessage } from '../utils/errors';

/**
 * Value returned by {@link useApiData}.
 *
 * @template T - Type of the loaded data.
 */
export interface ApiDataState<T> {
  /** Latest successfully loaded data (or the initial value before the first load) */
  data: T;
  /** True while a request is in flight */
  loading: boolean;
  /** Re-runs the fetcher, e.g. after a create/update/delete */
  reload: () => void;
}

/**
 * Loads data once on mount and again every time `reload()` is called.
 * Errors are reported through the snackbar instead of being thrown.
 *
 * How it works: `reload()` bumps a counter that is listed in the effect's
 * dependencies, which re-runs the effect. The `cancelled` flag ignores responses
 * that arrive after the component unmounted or after a newer request started.
 *
 * IMPORTANT: `fetcher` and `onNotify` must be stable references (module-level
 * service functions and a `useCallback` callback), otherwise the effect would
 * re-run on every render and refetch in a loop.
 *
 * @template T - Type of the loaded data.
 * @param fetcher - Service function that performs the request, e.g. `getCustomers`.
 * @param initialData - Value used before the first response arrives (e.g. `[]`).
 * @param onNotify - Snackbar callback used to report load failures.
 * @param errorMessage - Fallback message if the error has no text of its own.
 * @returns The loaded data, a loading flag and a reload function.
 */
export function useApiData<T>(
  fetcher: () => Promise<T>,
  initialData: T,
  onNotify: NotifyFn,
  errorMessage: string
): ApiDataState<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState<boolean>(true);
  const [reloadCount, setReloadCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) onNotify(getErrorMessage(err, errorMessage), 'error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher, onNotify, errorMessage, reloadCount]);

  const reload = useCallback(() => {
    setLoading(true);
    setReloadCount((count) => count + 1);
  }, []);

  return { data, loading, reload };
}
