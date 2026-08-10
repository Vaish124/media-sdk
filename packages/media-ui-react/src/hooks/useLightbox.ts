import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';

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
    onKeyDown: (e: KeyboardEvent) => void;
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
  lightboxRef: RefObject<HTMLDivElement | null>;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function useLightbox(options: UseLightboxOptions): UseLightboxResult {
  const { items, onClose } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const lightboxRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const open = useCallback((index: number) => {
    previouslyFocusedElement.current = document.activeElement as HTMLElement | null;
    setActiveIndex(index);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const next = useCallback(() => {
    setActiveIndex(i => Math.min(i + 1, items.length - 1));
  }, [items.length]);

  const prev = useCallback(() => {
    setActiveIndex(i => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    if (isOpen) {
      lightboxRef.current?.focus();
    } else if (previouslyFocusedElement.current) {
      previouslyFocusedElement.current.focus();
      previouslyFocusedElement.current = null;
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          close();
          break;
        case 'ArrowRight':
          next();
          break;
        case 'ArrowLeft':
          prev();
          break;
        case 'Tab': {
          const container = lightboxRef.current;
          if (!container) break;
          const focusable = Array.from(
            container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
          );
          if (focusable.length === 0) break;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
          break;
        }
        default:
          break;
      }
    },
    [close, next, prev]
  );

  const getLightboxProps = useCallback(
    () => ({
      role: 'dialog' as const,
      'aria-modal': true as const,
      'aria-label': 'Media lightbox',
      tabIndex: -1 as const,
      onKeyDown: handleKeyDown,
    }),
    [handleKeyDown]
  );

  const getOverlayProps = useCallback(
    () => ({
      onClick: close,
      'aria-hidden': true as const,
    }),
    [close]
  );

  const getCloseButtonProps = useCallback(
    () => ({
      type: 'button' as const,
      'aria-label': 'Close',
      onClick: close,
    }),
    [close]
  );

  const getNextButtonProps = useCallback(
    () => ({
      type: 'button' as const,
      'aria-label': 'Next',
      onClick: next,
      disabled: activeIndex >= items.length - 1,
    }),
    [next, activeIndex, items.length]
  );

  const getPrevButtonProps = useCallback(
    () => ({
      type: 'button' as const,
      'aria-label': 'Previous',
      onClick: prev,
      disabled: activeIndex <= 0,
    }),
    [prev, activeIndex]
  );

  return {
    isOpen,
    activeIndex,
    open,
    close,
    next,
    prev,
    getLightboxProps,
    getOverlayProps,
    getCloseButtonProps,
    getNextButtonProps,
    getPrevButtonProps,
    lightboxRef,
  };
}
