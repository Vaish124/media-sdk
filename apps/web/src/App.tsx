import { useState } from 'react'
import type { MediaItem } from '@media-sdk/media-react'
import { SearchBar } from './components/SearchBar'
import { GridView } from './components/GridView'
import { ReelView } from './components/ReelView'
import { LightboxView } from './components/LightboxView'
import { EventLog } from './components/EventLog'
import styles from './styles/app.module.css'

function App() {
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [lightboxItems, setLightboxItems] = useState<MediaItem[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [view, setView] = useState<'grid' | 'reels'>('grid')

  const handleItemClick = (index: number, items: MediaItem[]) => {
    setLightboxItems(items)
    setLightboxIndex(index)
    setIsLightboxOpen(true)
  }

  return (
    <>
      <nav className={styles.nav}>
        <span className={styles.brand}>MediaSDK Demo</span>
        <button
          type="button"
          className={styles.viewToggle}
          onClick={() => setView(v => (v === 'grid' ? 'reels' : 'grid'))}
        >
          Switch to {view === 'grid' ? 'Reels' : 'Grid'}
        </button>
      </nav>

      <SearchBar onSearch={setSubmittedQuery} />

      <main className={styles.main}>
        {view === 'grid' && <GridView query={submittedQuery} onItemClick={handleItemClick} />}
        {view === 'reels' && <ReelView query={submittedQuery} onItemClick={handleItemClick} />}
      </main>

      <LightboxView
        items={lightboxItems}
        initialIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />

      <EventLog />
    </>
  )
}

export default App
