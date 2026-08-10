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
