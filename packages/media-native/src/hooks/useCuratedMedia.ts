// STUB: React Native implementation is intentionally out of scope.
// TypeScript signatures match @media-sdk/media-react exactly.
// See README.md → Scoping Decisions for rationale.
// @platform react-native

import type { PexelsPhoto, PexelsVideo } from '@media-sdk/media-core';
import type { UseMediaSearchResult } from './useMediaSearch';

export interface UseCuratedMediaOptions {
  type: 'photo' | 'video';
  per_page?: number;
}

export function useCuratedMedia<T extends PexelsPhoto | PexelsVideo>(
  _options: UseCuratedMediaOptions
): UseMediaSearchResult<T> {
  throw new Error('@media-sdk/media-native: not implemented. See README.');
}
