import { useCallback, useState } from 'react'
import { useMediaEvents } from '@media-sdk/media-react'
import type { MediaEvent } from '@media-sdk/media-react'
import styles from '../styles/eventlog.module.css'

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour12: false })
}

export function EventLog() {
  const [events, setEvents] = useState<MediaEvent[]>([])
  const [isOpen, setIsOpen] = useState(true)

  const handleEvent = useCallback((event: MediaEvent) => {
    setEvents(prev => [event, ...prev].slice(0, 10))
  }, [])

  useMediaEvents(handleEvent, [])

  return (
    <div className={styles.panel}>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setIsOpen(o => !o)}
        aria-expanded={isOpen}
      >
        Event Log {isOpen ? '▾' : '▸'}
      </button>
      {isOpen && (
        <ul className={styles.list}>
          {events.length === 0 && <li className={styles.empty}>No events yet</li>}
          {events.map((event, i) => (
            <li key={`${event.itemId}-${event.timestamp}-${i}`} className={styles.row}>
              <span
                className={`${styles.badge} ${event.type === 'view' ? styles.badgeView : styles.badgeDownload}`}
              >
                {event.type}
              </span>
              <span className={styles.itemId}>#{event.itemId}</span>
              <span className={styles.time}>{formatTime(event.timestamp)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
