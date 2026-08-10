import { useEffect, useState } from 'react'
import { useMediaSDK } from '@media-sdk/media-react'
import type { MediaItem, PexelsVideo } from '@media-sdk/media-react'
import { useLightbox } from '@media-sdk/media-ui-react'
import styles from '../styles/lightbox.module.css'

export interface LightboxViewProps {
  items: MediaItem[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

function isVideo(item: MediaItem): item is PexelsVideo {
  return 'video_files' in item
}

// Prefer the 'hd' rendition; fall back to whatever the API returned first.
function preferredVideoFile(video: PexelsVideo) {
  return video.video_files.find(f => f.quality === 'hd') ?? video.video_files[0]
}

// Pexels media URLs end in a filename (e.g. pexels-photo-2113566.jpeg);
// fall back to a generated one if the URL shape ever changes.
function filenameFromUrl(url: string, id: number): string {
  try {
    const path = new URL(url).pathname
    const name = path.substring(path.lastIndexOf('/') + 1)
    return name || `pexels-media-${id}`
  } catch {
    return `pexels-media-${id}`
  }
}

export function LightboxView({ items, initialIndex, isOpen, onClose }: LightboxViewProps) {
  const sdk = useMediaSDK()

  const {
    isOpen: internalIsOpen,
    activeIndex,
    open,
    close,
    getLightboxProps,
    getOverlayProps,
    getCloseButtonProps,
    getNextButtonProps,
    getPrevButtonProps,
    lightboxRef,
  } = useLightbox({ items, onClose })

  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      open(initialIndex)
    } else if (internalIsOpen) {
      close()
    }
  }, [isOpen, initialIndex, internalIsOpen, open, close])

  // Clear any stale error/progress state when navigating to a different photo.
  useEffect(() => {
    setDownloadError(null)
    setIsDownloading(false)
  }, [activeIndex])

  if (!internalIsOpen) return null

  const activeItem = items[activeIndex]

  const handleDownload = async () => {
    if (!activeItem || isDownloading) return

    const downloadUrl = isVideo(activeItem)
      ? preferredVideoFile(activeItem)?.link
      : activeItem.src.original
    const itemType = isVideo(activeItem) ? 'video' : 'photo'

    if (!downloadUrl) {
      setDownloadError('No downloadable file available for this item.')
      return
    }

    // Telemetry stays independent of whether the fetch below succeeds.
    sdk.emit({ type: 'download', itemId: activeItem.id, itemType })

    setDownloadError(null)
    setIsDownloading(true)
    try {
      const response = await fetch(downloadUrl)
      if (!response.ok) {
        throw new Error(`Pexels responded with ${response.status}`)
      }
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filenameFromUrl(downloadUrl, activeItem.id)
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      setDownloadError('Download failed. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <>
      <div {...getOverlayProps()} className={styles.overlay} />
      <div {...getLightboxProps()} ref={lightboxRef} className={styles.dialog}>
        <button {...getCloseButtonProps()} className={styles.closeBtn}>
          ✕
        </button>
        <button {...getPrevButtonProps()} className={styles.prevBtn}>
          ‹
        </button>
        {activeItem &&
          (isVideo(activeItem) ? (
            <video
              key={activeItem.id}
              src={preferredVideoFile(activeItem)?.link}
              controls
              autoPlay
              loop
            />
          ) : (
            <img src={activeItem.src.large} alt={activeItem.alt || `Photo by ${activeItem.photographer}`} />
          ))}
        <button {...getNextButtonProps()} className={styles.nextBtn}>
          ›
        </button>
        <button
          type="button"
          className={styles.downloadBtn}
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? 'Downloading…' : 'Download'}
        </button>
        {downloadError && (
          <p role="alert" className={styles.downloadError}>
            {downloadError}
          </p>
        )}
      </div>
    </>
  )
}
