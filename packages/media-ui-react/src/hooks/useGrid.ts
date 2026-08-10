import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';

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
    onKeyDown: (e: KeyboardEvent) => void;
  };
  sentinelRef: RefObject<HTMLDivElement | null>;
  focusedIndex: number | null;
  setFocusedIndex: (i: number | null) => void;
}

export function useGrid<T>(options: UseGridOptions<T>): UseGridResult {
  const { items, onLoadMore, hasNextPage = false, isLoading = false, onItemClick } = options;
  const columns = options.columns ?? 3;

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isLoading && hasNextPage) {
        onLoadMore?.();
      }
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, [onLoadMore, hasNextPage, isLoading]);

  const clampIndex = useCallback(
    (index: number) => Math.min(Math.max(index, 0), items.length - 1),
    [items.length]
  );

  const getContainerProps = useCallback(
    () => ({
      role: 'grid' as const,
      'aria-colcount': columns,
      'aria-busy': isLoading,
      'aria-label': 'Media grid',
    }),
    [columns, isLoading]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      role: 'gridcell' as const,
      'aria-rowindex': Math.floor(index / columns) + 1,
      'aria-colindex': (index % columns) + 1,
      tabIndex: index === focusedIndex ? 0 : -1,
      onClick: () => {
        setFocusedIndex(index);
        onItemClick?.(index);
      },
      onKeyDown: (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault();
            setFocusedIndex(clampIndex(index + 1));
            break;
          case 'ArrowLeft':
            e.preventDefault();
            setFocusedIndex(clampIndex(index - 1));
            break;
          case 'ArrowDown':
            e.preventDefault();
            setFocusedIndex(clampIndex(index + columns));
            break;
          case 'ArrowUp':
            e.preventDefault();
            setFocusedIndex(clampIndex(index - columns));
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            onItemClick?.(index);
            break;
          default:
            break;
        }
      },
    }),
    [columns, focusedIndex, onItemClick, clampIndex]
  );

  return {
    getContainerProps,
    getItemProps,
    sentinelRef,
    focusedIndex,
    setFocusedIndex,
  };
}
