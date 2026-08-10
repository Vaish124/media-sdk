// STUB: React Native implementation is intentionally out of scope.
// TypeScript signatures match @media-sdk/media-ui-react exactly.
// See README.md → Scoping Decisions for rationale.
// @platform react-native

import type { RefObject } from 'react';
import type { GestureResponderEvent, NativeViewHandle } from '../types';

export interface UseLightboxOptions {
  items: unknown[];
  onClose?: () => void;
}

export interface UseLightboxResult {
  isOpen: boolean;
  activeIndex: number;
  open: (index: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  getLightboxProps: () => {
    role: 'dialog';
    'aria-modal': true;
    'aria-label': string;
    tabIndex: -1;
    onKeyDown: (e: GestureResponderEvent) => void;
  };
  getOverlayProps: () => {
    onClick: () => void;
    'aria-hidden': true;
  };
  getCloseButtonProps: () => {
    type: 'button';
    'aria-label': string;
    onClick: () => void;
  };
  getNextButtonProps: () => {
    type: 'button';
    'aria-label': string;
    onClick: () => void;
    disabled: boolean;
  };
  getPrevButtonProps: () => {
    type: 'button';
    'aria-label': string;
    onClick: () => void;
    disabled: boolean;
  };
  lightboxRef: RefObject<NativeViewHandle>;
}

export function useLightbox(_options: UseLightboxOptions): UseLightboxResult {
  throw new Error('@media-sdk/media-ui-native: not implemented. See README.');
}
