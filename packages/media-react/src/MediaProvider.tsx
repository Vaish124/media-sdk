import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { MediaSDK } from '@media-sdk/media-core';
import { MediaContext } from './context';

export interface MediaProviderProps {
  apiKey: string;
  children: ReactNode;
}

export function MediaProvider({ apiKey, children }: MediaProviderProps) {
  const sdk = useMemo(() => new MediaSDK({ apiKey }), [apiKey]);

  return <MediaContext.Provider value={sdk}>{children}</MediaContext.Provider>;
}
