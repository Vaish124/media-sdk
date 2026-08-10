// STUB: React Native implementation is intentionally out of scope.
// TypeScript signatures match @media-sdk/media-react exactly.
// See README.md → Scoping Decisions for rationale.
// @platform react-native

import { createContext } from 'react';
import type { MediaSDK } from '@media-sdk/media-core';

export const MediaContext = createContext<MediaSDK | null>(null);

export function useMediaSDK(): MediaSDK {
  throw new Error('@media-sdk/media-native: not implemented. See README.');
}
