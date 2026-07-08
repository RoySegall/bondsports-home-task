import { useLayoutEffect, useRef, useState } from 'react'
import { LayoutGrid, List, FolderX } from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '../../States/useAppStore'
import { FileCard } from '../../components/FileCard'
import { Button } from '../../components/Button'
import { useImportCsv } from '../../lib/useImportCsv'
import { classNames } from '../../lib/classNames'
import styles from './LibraryView.module.css'

const MIN_COLUMN = 220
const GAP = 12

// Populated library: header + a virtualized, responsive card grid that stays
// smooth at thousands of entries (only visible rows are mounted).
export function LibraryView() {
  const { filePaths, filteredPaths, searchTerm } = useAppStore(
    useShallow((state) => ({
      filePaths: state.filePaths,
      filteredPaths: state.filteredPaths,
      searchTerm: state.searchTerm,
    })),
  )
  const importCsv = useImportCsv()

  // Measure the scroll container's content width to derive the column count.
  const scrollRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const element = scrollRef.current
    if (!element) {
      return
    }
    const measure = () => {
      const style = getComputedStyle(element)
      const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
      setWidth(element.clientWidth - padX)
    }
    measure() // synchronous initial measure — don't wait on the observer's first tick
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const columnCount = width > 0 ? Math.max(1, Math.floor((width + GAP) / (MIN_COLUMN + GAP))) : 1
  const columnWidth = width > 0 ? (width - (columnCount - 1) * GAP) / columnCount : 0
  const rowHeight = Math.max(1, (columnWidth * 9) / 16 + GAP)
  const rowCount = width > 0 ? Math.ceil(filteredPaths.length / columnCount) : 0

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 4,
  })

  // The virtualizer caches row positions and won't notice a new estimateSize on
  // its own; re-measure when rowHeight changes so cards stay aligned on resize.
  useLayoutEffect(() => {
    rowVirtualizer.measure()
  }, [rowHeight, rowVirtualizer])

  // Empty state: the imported CSV contained no valid video paths.
  if (filePaths.length === 0) {
    return (
      <div className={styles.emptyResult}>
        <FolderX size={40} strokeWidth={1.5} aria-hidden />
        <p>No valid video files were found in that CSV.</p>
        <Button variant="ghost" onClick={() => importCsv.mutate()} disabled={importCsv.isPending}>
          Import another CSV
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.library}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Video Library</h2>
          <p className={styles.subtitle}>
            {filteredPaths.length.toLocaleString()} of {filePaths.length.toLocaleString()} files
          </p>
        </div>
        <div className={styles.toggle} role="group" aria-label="View mode">
          <button
            type="button"
            className={classNames(styles.iconButton, styles.active)}
            aria-label="Grid view"
            aria-pressed
          >
            <LayoutGrid size={18} aria-hidden />
          </button>
          <button type="button" className={styles.iconButton} aria-label="List view" disabled>
            <List size={18} aria-hidden />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className={styles.scroll}>
        {filteredPaths.length === 0 ? (
          <p className={styles.noResults}>No files match “{searchTerm}”.</p>
        ) : (
          <div className={styles.sizer} style={{ height: rowVirtualizer.getTotalSize() }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const start = virtualRow.index * columnCount
              const rowItems = filteredPaths.slice(start, start + columnCount)
              return (
                <div
                  key={virtualRow.key}
                  className={styles.row}
                  style={{
                    height: rowHeight - GAP,
                    transform: `translateY(${virtualRow.start}px)`,
                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                  }}
                >
                  {rowItems.map((path, columnIndex) => (
                    // Identify each cell by absolute position, not path: the same file
                    // may appear many times. This drives both React's key (so duplicate
                    // siblings don't corrupt reconciliation) and play state (so only the
                    // clicked card plays, not every card sharing that path).
                    <FileCard key={start + columnIndex} index={start + columnIndex} path={path} />
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
