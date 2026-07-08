import { Search } from 'lucide-react'
import { useAppStore } from '../../States/useAppStore'
import styles from './Topbar.module.css'

// Fixed frosted top bar: brand + live file-name search (disabled until files load).
export function Topbar() {
  const searchTerm = useAppStore((state) => state.searchTerm)
  const setSearchTerm = useAppStore((state) => state.setSearchTerm)
  const hasFiles = useAppStore((state) => state.view === 'grid')

  return (
    <header className={styles.topbar}>
      <span className={styles.brand}>File Vault</span>

      <label className={styles.search}>
        <Search size={16} strokeWidth={2} aria-hidden className={styles.searchIcon} />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search files…"
          aria-label="Filter files by name"
          disabled={!hasFiles}
        />
      </label>
    </header>
  )
}
