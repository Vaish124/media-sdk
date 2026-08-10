// @vitest-environment jsdom
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { MediaSDK } from '@media-sdk/media-core';
import type { PaginatedResult, PexelsPhoto } from '@media-sdk/media-core';
import { MediaContext } from '../context';
import { useMediaSearch } from '../hooks/useMediaSearch';

function makePhoto(id: number): PexelsPhoto {
  return {
    id,
    width: 100,
    height: 100,
    url: `https://pexels.com/photo/${id}`,
    photographer: 'Test Photographer',
    photographer_url: 'https://pexels.com/@test',
    photographer_id: 1,
    avg_color: '#000000',
    src: {
      original: `https://images.pexels.com/${id}/original.jpeg`,
      large2x: '',
      large: '',
      medium: '',
      small: '',
      portrait: '',
      landscape: '',
      tiny: '',
    },
    liked: false,
    alt: `Photo ${id}`,
  };
}

function makeResult(
  items: PexelsPhoto[],
  overrides: Partial<PaginatedResult<PexelsPhoto>> = {}
): PaginatedResult<PexelsPhoto> {
  return {
    items,
    page: 1,
    per_page: 15,
    total_results: items.length,
    hasNextPage: false,
    nextPage: null,
    ...overrides,
  };
}

// Mocks only the surface useMediaSearch actually touches (sdk.client.searchPhotos/
// searchVideos and sdk.emit) — MediaSDK has private fields, so a plain object
// literal can't satisfy its type structurally and must be cast.
function createMockSdk(searchPhotos: ReturnType<typeof vi.fn> = vi.fn()) {
  const emit = vi.fn();
  const client = { searchPhotos, searchVideos: vi.fn() };
  const sdk = { client, emit, subscribe: vi.fn(() => () => {}) };
  return { sdk: sdk as unknown as MediaSDK, client, emit };
}

function wrapperFor(sdk: MediaSDK) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(MediaContext.Provider, { value: sdk }, children);
  };
}

describe('useMediaSearch', () => {
  it('returns empty items and loading:false initially when enabled:false', () => {
    const { sdk, client } = createMockSdk();

    const { result } = renderHook(
      () => useMediaSearch<PexelsPhoto>('mountains', { enabled: false }),
      { wrapper: wrapperFor(sdk) }
    );

    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(client.searchPhotos).not.toHaveBeenCalled();
  });

  it('fetches page 1 on mount and sets items', async () => {
    const photos = [makePhoto(1), makePhoto(2)];
    const searchPhotos = vi
      .fn()
      .mockResolvedValue(makeResult(photos, { page: 1, hasNextPage: true, nextPage: 2 }));
    const { sdk } = createMockSdk(searchPhotos);

    const { result } = renderHook(() => useMediaSearch<PexelsPhoto>('mountains'), {
      wrapper: wrapperFor(sdk),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(searchPhotos).toHaveBeenCalledWith({ query: 'mountains', page: 1, per_page: 15 });
    expect(result.current.items).toEqual(photos);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('loadMore appends items without replacing existing ones', async () => {
    const page1 = [makePhoto(1), makePhoto(2)];
    const page2 = [makePhoto(3), makePhoto(4)];
    const searchPhotos = vi
      .fn()
      .mockResolvedValueOnce(makeResult(page1, { page: 1, hasNextPage: true, nextPage: 2 }))
      .mockResolvedValueOnce(makeResult(page2, { page: 2, hasNextPage: false, nextPage: null }));
    const { sdk } = createMockSdk(searchPhotos);

    const { result } = renderHook(() => useMediaSearch<PexelsPhoto>('mountains'), {
      wrapper: wrapperFor(sdk),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual(page1);

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([...page1, ...page2]);
    expect(searchPhotos).toHaveBeenNthCalledWith(2, { query: 'mountains', page: 2, per_page: 15 });
  });

  it('resets items and fetches from page 1 when the query changes', async () => {
    const first = [makePhoto(1)];
    const second = [makePhoto(9)];
    const searchPhotos = vi
      .fn()
      .mockResolvedValueOnce(makeResult(first))
      .mockResolvedValueOnce(makeResult(second));
    const { sdk } = createMockSdk(searchPhotos);

    const { result, rerender } = renderHook(
      ({ query }: { query: string }) => useMediaSearch<PexelsPhoto>(query),
      { wrapper: wrapperFor(sdk), initialProps: { query: 'mountains' } }
    );

    await waitFor(() => expect(result.current.items).toEqual(first));

    rerender({ query: 'ocean' });

    await waitFor(() => expect(result.current.items).toEqual(second));
    expect(searchPhotos).toHaveBeenLastCalledWith({ query: 'ocean', page: 1, per_page: 15 });
  });

  it('ignores a stale response from an old query once the query has changed', async () => {
    let resolveFirst: (value: PaginatedResult<PexelsPhoto>) => void = () => {};
    const firstPromise = new Promise<PaginatedResult<PexelsPhoto>>(resolve => {
      resolveFirst = resolve;
    });
    const second = [makePhoto(9)];

    const searchPhotos = vi
      .fn()
      .mockReturnValueOnce(firstPromise)
      .mockResolvedValueOnce(makeResult(second));
    const { sdk } = createMockSdk(searchPhotos);

    const { result, rerender } = renderHook(
      ({ query }: { query: string }) => useMediaSearch<PexelsPhoto>(query),
      { wrapper: wrapperFor(sdk), initialProps: { query: 'mountains' } }
    );

    // Query changes before the first ('mountains') request has resolved.
    rerender({ query: 'ocean' });
    await waitFor(() => expect(result.current.items).toEqual(second));

    // The stale 'mountains' response now arrives late.
    await act(async () => {
      resolveFirst(makeResult([makePhoto(1)]));
      await Promise.resolve();
    });

    expect(result.current.items).toEqual(second);
  });

  it('emits a view event for each item on page 1 only, not on loadMore', async () => {
    const page1 = [makePhoto(1), makePhoto(2)];
    const page2 = [makePhoto(3)];
    const searchPhotos = vi
      .fn()
      .mockResolvedValueOnce(makeResult(page1, { page: 1, hasNextPage: true, nextPage: 2 }))
      .mockResolvedValueOnce(makeResult(page2, { page: 2, hasNextPage: false, nextPage: null }));
    const { sdk, emit } = createMockSdk(searchPhotos);

    const { result } = renderHook(() => useMediaSearch<PexelsPhoto>('mountains'), {
      wrapper: wrapperFor(sdk),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith({ type: 'view', itemId: 1, itemType: 'photo' });
    expect(emit).toHaveBeenCalledWith({ type: 'view', itemId: 2, itemType: 'photo' });

    emit.mockClear();

    act(() => {
      result.current.loadMore();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(emit).not.toHaveBeenCalled();
  });
});
