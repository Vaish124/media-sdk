// STUB: React Native implementation is intentionally out of scope.
// TypeScript signatures match @media-sdk/media-ui-react exactly.
// See README.md → Scoping Decisions for rationale.
// @platform react-native

import type { RefObject } from 'react';
import type { GestureResponderEvent, NativeViewHandle } from '../types';

export interface UseReelSwiperOptions {
  items: unknown[];
  onActiveChange?: (index: number) => void;
  isLoading?: boolean;
}

export interface UseReelSwiperResult {
  activeIndex: number;
  getContainerProps: () => {
    role: 'feed';
    'aria-busy': boolean;
    'aria-label': string;
    tabIndex: 0;
    onKeyDown: (e: GestureResponderEvent) => void;
  };
  getItemProps: (index: number) => {
    role: 'article';
    'aria-posinset': number;
    'aria-setsize': number;
    'aria-label': string;
    ref: (el: NativeViewHandle | null) => void;
  };
  containerRef: RefObject<NativeViewHandle>;
}

export function useReelSwiper(_options: UseReelSwiperOptions): UseReelSwiperResult {
  throw new Error('@media-sdk/media-ui-native: not implemented. See README.');
}
