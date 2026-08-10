import { useEffect, useRef, useState } from 'react';
import type { PexelsPhoto, PexelsVideo } from '@media-sdk/media-core';
import { useMediaSDK } from '../context';

export function useMediaItem(
  id: number | null,
  type: 'photo' | 'video'
): { item: PexelsPhoto | PexelsVideo | null; loading: boolean; error: Error | null } {
  const sdk = useMediaSDK();
  const [item, setItem] = useState<PexelsPhoto | PexelsVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (id === null) {
      requestIdRef.current++;
      setItem(null);
      setLoading(false);
      setError(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setItem(null);
    setLoading(true);
    setError(null);

    const request = type === 'photo' ? sdk.client.getPhoto(id) : sdk.client.getVideo(id);
    request
      .then(result => {
        if (requestId !== requestIdRef.current) return;
        setItem(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (requestId !== requestIdRef.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });
  }, [id, type, sdk]);

  return { item, loading, error };
}
