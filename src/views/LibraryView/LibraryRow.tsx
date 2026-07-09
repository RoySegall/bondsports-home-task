import { FileCard } from '../../components/FileCard'
import styles from './LibraryRow.module.css'

interface LibraryRowProps {
  /** The row's cells (already sliced from the filtered list). */
  paths: string[]
  /** Absolute index of the first cell — used for stable, unique keys. */
  startIndex: number
  /** Vertical offset from the virtualizer (px). */
  top: number
  /** Row height (px). */
  height: number
  columnCount: number
}

// One virtualized grid row of equal-width cells, absolutely positioned by the
// virtualizer. Keyed by absolute position, not path: the same file may appear many
// times, and duplicate sibling keys corrupt reconciliation.
export function LibraryRow({ paths, startIndex, top, height, columnCount }: LibraryRowProps) {
  return (
    <div
      className={styles.row}
      style={{
        height,
        transform: `translateY(${top}px)`,
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      }}
    >
      {paths.map((path, columnIndex) => (
        <FileCard key={startIndex + columnIndex} index={startIndex + columnIndex} path={path} />
      ))}
    </div>
  )
}
