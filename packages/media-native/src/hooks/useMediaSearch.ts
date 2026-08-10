// STUB: React Native implementation is intentionally out of scope.
// TypeScript signatures match @media-sdk/media-react exactly.
// See README.md → Scoping Decisions for rationale.
// @platform react-native

import type { PexelsPhoto, PexelsVideo } from '@media-sdk/media-core';

export interface UseMediaSearchOptions {
  type?: 'photo' | 'video'; // default: 'photo'
  per_page?: number; // default: 15
  enabled?: boolean; // default: true. Pass false to skip fetch (empty query guard)
}

export interface UseMediaSearchResult<T> {
  items: T[];
  loading: boolean;
  error: Error | null;
  page: number;
  hasNextPage: boolean;
  totalResults: number;
  loadMore: () => void; // appends next page; no-op if !hasNextPage or loading
  reset: () => void; // resets to page 1, clears items
}

export function useMediaSearch<T extends PexelsPhoto | PexelsVideo>(
  _query: string,
  _options?: UseMediaSearchOptions
): UseMediaSearchResult<T> {
  throw new Error('@media-sdk/media-native: not implemented. See README.');
}
