import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MediaProvider } from '@media-sdk/media-react'
import './index.css'
import App from './App.tsx'

const apiKey = import.meta.env.VITE_PEXELS_API_KEY
const root = createRoot(document.getElementById('root')!)

if (!apiKey) {
  root.render(
    <div style={{ padding: '2rem', color: 'red' }}>
      Missing VITE_PEXELS_API_KEY. Add it to .env and restart.
    </div>,
  )
} else {
  root.render(
    <StrictMode>
      <MediaProvider apiKey={apiKey}>
        <App />
      </MediaProvider>
    </StrictMode>,
  )
}
