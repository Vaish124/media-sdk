// STUB: React Native implementation is intentionally out of scope.
// TypeScript signatures match @media-sdk/media-react exactly.
// See README.md → Scoping Decisions for rationale.
// @platform react-native

import type { PexelsPhoto, PexelsVideo } from '@media-sdk/media-core';

export function useMediaItem(
  _id: number | null,
  _type: 'photo' | 'video'
): { item: PexelsPhoto | PexelsVideo | null; loading: boolean; error: Error | null } {
  throw new Error('@media-sdk/media-native: not implemented. See README.');
}
