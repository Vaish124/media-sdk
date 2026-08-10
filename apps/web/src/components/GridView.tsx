import { useMediaSearch, useCuratedMedia } from '@media-sdk/media-react'
import type { PexelsPhoto, UseMediaSearchResult } from '@media-sdk/media-react'
import { useGrid } from '@media-sdk/media-ui-react'
import styles from '../styles/grid.module.css'

export interface GridViewProps {
  query: string
  onItemClick: (index: number, items: PexelsPhoto[]) => void
}

export function GridView({ query, onItemClick }: GridViewProps) {
  const hasQuery = query.trim().length > 0

  return hasQuery ? (
    <SearchGrid query={query} onItemClick={onItemClick} />
  ) : (
    <CuratedGrid onItemClick={onItemClick} />
  )
}

function SearchGrid({ query, onItemClick }: GridViewProps) {
  const result = useMediaSearch<PexelsPhoto>(query, {
    type: 'photo',
    enabled: true,
    per_page: 15,
  })
  return <GridBody result={result} onItemClick={onItemClick} />
}

function CuratedGrid({ onItemClick }: Omit<GridViewProps, 'query'>) {
  const result = useCuratedMedia<PexelsPhoto>({ type: 'photo', per_page: 15 })
  return <GridBody result={result} onItemClick={onItemClick} />
}

interface GridBodyProps {
  result: UseMediaSearchResult<PexelsPhoto>
  onItemClick: (index: number, items: PexelsPhoto[]) => void
}

function GridBody({ result, onItemClick }: GridBodyProps) {
  const { items, loading, error, hasNextPage, loadMore, reset } = result

  const { getContainerProps, getItemProps, sentinelRef } = useGrid({
    items,
    onLoadMore: loadMore,
    hasNextPage,
    isLoading: loading,
    columns: 3,
    onItemClick: index => onItemClick(index, items),
  })

  if (error) {
    return (
      <div className={styles.errorState} role="alert">
        <p>{error.message}</p>
        <button type="button" onClick={reset} className={styles.retryButton}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div {...getContainerProps()} className={styles.grid}>
      {loading && items.length === 0
        ? Array.from({ length: 6 }, (_, i) => <div key={`skeleton-${i}`} className={styles.skeleton} />)
        : items.map((photo, i) => (
            <div key={photo.id} {...getItemProps(i)} className={styles.item}>
              <img src={photo.src.medium} alt={photo.alt || `Photo by ${photo.photographer}`} />
            </div>
          ))}
      <div ref={sentinelRef} aria-hidden="true" className={styles.sentinel} />
    </div>
  )
}
