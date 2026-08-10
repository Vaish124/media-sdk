// STUB: React Native implementation is intentionally out of scope.
// TypeScript signatures match @media-sdk/media-react exactly.
// See README.md → Scoping Decisions for rationale.
// @platform react-native

export { MediaProvider } from './MediaProvider';
export type { MediaProviderProps } from './MediaProvider';
export { MediaContext, useMediaSDK } from './context';

export { useMediaSearch } from './hooks/useMediaSearch';
export type { UseMediaSearchOptions, UseMediaSearchResult } from './hooks/useMediaSearch';

export { useCuratedMedia } from './hooks/useCuratedMedia';
export type { UseCuratedMediaOptions } from './hooks/useCuratedMedia';

export { useMediaItem } from './hooks/useMediaItem';

export { useMediaEvents } from './hooks/useMediaEvents';

// Consumers import everything from media-native — never directly from media-core.
export type {
  MediaEvent,
  MediaEventType,
  PexelsPhoto,
  PexelsVideo,
  MediaItem,
  SDKConfig,
} from '@media-sdk/media-core';
