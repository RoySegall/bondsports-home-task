import { useLayoutEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useAppStore } from '../../States/useAppStore'
import { useLibrary } from '../../lib/useLibrary'
import { useContentWidth } from '../../lib/useContentWidth'
import { LibraryHeader } from './LibraryHeader'
import { LibraryRow } from './LibraryRow'
import styles from './LibraryView.module.css'

const MIN_COLUMN = 220
const GAP = 12
const ASPECT = 16 / 9

// Populated library: header + a responsive, uniform 16:9 card grid. Rows are
// virtualized with @tanstack/react-virtual, so only the on-screen rows mount and
// it stays smooth at thousands of entries. (Routing guarantees we only render here
// when the library is non-empty — see useHasLibrary.)
export function LibraryView() {
  // The list comes straight from the React Query cache (filtered in the query);
  // only the search term — for the "no match" message — comes from the UI store.
  const { total, paths: filteredPaths } = useLibrary()
  const searchTerm = useAppStore((state) => state.searchTerm)

  // The virtualizer owns the scroll axis; we only measure the container's content
  // width to derive the column count.
  const [scrollRef, width] = useContentWidth<HTMLDivElement>()

  const columnCount = width > 0 ? Math.max(1, Math.floor((width + GAP) / (MIN_COLUMN + GAP))) : 1
  const columnWidth = width > 0 ? (width - (columnCount - 1) * GAP) / columnCount : 0
  const rowHeight = Math.max(1, columnWidth / ASPECT + GAP) // tile height + row gap
  const rowCount = width > 0 ? Math.ceil(filteredPaths.length / columnCount) : 0

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 4,
  })

  // react-virtual keys its measurement cache on count/itemSizeCache, not on
  // estimateSize — so a new rowHeight (from a resize) won't invalidate the cached
  // row positions on its own. Re-measure when it changes to keep rows aligned.
  useLayoutEffect(() => {
    rowVirtualizer.measure()
  }, [rowHeight, rowVirtualizer])

  return (
    <div className={styles.library}>
      <LibraryHeader filtered={filteredPaths.length} total={total} />

      <div ref={scrollRef} className={styles.scroll}>
        {!filteredPaths.length ? (
          <p className={styles.noResults}>No files match “{searchTerm}”.</p>
        ) : (
          <div className={styles.sizer} style={{ height: rowVirtualizer.getTotalSize() }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const start = virtualRow.index * columnCount
              return (
                <LibraryRow
                  key={virtualRow.key}
                  paths={filteredPaths.slice(start, start + columnCount)}
                  startIndex={start}
                  top={virtualRow.start}
                  height={rowHeight - GAP}
                  columnCount={columnCount}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
