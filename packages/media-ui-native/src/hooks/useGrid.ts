// STUB: React Native implementation is intentionally out of scope.
// TypeScript signatures match @media-sdk/media-ui-react exactly.
// See README.md → Scoping Decisions for rationale.
// @platform react-native

import type { RefObject } from 'react';
import type { GestureResponderEvent, NativeViewHandle } from '../types';

export interface UseGridOptions<T> {
  items: T[];
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
  columns?: number; // default: 3 (used for aria + arrow key navigation)
  onItemClick?: (index: number) => void;
}

export interface UseGridResult {
  getContainerProps: () => {
    role: 'grid';
    'aria-colcount': number;
    'aria-busy': boolean;
    'aria-label': string;
  };
  getItemProps: (index: number) => {
    role: 'gridcell';
    'aria-rowindex': number;
    'aria-colindex': number;
    tabIndex: number;
    onClick: () => void;
    onKeyDown: (e: GestureResponderEvent) => void;
  };
  sentinelRef: RefObject<NativeViewHandle>;
  focusedIndex: number | null;
  setFocusedIndex: (i: number | null) => void;
}

export function useGrid<T>(_options: UseGridOptions<T>): UseGridResult {
  throw new Error('@media-sdk/media-ui-native: not implemented. See README.');
}
