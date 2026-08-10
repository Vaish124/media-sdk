import { useState } from 'react'
import type { FormEvent } from 'react'
import styles from '../styles/app.module.css'

export interface SearchBarProps {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [value, setValue] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(value.trim())
  }

  const clear = () => {
    setValue('')
    onSearch('')
  }

  return (
    <form className={styles.searchBar} onSubmit={submit}>
      <input
        type="text"
        className={styles.searchInput}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Search photos and videos…"
        aria-label="Search media"
      />
      {value.length > 0 && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={clear}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
      <button type="submit" className={styles.searchButton}>
        Search
      </button>
    </form>
  )
}
