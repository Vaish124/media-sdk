import { createContext, useContext } from 'react';
import type { MediaSDK } from '@media-sdk/media-core';

export const MediaContext = createContext<MediaSDK | null>(null);

export function useMediaSDK(): MediaSDK {
  const sdk = useContext(MediaContext);
  if (!sdk) {
    throw new Error(
      'useMediaSDK must be called inside <MediaProvider>. ' +
      'Wrap your app root: <MediaProvider apiKey="..."><App /></MediaProvider>'
    );
  }
  return sdk;
}
