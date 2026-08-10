import { useCallback, useEffect, useRef, useState } from 'react';
import type { PexelsPhoto, PexelsVideo } from '@media-sdk/media-core';
import { useMediaSDK } from '../context';
import type { UseMediaSearchResult } from './useMediaSearch';

export interface UseCuratedMediaOptions {
  type: 'photo' | 'video';
  per_page?: number;
}

export function useCuratedMedia<T extends PexelsPhoto | PexelsVideo>(
  options: UseCuratedMediaOptions
): UseMediaSearchResult<T> {
  const sdk = useMediaSDK();
  const { type } = options;
  const per_page = options.per_page ?? 15;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const requestIdRef = useRef(0);
  const [resetKey, setResetKey] = useState(0);

  const fetchPage = useCallback(
    (pageToFetch: number, append: boolean) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      const request =
        type === 'photo'
          ? sdk.client.getCuratedPhotos(pageToFetch, per_page)
          : sdk.client.getTrendingVideos(pageToFetch, per_page);

      request
        .then(result => {
          if (requestId !== requestIdRef.current) return;

          setItems(prev => (append ? [...prev, ...(result.items as T[])] : (result.items as T[])));
          setPage(result.page);
          setHasNextPage(result.hasNextPage);
          setTotalResults(result.total_results);
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (requestId !== requestIdRef.current) return;
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        });
    },
    [sdk, type, per_page]
  );

  useEffect(() => {
    setItems([]);
    setPage(1);
    fetchPage(1, false);
  }, [type, per_page, resetKey]);

  const loadMore = useCallback(() => {
    if (!hasNextPage || loading) return;
    fetchPage(page + 1, true);
  }, [hasNextPage, loading, page, fetchPage]);

  const reset = useCallback(() => {
    setResetKey(k => k + 1);
  }, []);

  return { items, loading, error, page, hasNextPage, totalResults, loadMore, reset };
}
