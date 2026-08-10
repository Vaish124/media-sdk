import { useMediaSearch } from '@media-sdk/media-react'
import type { PexelsVideo } from '@media-sdk/media-react'
import { useReelSwiper } from '@media-sdk/media-ui-react'
import styles from '../styles/reel.module.css'

export interface ReelViewProps {
  query: string
  onItemClick?: (index: number, items: PexelsVideo[]) => void
}

export function ReelView({ query, onItemClick }: ReelViewProps) {
  // Documented simplification: reels always need a query, so fall back to
  // 'nature' when no search is active (see README scoping table).
  const effectiveQuery = query.trim() ? query : 'nature'

  const { items, loading, loadMore } = useMediaSearch<PexelsVideo>(effectiveQuery, {
    type: 'video',
    per_page: 10,
  })

  const { activeIndex, getContainerProps, getItemProps } = useReelSwiper({
    items,
    isLoading: loading,
    onActiveChange: i => {
      if (i >= items.length - 3) loadMore()
    },
  })

  return (
    <div {...getContainerProps()} className={styles.reelContainer}>
      {items.map((video, i) => (
        <div
          key={video.id}
          {...getItemProps(i)}
          onClick={() => onItemClick?.(i, items)}
          className={i === activeIndex ? `${styles.reelItem} ${styles.active}` : styles.reelItem}
        >
          <img src={video.image} alt="Video thumbnail" />
          <div className={styles.meta}>
            <span className={styles.duration}>{video.duration}s</span>
            <span className={styles.user}>{video.user.name}</span>
          </div>
          <span className={styles.activeLabel}>{i === activeIndex ? '▶ Playing' : ''}</span>
        </div>
      ))}
    </div>
  )
}
