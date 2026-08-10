import { useCallback, useEffect, useRef, useState } from 'react';
import type { PexelsPhoto, PexelsVideo } from '@media-sdk/media-core';
import { useMediaSDK } from '../context';

export interface UseMediaSearchOptions {
  type?: 'photo' | 'video'; // default: 'photo'
  per_page?: number; // default: 15
  enabled?: boolean; // default: true. Pass false to skip fetch (empty query guard)
}

export interface UseMediaSearchResult<T> {
  items: T[];
  loading: boolean;
  error: Error | null;
  page: number;
  hasNextPage: boolean;
  totalResults: number;
  loadMore: () => void; // appends next page; no-op if !hasNextPage or loading
  reset: () => void; // resets to page 1, clears items
}

export function useMediaSearch<T extends PexelsPhoto | PexelsVideo>(
  query: string,
  options?: UseMediaSearchOptions
): UseMediaSearchResult<T> {
  const sdk = useMediaSDK();
  const type = options?.type ?? 'photo';
  const per_page = options?.per_page ?? 15;
  const enabled = options?.enabled ?? true;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // Bumped on every new fetch (including reset) so stale in-flight responses are ignored.
  const requestIdRef = useRef(0);
  const [resetKey, setResetKey] = useState(0);

  const fetchPage = useCallback(
    (pageToFetch: number, append: boolean) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      const request =
        type === 'photo'
          ? sdk.client.searchPhotos({ query, page: pageToFetch, per_page })
          : sdk.client.searchVideos({ query, page: pageToFetch, per_page });

      request
        .then(result => {
          if (requestId !== requestIdRef.current) return;

          setItems(prev => (append ? [...prev, ...(result.items as T[])] : (result.items as T[])));
          setPage(result.page);
          setHasNextPage(result.hasNextPage);
          setTotalResults(result.total_results);
          setLoading(false);

          if (!append) {
            for (const item of result.items) {
              sdk.emit({ type: 'view', itemId: item.id, itemType: type });
            }
          }
        })
        .catch((err: unknown) => {
          if (requestId !== requestIdRef.current) return;
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        });
    },
    [sdk, type, query, per_page]
  );

  useEffect(() => {
    if (!enabled || !query.trim()) {
      requestIdRef.current++; // invalidate any in-flight request
      setItems([]);
      setLoading(false);
      setError(null);
      setPage(1);
      setHasNextPage(false);
      setTotalResults(0);
      return;
    }

    setItems([]);
    setPage(1);
    fetchPage(1, false);
  }, [query, type, enabled, per_page, resetKey]);

  const loadMore = useCallback(() => {
    if (!hasNextPage || loading) return;
    fetchPage(page + 1, true);
  }, [hasNextPage, loading, page, fetchPage]);

  const reset = useCallback(() => {
    setResetKey(k => k + 1);
  }, []);

  return { items, loading, error, page, hasNextPage, totalResults, loadMore, reset };
}
