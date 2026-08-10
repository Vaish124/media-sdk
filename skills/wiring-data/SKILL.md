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
