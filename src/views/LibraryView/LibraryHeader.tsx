import styles from './LibraryHeader.module.css'

// Library heading with the live "filtered of total" file count.
export function LibraryHeader({ filtered, total }: { filtered: number; total: number }) {
  return (
    <div className={styles.header}>
      <div>
        <h2 className={styles.title}>Video Library</h2>
        <p className={styles.subtitle}>
          {filtered.toLocaleString()} of {total.toLocaleString()} files
        </p>
      </div>
    </div>
  )
}
