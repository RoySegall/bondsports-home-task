import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { FolderX } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '../../States/useAppStore'
import { FileCard } from '../../components/FileCard'
import { Button } from '../../components/Button'
import { useImportCsv } from '../../lib/useImportCsv'
import styles from './LibraryView.module.css'

const MIN_COLUMN = 220
const GAP = 12
const ASPECT = 16 / 9
const OVERSCAN = 600 // px rendered beyond the viewport, above and below

interface Tile {
  index: number
  path: string
  left: number
  top: number
  width: number
  height: number
}

// Populated library: header + a responsive, uniform card grid. Every cell is the
// same 16:9 size. The layout is a plain grid computed from the measured width, so
// we can window it — only tiles near the viewport are mounted — and it stays smooth
// at thousands of entries.
export function LibraryView() {
  const { filePaths, filteredPaths, searchTerm } = useAppStore(
    useShallow((state) => ({
      filePaths: state.filePaths,
      filteredPaths: state.filteredPaths,
      searchTerm: state.searchTerm,
    })),
  )
  const importCsv = useImportCsv()

  // Measure the scroll container (content width for columns, height for windowing).
  const scrollRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  useLayoutEffect(() => {
    const element = scrollRef.current
    if (!element) {
      return
    }
    const measure = () => {
      const style = getComputedStyle(element)
      const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
      setWidth(element.clientWidth - padX)
      setViewportHeight(element.clientHeight)
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

  // Throttle scroll updates to one per frame so windowing recomputes cheaply.
  const frameRef = useRef(0)
  const onScroll = () => {
    if (frameRef.current) {
      return
    }
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0
      if (scrollRef.current) {
        setScrollTop(scrollRef.current.scrollTop)
      }
    })
  }

  const columnCount = width > 0 ? Math.max(1, Math.floor((width + GAP) / (MIN_COLUMN + GAP))) : 1
  const columnWidth = width > 0 ? (width - (columnCount - 1) * GAP) / columnCount : 0

  // Uniform grid: every tile the same 16:9 box, placed by row/column. Deterministic
  // and O(n), so positions are stable and windowing (below) is cheap.
  const { tiles, totalHeight } = useMemo(() => {
    if (columnWidth <= 0) {
      return { tiles: [] as Tile[], totalHeight: 0 }
    }
    const tileHeight = columnWidth / ASPECT
    const rowStride = tileHeight + GAP
    const laid = filteredPaths.map((path, index): Tile => {
      const column = index % columnCount
      const row = Math.floor(index / columnCount)
      return {
        index,
        path,
        left: column * (columnWidth + GAP),
        top: row * rowStride,
        width: columnWidth,
        height: tileHeight,
      }
    })
    const rowCount = Math.ceil(filteredPaths.length / columnCount)
    return { tiles: laid, totalHeight: Math.max(0, rowCount * rowStride - GAP) }
  }, [filteredPaths, columnCount, columnWidth])

  const visible = tiles.filter(
    (tile) =>
      tile.top + tile.height > scrollTop - OVERSCAN &&
      tile.top < scrollTop + viewportHeight + OVERSCAN,
  )

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
      </div>

      <div ref={scrollRef} className={styles.scroll} onScroll={onScroll}>
        {filteredPaths.length === 0 ? (
          <p className={styles.noResults}>No files match “{searchTerm}”.</p>
        ) : (
          <div className={styles.sizer} style={{ height: totalHeight }}>
            {visible.map((tile) => (
              // Key by absolute position, not path: the same file may appear many
              // times, and duplicate sibling keys corrupt reconciliation.
              <div
                key={tile.index}
                className={styles.tile}
                style={{
                  transform: `translate(${tile.left}px, ${tile.top}px)`,
                  width: tile.width,
                  height: tile.height,
                }}
              >
                <FileCard index={tile.index} path={tile.path} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
