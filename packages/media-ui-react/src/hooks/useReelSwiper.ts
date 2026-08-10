import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';

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
    onKeyDown: (e: KeyboardEvent) => void;
  };
  getItemProps: (index: number) => {
    role: 'article';
    'aria-posinset': number;
    'aria-setsize': number;
    'aria-label': string;
    ref: (el: HTMLDivElement | null) => void;
  };
  containerRef: RefObject<HTMLDivElement | null>;
}

export function useReelSwiper(options: UseReelSwiperOptions): UseReelSwiperResult {
  const { items, onActiveChange } = options;
  const isLoading = options.isLoading ?? false;

  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<number, HTMLDivElement>());
  const ratios = useRef(new Map<number, number>());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const onActiveChangeRef = useRef(onActiveChange);
  useEffect(() => {
    onActiveChangeRef.current = onActiveChange;
  });

  const updateActiveIndex = useCallback((index: number) => {
    setActiveIndex(prev => (prev === index ? prev : index));
  }, []);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onActiveChangeRef.current?.(activeIndex);
  }, [activeIndex]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const index = Number(entry.target.getAttribute('data-reel-index'));
          ratios.current.set(index, entry.intersectionRatio);
        }

        let bestIndex = -1;
        let bestRatio = 0;
        for (const [index, ratio] of ratios.current) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIndex = index;
          }
        }
        if (bestIndex !== -1) {
          updateActiveIndex(bestIndex);
        }
      },
      { threshold: 0.6 }
    );
    observerRef.current = observer;

    for (const el of itemRefs.current.values()) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items, updateActiveIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        itemRefs.current.get(activeIndex + 1)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        itemRefs.current.get(activeIndex - 1)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [activeIndex]
  );

  const getContainerProps = useCallback(
    () => ({
      role: 'feed' as const,
      'aria-busy': isLoading,
      'aria-label': 'Media reel',
      tabIndex: 0 as const,
      onKeyDown: handleKeyDown,
    }),
    [isLoading, handleKeyDown]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      role: 'article' as const,
      'aria-posinset': index + 1,
      'aria-setsize': isLoading ? -1 : items.length,
      'aria-label': `Item ${index + 1} of ${items.length}`,
      ref: (el: HTMLDivElement | null) => {
        const map = itemRefs.current;
        const existing = map.get(index);
        if (existing && existing !== el) {
          observerRef.current?.unobserve(existing);
        }
        if (el) {
          el.setAttribute('data-reel-index', String(index));
          map.set(index, el);
          observerRef.current?.observe(el);
        } else {
          map.delete(index);
          ratios.current.delete(index);
        }
      },
    }),
    [isLoading, items.length]
  );

  return { activeIndex, getContainerProps, getItemProps, containerRef };
}
