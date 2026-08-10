import { useEffect, useRef, type DependencyList } from 'react';
import type { MediaEvent } from '@media-sdk/media-core';
import { useMediaSDK } from '../context';

export function useMediaEvents(
  listener: (event: MediaEvent) => void,
  deps: DependencyList = []
): void {
  const sdk = useMediaSDK();
  const listenerRef = useRef(listener);
  listenerRef.current = listener;

  useEffect(() => {
    return sdk.subscribe(event => listenerRef.current(event));
  }, [sdk, ...deps]);
}
