# Headless Media SDK — Master Build Prompt
# Source task: senior-react-dev-task-headless-media-sdk.md

## How To Use This File

Feed ONE phase at a time to Claude Code or Cursor. Use this exact wrapper
around every phase prompt:

```
Read MASTER_PROMPT.md.

Execute ONLY [PHASE N — NAME].

Do not start the next phase.
After implementation:
1. Run: pnpm install && pnpm build && pnpm lint && pnpm test
2. Fix any errors before stopping.
3. List every file created or changed.
4. Confirm the phase is fully complete.

Stop after this phase.
```

Verify pnpm build + pnpm lint pass before moving to the next phase.
If lint fails due to import boundary violations, fix them before continuing.

---

## Correct Phase Execution Order

Phase 0  → Monorepo scaffold
Phase 1  → media-core
Phase 2  → media-react
Phase 3  → media-native + media-ui-native stubs
Phase 4  → media-ui-react
Phase 6  → SKILL.md files         ← MUST come before Phase 5
Phase 5  → Web app                ← paste skill docs into session first
Phase 7  → Storybook + TypeDoc + README
Phase 8  → Deployment checklist

---

## Deliverables Coverage

| Task Requirement | Phase |
|---|---|
| media-core (client, cache, emitter, types, tests) | 1 |
| media-react (provider + hooks) | 2 |
| media-native stub | 3 |
| media-ui-react (Grid, Lightbox, ReelSwiper) | 4 |
| media-ui-native stub | 3 |
| Web app wiring both together | 5 |
| skills/wiring-data/SKILL.md | 6 |
| skills/using-components/SKILL.md | 6 |
| Storybook (component docs URL) | 7 |
| TypeDoc (SDK docs URL) | 7 |
| README with AI notes + scoping | 7 |
| Live deployment URLs | 8 |
| Link to this Claude conversation | Submit |

---

## PHASE 0 — Monorepo Scaffold

```
You are scaffolding a pnpm + Turborepo monorepo called `media-sdk`.
Create the structure below. Do NOT create any src/ files — config only.

STRUCTURE:
media-sdk/
├── packages/
│   ├── media-core/         (package.json, tsconfig.json)
│   ├── media-react/        (package.json, tsconfig.json)
│   ├── media-native/       (package.json, tsconfig.json)
│   ├── media-ui-react/     (package.json, tsconfig.json)
│   └── media-ui-native/    (package.json, tsconfig.json)
├── apps/
│   └── web/                (Vite + React + TS — bootstrapped)
├── skills/
│   ├── wiring-data/
│   │   └── SKILL.md        (empty placeholder)
│   └── using-components/
│       └── SKILL.md        (empty placeholder)
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── .eslintrc.js
├── .env.example
└── README.md

STEP 1 — Root package.json
{
  "name": "media-sdk",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5",
    "eslint": "^8",
    "eslint-plugin-import": "^2"
  }
}

STEP 2 — pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'

STEP 3 — turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", "storybook-static/**"] },
    "lint": {},
    "test": {},
    "dev": { "cache": false, "persistent": true }
  }
}

STEP 4 — tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true
  }
}

STEP 5 — Each package's package.json
Name: @media-sdk/<package-name>, version 0.1.0
main: "./dist/index.js", types: "./dist/index.d.ts"
scripts: { "build": "tsc", "lint": "eslint src --ext .ts,.tsx", "test": "vitest run" }

Peer dependencies:
  media-react:     { "react": ">=18", "react-dom": ">=18" }
  media-native:    { "react": ">=18", "react-native": ">=0.72" }
  media-ui-react:  { "react": ">=18", "react-dom": ">=18" }
  media-ui-native: { "react": ">=18", "react-native": ">=0.72" }

Workspace dependencies (in "dependencies", not devDependencies):
  media-react:  { "@media-sdk/media-core": "workspace:*" }
  media-native: { "@media-sdk/media-core": "workspace:*" }
  media-ui-react:  (none from this monorepo)
  media-ui-native: (none from this monorepo)
  media-core: (no react/react-native dependencies at all)

STEP 6 — Each package's tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}

STEP 7 — apps/web
Bootstrap with: pnpm create vite apps/web --template react-ts
Then update apps/web/package.json to add:
  dependencies:
    "@media-sdk/media-react": "workspace:*"
    "@media-sdk/media-ui-react": "workspace:*"

STEP 8 — .eslintrc.js (CRITICAL — enforces import boundaries)
module.exports = {
  plugins: ['import'],
  rules: {
    'import/no-restricted-paths': ['error', {
      zones: [
        {
          // media-core: no React, no wrappers, no UI packages
          target: './packages/media-core/src',
          from: [
            './node_modules/react',
            './node_modules/react-native',
            './packages/media-react/src',
            './packages/media-ui-react/src',
          ],
          message: 'media-core must be framework-agnostic.'
        },
        {
          // media-ui-react: no core, no wrappers (headless = data-agnostic)
          target: './packages/media-ui-react/src',
          from: [
            './packages/media-core/src',
            './packages/media-react/src',
            './packages/media-native/src',
          ],
          message: 'media-ui-react must not import from core or wrappers.'
        },
        {
          // media-ui-native: same rule
          target: './packages/media-ui-native/src',
          from: [
            './packages/media-core/src',
            './packages/media-react/src',
            './packages/media-native/src',
          ],
          message: 'media-ui-native must not import from core or wrappers.'
        },
        {
          // media-react: must not import UI packages
          target: './packages/media-react/src',
          from: [
            './packages/media-ui-react/src',
            './packages/media-ui-native/src',
          ],
          message: 'media-react must not import UI packages.'
        },
      ]
    }]
  }
}

STEP 9 — .env.example
VITE_PEXELS_API_KEY=your_pexels_api_key_here

STEP 10 — README.md (skeleton only)
# media-sdk
## Dependency Graph
```
app → @media-sdk/media-react → @media-sdk/media-core
app → @media-sdk/media-ui-react

✅ Allowed:   media-react → media-core
✅ Allowed:   media-native → media-core
✅ Allowed:   app → media-react
✅ Allowed:   app → media-ui-react

❌ Forbidden: media-core → react / react-native
❌ Forbidden: media-ui-react → media-core or media-react
❌ Forbidden: media-react → media-ui-react
```
(Full README written in Phase 7)

Output the full content of every file. Do not create any src/ files.
```

---

## PHASE 1 — `media-core`

```
Build packages/media-core/src/.
HARD RULE: zero imports from react, react-dom, react-native, or any browser DOM API.
This package must be runnable in a Node.js CLI with zero changes.

FILE: src/types.ts
Export these interfaces exactly (they match the real Pexels API response shapes):

export interface SDKConfig {
  apiKey: string;
  baseUrl?: string; // default: 'https://api.pexels.com'
}

export interface PexelsPhotoSrc {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: PexelsPhotoSrc;
  liked: boolean;
  alt: string;
}

export interface PexelsVideoFile {
  id: number;
  quality: 'sd' | 'hd' | 'uhd';
  file_type: string;
  width: number;
  height: number;
  fps: number;
  link: string;
}

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: { id: number; name: string; url: string };
  video_files: PexelsVideoFile[];
  video_pictures: Array<{ id: number; picture: string; nr: number }>;
}

export type MediaItem = PexelsPhoto | PexelsVideo;

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  per_page: number;
  total_results: number;
  hasNextPage: boolean;
  nextPage: number | null;
}

export type MediaEventType = 'view' | 'download';

export interface MediaEvent {
  type: MediaEventType;
  itemId: number;
  itemType: 'photo' | 'video';
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface SearchPhotosParams {
  query: string;
  page?: number;
  per_page?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  size?: 'large' | 'medium' | 'small';
  color?: string;
  locale?: string;
}

export interface SearchVideosParams {
  query: string;
  page?: number;
  per_page?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  size?: 'large' | 'medium' | 'small';
  locale?: string;
}

FILE: src/emitter.ts
type Listener<T> = (event: T) => void;

export class EventEmitter<T> {
  private listeners = new Set<Listener<T>>();

  subscribe(fn: Listener<T>): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  unsubscribe(fn: Listener<T>): void {
    this.listeners.delete(fn);
  }

  emit(event: T): void {
    this.listeners.forEach(fn => fn(event));
  }

  listenerCount(): number {
    return this.listeners.size;
  }
}

FILE: src/cache.ts
export class RequestCache {
  private store = new Map<string, Promise<unknown>>();

  get<T>(key: string): Promise<T> | undefined {
    return this.store.get(key) as Promise<T> | undefined;
  }

  set<T>(key: string, promise: Promise<T>): Promise<T> {
    this.store.set(key, promise);
    promise.catch(() => this.store.delete(key));
    return promise;
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

FILE: src/client.ts
PexelsClient class:

constructor(config: SDKConfig):
  Store apiKey as a PRIVATE field (use #apiKey or private readonly).
  Store baseUrl (default 'https://api.pexels.com').
  Create a RequestCache instance.

private async request<T>(path: string, params?: Record<string, string | number>): Promise<T>:
  Build full URL: baseUrl + path + URLSearchParams.
  Use URL string as cache key.
  Return cached promise if cache.has(key).
  Otherwise: fetch with Authorization header = apiKey.
  if (!response.ok) throw new Error(`Pexels API ${response.status}: ${response.statusText}`)
  Store in cache and return response.json() as T.

Public methods:
  searchPhotos(params: SearchPhotosParams): Promise<PaginatedResult<PexelsPhoto>>
    GET /v1/search
    Map response: photos → items, next_page → hasNextPage/nextPage

  searchVideos(params: SearchVideosParams): Promise<PaginatedResult<PexelsVideo>>
    GET /videos/search
    Map response: videos → items

  getCuratedPhotos(page = 1, per_page = 15): Promise<PaginatedResult<PexelsPhoto>>
    GET /v1/curated

  getTrendingVideos(page = 1, per_page = 15): Promise<PaginatedResult<PexelsVideo>>
    GET /videos/popular

  getPhoto(id: number): Promise<PexelsPhoto>
    GET /v1/photos/{id}

  getVideo(id: number): Promise<PexelsVideo>
    GET /videos/videos/{id}

FILE: src/sdk.ts
export class MediaSDK {
  readonly client: PexelsClient;
  private emitter = new EventEmitter<MediaEvent>();

  constructor(config: SDKConfig) {
    this.client = new PexelsClient(config);
    // Default listener — always present, always logs
    this.emitter.subscribe(event => {
      console.log(`[MediaSDK:${event.type}]`, {
        id: event.itemId,
        itemType: event.itemType,
        at: new Date(event.timestamp).toISOString(),
      });
    });
  }

  emit(event: Omit<MediaEvent, 'timestamp'>): void {
    this.emitter.emit({ ...event, timestamp: Date.now() });
  }

  subscribe(fn: (event: MediaEvent) => void): () => void {
    return this.emitter.subscribe(fn);
  }
}

FILE: src/__tests__/client.test.ts
Use vitest. vi.stubGlobal('fetch', mockFetch).

Write tests for:
1. searchPhotos builds the correct URL with Authorization header
2. searchPhotos response maps to PaginatedResult shape (items, hasNextPage, nextPage)
3. Cache hit: same params called twice → fetch called only once
4. searchVideos uses /videos/search endpoint
5. getCuratedPhotos uses /v1/curated endpoint
6. getPhoto uses /v1/photos/{id}
7. 404 response → throws Error containing '404'
8. 500 response → throws Error containing '500'
9. Failed fetch → cache evicts the key (cache.has returns false after rejection)

FILE: src/index.ts
Re-export: MediaSDK, PexelsClient, EventEmitter, RequestCache, and all types.

Output every file in full.
```

---

## PHASE 2 — `media-react` Wrapper

```
Build packages/media-react/src/.

HARD RULES:
- Import ONLY from '@media-sdk/media-core' and 'react'.
- Zero business logic (no URL building, no data transformation).
- No visible JSX, no styles.

FILE: src/context.ts
import { createContext, useContext } from 'react';
import type { MediaSDK } from '@media-sdk/media-core';

export const MediaContext = createContext<MediaSDK | null>(null);

export function useMediaSDK(): MediaSDK {
  const sdk = useContext(MediaContext);
  if (!sdk) {
    throw new Error(
      'useMediaSDK must be called inside <MediaProvider>. ' +
      'Wrap your app root: <MediaProvider apiKey="..."><App /></MediaProvider>'
    );
  }
  return sdk;
}

FILE: src/MediaProvider.tsx
Props: { apiKey: string; children: React.ReactNode }
Create MediaSDK with useMemo — recreate only when apiKey changes.
Provide via MediaContext.Provider.

FILE: src/hooks/useMediaSearch.ts
export interface UseMediaSearchOptions {
  type?: 'photo' | 'video';   // default: 'photo'
  per_page?: number;           // default: 15
  enabled?: boolean;           // default: true. Pass false to skip fetch (empty query guard)
}

export interface UseMediaSearchResult<T> {
  items: T[];
  loading: boolean;
  error: Error | null;
  page: number;
  hasNextPage: boolean;
  totalResults: number;
  loadMore: () => void;   // appends next page; no-op if !hasNextPage or loading
  reset: () => void;      // resets to page 1, clears items
}

export function useMediaSearch<T extends PexelsPhoto | PexelsVideo>(
  query: string,
  options?: UseMediaSearchOptions
): UseMediaSearchResult<T>

Implementation rules:
- On query change: reset internally and fetch from page 1.
- loadMore: increments page, results ACCUMULATE (never replace).
- Use a stale-check ref (increment on each new query) to ignore in-flight stale responses.
- On page 1 success: emit a 'view' event for each returned item via sdk.emit().
- If (!enabled || !query.trim()): return early, loading: false, no fetch.

FILE: src/hooks/useCuratedMedia.ts
export interface UseCuratedMediaOptions {
  type: 'photo' | 'video';
  per_page?: number;
}
Same return shape as UseMediaSearchResult.
Loads curated/trending on mount. loadMore appends.

FILE: src/hooks/useMediaItem.ts
export function useMediaItem(
  id: number | null,
  type: 'photo' | 'video'
): { item: PexelsPhoto | PexelsVideo | null; loading: boolean; error: Error | null }

Skip fetch when id is null. On id change: clear item, set loading true, fetch.

FILE: src/hooks/useMediaEvents.ts
export function useMediaEvents(
  listener: (event: MediaEvent) => void,
  deps?: React.DependencyList
): void

Subscribe on mount. Unsubscribe on unmount. Re-subscribe when deps change.
Stabilize listener with useRef to avoid unnecessary re-subscriptions.

FILE: src/index.ts
Export:
  MediaProvider, MediaContext, useMediaSDK
  useMediaSearch, UseMediaSearchOptions, UseMediaSearchResult
  useCuratedMedia, UseCuratedMediaOptions
  useMediaItem
  useMediaEvents

Also re-export from '@media-sdk/media-core':
  MediaEvent, MediaEventType, PexelsPhoto, PexelsVideo, MediaItem, SDKConfig
  (consumers import everything from media-react — never directly from media-core)

Output every file in full.
```

---

## PHASE 3 — `media-native` and `media-ui-native` Stubs

```
Create typed stubs for both React Native packages.

These are an intentional scope decision. The assignment has an explicit evaluation
criterion for "Judgment — sensible scoping under time pressure, documented."
Both packages export correct TypeScript signatures and throw at runtime.
The README will document why.

PACKAGE 1: packages/media-native/src/

For each file, add this header:
// STUB: React Native implementation is intentionally out of scope.
// TypeScript signatures match @media-sdk/media-react exactly.
// See README.md → Scoping Decisions for rationale.
// @platform react-native

Files to create (same structure as media-react):
- src/context.ts      → MediaContext, useMediaSDK (same signature, throws)
- src/MediaProvider.tsx → MediaProvider component (same props, throws)
- src/hooks/useMediaSearch.ts  (same signature, throws)
- src/hooks/useCuratedMedia.ts (same signature, throws)
- src/hooks/useMediaItem.ts    (same signature, throws)
- src/hooks/useMediaEvents.ts  (same signature, throws)
- src/index.ts → re-export all stubs

All implementations: throw new Error('@media-sdk/media-native: not implemented. See README.')

PACKAGE 2: packages/media-ui-native/src/

Same header comment, swap "media-native" for "media-ui-native".

Files (same structure as media-ui-react):
- src/hooks/useGrid.ts        (same signature, throws)
- src/hooks/useLightbox.ts    (same signature, throws)
- src/hooks/useReelSwiper.ts  (same signature, throws)
- src/index.ts

For type signatures in media-ui-native, use React Native equivalents:
  ViewStyle instead of React.CSSProperties
  GestureResponderEvent instead of React.KeyboardEvent

All implementations: throw new Error('@media-sdk/media-ui-native: not implemented. See README.')

Output every file in full for both packages.
```

---

## PHASE 4 — `media-ui-react` Headless Hooks

```
Build packages/media-ui-react/src/.

CRITICAL RULES — these are the core evaluation criteria:
1. ZERO imports from @media-sdk/media-core or @media-sdk/media-react.
   This package does not know Pexels exists.
2. ZERO styles — no CSS, no inline style objects, no className strings.
   Prop-getters return ONLY: role, aria-*, tabIndex, event handlers, refs.
3. All data comes in as plain props. No API calls, no context, no SDK.
4. Prop-getters are functions that return a props object for spreading.
   Never return individual props separately.

FILE: src/hooks/useGrid.ts

export interface UseGridOptions<T> {
  items: T[];
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
  columns?: number;              // default: 3 (used for aria + arrow key navigation)
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
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  sentinelRef: React.RefObject<HTMLDivElement>;
  focusedIndex: number | null;
  setFocusedIndex: (i: number | null) => void;
}

export function useGrid<T>(options: UseGridOptions<T>): UseGridResult

Implementation:
- sentinelRef: IntersectionObserver calls onLoadMore when sentinel enters viewport
  AND !isLoading AND hasNextPage. Reconnect when deps change.
- Roving tabindex: tabIndex is 0 for focusedIndex item, -1 for all others.
- Arrow key nav: Right/Left move by 1, Down/Up move by columns.
  Clamp at 0 and items.length - 1.
- Enter/Space: call onItemClick(focusedIndex).
- aria-rowindex: Math.floor(index / columns) + 1
- aria-colindex: (index % columns) + 1

FILE: src/hooks/useLightbox.ts

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
    onKeyDown: (e: React.KeyboardEvent) => void;
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
  lightboxRef: React.RefObject<HTMLDivElement>;
}

export function useLightbox(options: UseLightboxOptions): UseLightboxResult

Implementation:
- Store previouslyFocusedElement in a ref before opening.
- On open: focus lightboxRef.current after render (useEffect on isOpen).
- Focus trap on Tab/Shift+Tab: query all focusable elements inside lightboxRef.
  Selector: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  Cycle within that set.
- Escape → close().
- ArrowRight → next(), ArrowLeft → prev().
- On close: restore focus to previouslyFocusedElement.
- disabled on next/prev buttons when at boundary.

FILE: src/hooks/useReelSwiper.ts

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
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  getItemProps: (index: number) => {
    role: 'article';
    'aria-posinset': number;
    'aria-setsize': number;
    'aria-label': string;
    ref: (el: HTMLDivElement | null) => void;
  };
  containerRef: React.RefObject<HTMLDivElement>;
}

export function useReelSwiper(options: UseReelSwiperOptions): UseReelSwiperResult

Implementation:
- Use a Map<number, HTMLDivElement> for item refs.
  getItemProps(i).ref stores/removes from this map.
- IntersectionObserver (threshold: 0.6) on each item.
  Item with highest intersectionRatio becomes activeIndex.
  Call onActiveChange on change.
- ArrowDown: scroll itemRefs.get(activeIndex + 1) into view (scrollIntoView).
- ArrowUp: scroll itemRefs.get(activeIndex - 1) into view.
- aria-setsize: use items.length, or -1 if loading and more pages exist.

FILE: src/index.ts
Export: useGrid, UseGridOptions, UseGridResult,
        useLightbox, UseLightboxOptions, UseLightboxResult,
        useReelSwiper, UseReelSwiperOptions, UseReelSwiperResult

Output every file in full.
```

---

## PHASE 6 — SKILL.md Files

> ⚠️ Build Phase 6 BEFORE Phase 5.
> The task requires demonstrating skill docs steering an AI while building the app.
> Write them first, use them in Phase 5.

```
Write two SKILL.md files. They must be specific enough that an AI reading them
produces correct code without needing to inspect the source. Write them as
authoritative reference documentation, not tutorials.

FILE: skills/wiring-data/SKILL.md

# Wiring Data with @media-sdk/media-react

## 1. Required Setup

Every component tree that uses any hook must be wrapped in MediaProvider:

```tsx
// main.tsx
import { MediaProvider } from '@media-sdk/media-react'

root.render(
  <MediaProvider apiKey={import.meta.env.VITE_PEXELS_API_KEY}>
    <App />
  </MediaProvider>
)
```

The env var is VITE_PEXELS_API_KEY. Never hardcode the key.
Never pass the key to child components.
If MediaProvider is missing, every hook throws immediately.

## 2. Hook Reference

### useMediaSearch<T>(query, options?) → UseMediaSearchResult<T>

Type parameter T is PexelsPhoto or PexelsVideo.

Options:
  type: 'photo' | 'video'  (default: 'photo')
  per_page: number          (default: 15)
  enabled: boolean          (default: true — pass false when query is empty)

Returns:
  items: T[]           — accumulates across pages; never resets on loadMore
  loading: boolean     — true during any fetch
  error: Error | null  — last error, or null
  page: number         — current page number
  hasNextPage: boolean — false when on the last page
  totalResults: number — total from Pexels API
  loadMore: () => void — appends next page; no-op if !hasNextPage or loading
  reset: () => void    — resets to page 1, clears items

Behaviour:
- Query change → automatic reset to page 1 + clear items.
- Page 1 results → 'view' event emitted per item automatically.
- Empty query with enabled: true → fetch still fires. Guard with enabled: false.

Minimal example:
```tsx
const { items, loading, error, hasNextPage, loadMore } =
  useMediaSearch<PexelsPhoto>('mountain', { type: 'photo', per_page: 15 })
```

### useCuratedMedia(options) → same shape as UseMediaSearchResult

Use instead of useMediaSearch when there is no search query (home/explore screen).

Options: { type: 'photo' | 'video'; per_page?: number }

```tsx
const { items, loading, loadMore } = useCuratedMedia({ type: 'photo' })
```

### useMediaItem(id, type) → { item, loading, error }

Fetches a single photo or video. Pass null as id to skip the fetch.

```tsx
const { item, loading } = useMediaItem(selectedId, 'photo')
```

### useMediaEvents(listener, deps?) → void

Subscribes to SDK events. Auto-unsubscribes on unmount.
Re-subscribes when deps change (same semantics as useEffect deps).

```tsx
useMediaEvents((event) => {
  console.log(event.type, event.itemId)
}, [])
```

### useMediaSDK() → MediaSDK

Direct SDK access. Use only when you need to emit events manually.

```tsx
const sdk = useMediaSDK()
sdk.emit({ type: 'download', itemId: photo.id, itemType: 'photo' })
```

## 3. Event System

MediaEvent shape:
```ts
{
  type: 'view' | 'download'
  itemId: number
  itemType: 'photo' | 'video'
  timestamp: number   // set automatically by sdk.emit()
  metadata?: Record<string, unknown>
}
```

The SDK always has a default console.log listener active.
Any listeners you add with useMediaEvents or sdk.subscribe() are additional.

## 4. Pagination Rules

- items array ACCUMULATES — loadMore appends, never replaces.
- Always guard: call loadMore() only when hasNextPage && !loading.
- Query change resets automatically — you don't need to call reset() manually.
- Wire loadMore to sentinelRef from useGrid (see using-components/SKILL.md).

## 5. Import Rules

@media-sdk/media-react re-exports all types from @media-sdk/media-core.
NEVER import from @media-sdk/media-core in app code.

✅ import { PexelsPhoto } from '@media-sdk/media-react'
❌ import { PexelsPhoto } from '@media-sdk/media-core'

## 6. Common Mistakes — Never Do These

❌ import anything from '@media-sdk/media-core' in app components
❌ Call loadMore() without checking hasNextPage — causes extra API calls
❌ useMediaSearch(query) without enabled: false when query may be empty
❌ useMediaSDK() outside <MediaProvider> — throws at runtime
❌ Create new MediaSDK() manually in a component — bypasses provider singleton
❌ Pass apiKey as a prop to child components — key stays in MediaProvider only

---

FILE: skills/using-components/SKILL.md

# Using @media-sdk/media-ui-react Headless Components

## 1. The Prop-Getter Pattern

Every hook returns prop-getters: functions that return a props object.
You MUST spread the entire return value onto your element.

```tsx
// ✅ CORRECT — spread the whole object
<div {...getContainerProps()} className={styles.grid}>

// ❌ WRONG — destructuring breaks future compatibility and a11y
const { role } = getContainerProps()
<div role={role}>
```

You can add your own props alongside the spread:
```tsx
<div {...getItemProps(i)} className={styles.item} data-testid={`item-${i}`}>
```

This package ships zero styles. You supply 100% of the CSS.
Prop-getters add only: role, aria-*, tabIndex, event handlers, refs.

## 2. useGrid

```ts
const {
  getContainerProps,
  getItemProps,
  sentinelRef,       // attach to a sentinel div for infinite scroll
  focusedIndex,
  setFocusedIndex,
} = useGrid({ items, onLoadMore, hasNextPage, isLoading, columns: 3, onItemClick })
```

Complete working example:
```tsx
function PhotoGrid({ query }: { query: string }) {
  const { items, loading, hasNextPage, loadMore } =
    useMediaSearch<PexelsPhoto>(query, { type: 'photo', enabled: !!query })

  const { getContainerProps, getItemProps, sentinelRef } = useGrid({
    items,
    onLoadMore: loadMore,
    hasNextPage,
    isLoading: loading,
    columns: 3,
    onItemClick: (index) => openLightbox(index),
  })

  return (
    <div {...getContainerProps()} className={styles.grid}>
      {items.map((photo, i) => (
        <div key={(photo as PexelsPhoto).id} {...getItemProps(i)} className={styles.item}>
          <img src={(photo as PexelsPhoto).src.medium} alt={(photo as PexelsPhoto).alt} />
        </div>
      ))}
      {/* REQUIRED: sentinel must be rendered for infinite scroll to work */}
      <div ref={sentinelRef} aria-hidden="true" className={styles.sentinel} />
    </div>
  )
}
```

⚠️ The sentinel div with ref={sentinelRef} is REQUIRED.
   Without it, infinite scroll silently does nothing.

## 3. useLightbox

```ts
const {
  isOpen, activeIndex, open, close, next, prev,
  getLightboxProps,    // spread on dialog element
  getOverlayProps,     // spread on overlay/backdrop element
  getCloseButtonProps, // spread on close button
  getNextButtonProps,  // spread on next button
  getPrevButtonProps,  // spread on prev button
  lightboxRef,         // REQUIRED on dialog element — enables focus trap
} = useLightbox({ items, onClose })
```

Complete working example:
```tsx
{isOpen && (
  <>
    <div {...getOverlayProps()} className={styles.overlay} />
    <div {...getLightboxProps()} ref={lightboxRef} className={styles.dialog}>
      <button {...getCloseButtonProps()} className={styles.closeBtn}>✕</button>
      <button {...getPrevButtonProps()} className={styles.prevBtn}>‹</button>
      <img src={items[activeIndex]?.src.large} alt={items[activeIndex]?.alt} />
      <button {...getNextButtonProps()} className={styles.nextBtn}>›</button>
    </div>
  </>
)}
```

⚠️ lightboxRef MUST be on the dialog element. It is required for focus trapping.
   Keyboard: Escape closes, ArrowLeft/Right navigate, Tab stays trapped inside.

## 4. useReelSwiper

```ts
const {
  activeIndex,
  getContainerProps,  // spread on scroll container
  getItemProps,       // spread on each item (includes ref callback)
  containerRef,
} = useReelSwiper({ items, onActiveChange, isLoading })
```

Complete working example:
```tsx
<div {...getContainerProps()} className={styles.reelContainer}>
  {items.map((video, i) => (
    <div key={(video as PexelsVideo).id} {...getItemProps(i)} className={styles.reelItem}>
      <img src={(video as PexelsVideo).image} alt="Video thumbnail" />
      <span className={styles.activeLabel}>
        {i === activeIndex ? '▶ Playing' : ''}
      </span>
    </div>
  ))}
</div>
```

REQUIRED CSS (without this, snap scrolling does not work):
```css
/* container */
.reelContainer {
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  height: 100vh;
}

/* each item */
.reelItem {
  scroll-snap-align: start;
  height: 100vh;
  flex-shrink: 0;
}
```

⚠️ getItemProps returns a ref callback. Do NOT overwrite it with your own ref.
   Use containerRef if you need a ref to the scroll container.

## 5. Accessibility — Consumer Responsibilities

The library handles: keyboard navigation, ARIA roles, ARIA states, focus management, roving tabindex.

You must provide:
- Visible focus styles (CSS outline or equivalent) on grid items and lightbox buttons
- Sufficient color contrast on any overlaid text
- Meaningful alt text on all img elements
- An aria-live="polite" region to announce loading state changes

## 6. Common Mistakes — Never Do These

❌ Forget ref={sentinelRef} on the sentinel div — infinite scroll silently breaks
❌ Destructure from prop-getters instead of spreading — breaks a11y and future compat
❌ Add styles inside packages/media-ui-react — all CSS belongs in the consuming app
❌ Import from @media-sdk/media-react inside media-ui-react components — data-agnostic
❌ Omit lightboxRef on the dialog element — focus trap and restore won't work
❌ Omit the required CSS for useReelSwiper — snap scrolling silently fails
❌ Overwrite the ref returned by getItemProps — active item detection breaks

Output both SKILL.md files in full exactly as written above.
```

---

## PHASE 5 — Web App

> ⚠️ BEFORE running this prompt, start a NEW Claude Code session and paste
> the full contents of BOTH skill files at the top. Say:
> "These are the official skill docs for this project. Follow them exactly
> when writing any code that uses @media-sdk/media-react or @media-sdk/media-ui-react."
> This is what demonstrates the skill docs steering the AI (required by the task).

```
[PASTE full content of skills/wiring-data/SKILL.md here]

---

[PASTE full content of skills/using-components/SKILL.md here]

---

Build apps/web/src/. This is the ONLY place that imports from both
@media-sdk/media-react and @media-sdk/media-ui-react and wires them together.

Use CSS Modules for all styles (.module.css). No CSS framework. Correctness
over visual polish.

FILE: src/main.tsx
Wrap App in MediaProvider with apiKey from import.meta.env.VITE_PEXELS_API_KEY.
If the env var is missing or empty, render:
  <div style={{padding: '2rem', color: 'red'}}>
    Missing VITE_PEXELS_API_KEY. Add it to .env and restart.
  </div>

FILE: src/App.tsx
State:
  query: string              — live input value
  submittedQuery: string     — query that was last submitted
  lightboxItems: PexelsPhoto[]
  lightboxIndex: number
  isLightboxOpen: boolean
  view: 'grid' | 'reels'

Layout:
  <nav> — app name "MediaSDK Demo" + "Switch to Reels"/"Switch to Grid" toggle
  <SearchBar onSearch={q => setSubmittedQuery(q)} />
  {view === 'grid' && <GridView query={submittedQuery} onItemClick={...} />}
  {view === 'reels' && <ReelView query={submittedQuery} />}
  <LightboxView
    items={lightboxItems}
    initialIndex={lightboxIndex}
    isOpen={isLightboxOpen}
    onClose={() => setIsLightboxOpen(false)}
  />
  <EventLog />

FILE: src/components/SearchBar.tsx
Props: { onSearch: (q: string) => void }
Controlled input. Submit on Enter key or Search button click.
Show a clear (✕) button when input is non-empty.

FILE: src/components/GridView.tsx
Props: { query: string; onItemClick: (index: number, items: PexelsPhoto[]) => void }

Logic:
  If query is empty: useCuratedMedia({ type: 'photo', per_page: 15 })
  If query non-empty: useMediaSearch<PexelsPhoto>(query, { type: 'photo', enabled: !!query, per_page: 15 })

Render using EXACTLY the wiring pattern from using-components/SKILL.md useGrid section.
Wire: onItemClick → calls props.onItemClick(index, items)
Include: sentinel div with ref={sentinelRef} — REQUIRED
Loading skeleton: when loading && items.length === 0, render 6 placeholder divs with pulse animation
Error state: error message + retry button that calls reset()

FILE: src/components/LightboxView.tsx
Props: {
  items: PexelsPhoto[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

Sync: when isOpen becomes true, call open(initialIndex).
When isOpen becomes false (from parent), call close().

Render using EXACTLY the wiring pattern from using-components/SKILL.md useLightbox section.
Remember: lightboxRef on the dialog element.

Add a Download button:
  const sdk = useMediaSDK()
  // onClick:
  sdk.emit({ type: 'download', itemId: items[activeIndex].id, itemType: 'photo' })

FILE: src/components/ReelView.tsx
Props: { query: string }
effectiveQuery = query.trim() ? query : 'nature'   // fallback when no search is active
Call useMediaSearch<PexelsVideo>(effectiveQuery, { type: 'video', per_page: 10 })
Note: 'nature' fallback is a documented simplification (see README scoping table).
Call useReelSwiper({ items, onActiveChange: (i) => { if (i >= items.length - 3) loadMore() } })

Render using EXACTLY the wiring pattern from using-components/SKILL.md useReelSwiper section.
Apply the REQUIRED CSS from the skill doc.
Show for each item: thumbnail image (video.image), duration (video.duration + 's'), user name.
Active item: add className={styles.active} alongside the spread.

FILE: src/components/EventLog.tsx
Use useMediaEvents to collect events. Keep last 10 in local state.
Fixed panel, bottom-right corner. Collapsible via a toggle button.
Each event row: colored badge (blue=view, green=download), item id, time as HH:mm:ss.

CSS Modules to create:
  src/styles/app.module.css        — nav, layout shell
  src/styles/grid.module.css       — 3-column grid, aspect-ratio items, hover, skeleton pulse
  src/styles/lightbox.module.css   — fixed overlay, centered dialog, nav buttons
  src/styles/reel.module.css       — snap scroll container, full-viewport items, active state
  src/styles/eventlog.module.css   — fixed panel, badge colors, collapse transition

Output every file in full.
```

---

## PHASE 7 — Storybook, TypeDoc, Final README

```
Add documentation and write the final README.

PART 1: Storybook in packages/media-ui-react/
Run: npx storybook@latest init (Vite + React preset)

Each story must show the prop-getter pattern explicitly — never abstract it away.
Use picsum.photos for placeholder images.

src/stories/Grid.stories.tsx
  Placeholder items: Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    src: { medium: `https://picsum.photos/seed/${i + 1}/400/300` },
    alt: `Photo ${i + 1}`,
    photographer: 'Picsum',
  }))
  Story "Default": useGrid, log clicks to console, show sentinelRef placement.
  Story "InfiniteScroll": after onLoadMore fires, add 6 more items after 1s delay.
  Story "Loading": isLoading: true.
  Decorator: apply CSS grid (display:grid, 3 columns, gap:8px) directly in story.

src/stories/Lightbox.stories.tsx
  6 picsum images (seeds 10-15).
  Story "Default": open on index 0, all buttons functional.
  Story "KeyboardNav": same, description explains Escape/arrows/Tab trap.
  Decorator: add minimal overlay + dialog styles inline in story.

src/stories/ReelSwiper.stories.tsx
  5 items with distinct colored backgrounds (hsl increments).
  Story "Default": show activeIndex in a fixed badge.
  Story "WithCallback": onActiveChange logs to console.
  Decorator: container height: 400px, overflow-y: scroll, snap.

PART 2: TypeDoc in packages/media-core/ and packages/media-react/

Add typedoc.json to each:
{
  "entryPoints": ["src/index.ts"],
  "out": "docs",
  "name": "@media-sdk/media-core",  // or media-react
  "includeVersion": true,
  "readme": "README.md"
}

Add "docs": "typedoc" to each package's scripts.
Add typedoc to devDependencies.

packages/media-core/README.md:
  # @media-sdk/media-core
  Framework-agnostic Pexels API client, event emitter, and request cache.
  No React. No DOM. Can power a CLI, a React app, or a React Native app.

packages/media-react/README.md:
  # @media-sdk/media-react
  React hooks and provider for @media-sdk/media-core.
  See skills/wiring-data/SKILL.md for usage examples and rules.

PART 3: Root README.md (final — replace the skeleton from Phase 0)

Write these sections in full:

## media-sdk

### Overview
Paragraph 1: What the project is (headless media SDK ecosystem, Pexels API, monorepo).
Paragraph 2: Why the packages are separated (portability of core, testability,
headless UI allows any CSS approach, React Native stub shows cross-platform intent).

### Architecture
```
┌────────────────────────────────────┐
│             apps/web               │
│  (only file that wires data + UI)  │
└──────────┬──────────────┬──────────┘
           │              │
           ▼              ▼
 ┌──────────────┐  ┌──────────────────┐
 │ media-react  │  │  media-ui-react  │
 │ provider +   │  │  useGrid         │
 │ hooks        │  │  useLightbox     │
 └──────┬───────┘  │  useReelSwiper   │
        │          └──────────────────┘
        ▼        (zero imports from core/wrappers)
 ┌──────────────┐
 │ media-core   │
 │ client       │
 │ emitter      │
 │ cache        │
 │ types        │
 └──────────────┘
```

### Packages

| Package | Purpose | Key Exports |
|---|---|---|
| @media-sdk/media-core | Framework-agnostic client | MediaSDK, PexelsClient, EventEmitter |
| @media-sdk/media-react | React provider + hooks | MediaProvider, useMediaSearch, useCuratedMedia, useMediaItem, useMediaEvents |
| @media-sdk/media-native | React Native (stub) | Same API as media-react |
| @media-sdk/media-ui-react | Headless UI hooks | useGrid, useLightbox, useReelSwiper |
| @media-sdk/media-ui-native | React Native UI (stub) | Same API as media-ui-react |

### Getting Started
```bash
git clone <repo-url>
cd media-sdk
pnpm install
cp .env.example .env
# Add your Pexels API key to .env
pnpm dev
```

### Skill Documents
- skills/wiring-data/SKILL.md — MediaProvider setup, hooks, events, pagination rules
- skills/using-components/SKILL.md — Prop-getter pattern, each component, a11y, styling contract

### AI-Assisted Development
[FILL THESE IN AFTER COMPLETING THE PROJECT — this is part of the submission]
- Parts written entirely by hand:
- Parts AI-generated following the master prompt:
- Parts built using the skill docs to steer the AI:
- What changed in AI output when skill docs were prepended vs not:
- Link to Claude conversation used for planning: [URL of this chat]
- Link to Claude Code sessions: [URLs]

### Scoping Decisions

| Cut | Rationale |
|---|---|
| media-native full impl | 8–12hr window; TypeScript signatures are complete and correct; documented |
| media-ui-native full impl | Same rationale; API surface matches media-ui-react |
| Video playback in Lightbox | Time constraint; thumbnail shown; noted as stretch goal |
| Visual polish | Explicitly not scored per task brief |
| Reels default query | Falls back to 'nature' when no search is active |

### Deployment
- App (Vercel): [FILL IN]
- Storybook (Vercel): [FILL IN]
- TypeDoc / SDK Docs (GitHub Pages): [FILL IN]
- Claude conversation: [FILL IN — save this URL]

Output every file in full.
```

---

## PHASE 8 — Deployment Checklist

> Not a prompt. Run manually after all phases are complete.

```bash
# 1. Final build verification
pnpm install
pnpm turbo build         # must pass with zero errors
pnpm turbo lint          # must pass — catches import boundary violations
pnpm turbo test          # must pass

# 2. Storybook
cd packages/media-ui-react
pnpm build-storybook     # outputs storybook-static/

# 3. TypeDoc
cd packages/media-core && pnpm docs   # outputs docs/
cd packages/media-react && pnpm docs  # outputs docs/

# 4. Deploy app
cd apps/web
vercel --prod            # note the URL

# 5. Deploy Storybook
cd packages/media-ui-react
vercel storybook-static/ --prod   # note the URL

# 6. Deploy TypeDoc to GitHub Pages
# In repo settings: Pages → Deploy from branch → main → /packages/media-core/docs
# Or push docs folders and use a gh-pages action

# 7. Fill in README with live URLs
# 8. Fill in the AI-Assisted Development section of README
# 9. Save this Claude conversation URL for submission
# 10. git commit -m "final submission" && git push
```

---

## Evaluation Criteria Coverage

| Criterion | Where Addressed |
|---|---|
| Architecture: correct boundary separation | ESLint rules (Phase 0), tested with pnpm lint |
| SDK design: auth handling | Phase 1 — private #apiKey, never exposed |
| SDK design: typed contracts | Phase 1 — types.ts matches real Pexels API |
| SDK design: error handling | Phase 1 — non-2xx throws with status code |
| SDK design: event emitter | Phase 1 — emitter.ts, default listener in sdk.ts |
| SDK design: caching/dedup | Phase 1 — RequestCache dedupes in-flight requests |
| Headless components: prop-getters | Phase 4 — all three hooks |
| Headless components: no styles | Phase 4 — enforced by convention + code review |
| Headless components: a11y | Phase 4 — role, aria-*, focus trap, roving tabindex |
| Skills quality: changes AI output | Phase 6 — exact signatures, common mistakes, code examples |
| Skills demonstrated in practice | Phase 5 — prepend skill docs to Claude Code session |
| Judgment: scoped cuts documented | Phase 3 (stubs with header comment) + Phase 7 (README table) |
```
