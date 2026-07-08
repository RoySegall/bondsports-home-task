import { useMemo } from 'react'
import { Play, TriangleAlert, RotateCw } from 'lucide-react'
import { basename } from '../../../shared/deriveMetadata'
import { formatFileSize, formatDuration } from '../../lib/format'
import { classNames } from '../../lib/classNames'
import { videoSource } from '../../lib/fileVaultApi'
import { useFileMetadata } from '../../lib/useFileMetadata'
import { useAppStore } from '../../States/useAppStore'
import styles from './FileCard.module.css'

// Deterministic hue from the name so each placeholder thumbnail looks distinct.
function hueFor(name: string): number {
  let hue = 0
  for (let i = 0; i < name.length; i++) {
    hue = (hue * 31 + name.charCodeAt(i)) % 360
  }
  return hue
}

// Borderless tile. Metadata is fetched per-cell via React Query (loading / error /
// success); the play button swaps the thumbnail for a real <video> on click.
export function FileCard({ path, index }: { path: string; index: number }) {
  const { data, isPending, isError, isFetching, refetch } = useFileMetadata(path)
  // Playback is owned by the store so only one card plays at a time; keying on the
  // unique position (not path) means duplicate files don't all play together, and
  // selecting a boolean keeps other cards from re-rendering when the active one changes.
  const playing = useAppStore((state) => state.playingIndex === index)
  const setPlayingIndex = useAppStore((state) => state.setPlayingIndex)
  const name = basename(path)
  const hue = useMemo(() => hueFor(name), [name])
  const thumbStyle = {
    background: `linear-gradient(140deg, hsl(${hue} 18% 20%), hsl(${(hue + 30) % 360} 22% 9%))`,
  }

  if (playing) {
    return (
      <article className={styles.card}>
        {/* autoPlay because mounting IS the user's click; onEnded returns to the thumb */}
        <video
          className={styles.video}
          src={videoSource(path)}
          controls
          autoPlay
          preload="auto"
          onEnded={() => setPlayingIndex(null)}
        />
      </article>
    )
  }

  return (
    <article className={styles.card}>
      <div className={styles.thumb} style={thumbStyle}>
        {isError ? (
          <div className={styles.error}>
            <TriangleAlert size={20} strokeWidth={2} aria-hidden />
            <span>Failed to load</span>
            <button type="button" className={styles.retry} onClick={() => refetch()} disabled={isFetching}>
              <RotateCw size={13} strokeWidth={2.25} aria-hidden />
              {isFetching ? 'Retrying…' : 'Retry'}
            </button>
          </div>
        ) : isPending ? (
          <div className={styles.loading} aria-label="Loading" />
        ) : (
          <>
            {data.extension && (
              <span className={classNames(styles.badge, styles.type)}>{data.extension}</span>
            )}
            <span className={classNames(styles.badge, styles.duration)}>
              {formatDuration(data.durationSec)}
            </span>
            <button
              type="button"
              className={styles.play}
              onClick={() => setPlayingIndex(index)}
              aria-label={`Play ${name}`}
            >
              <Play size={20} strokeWidth={2} fill="currentColor" />
            </button>
          </>
        )}

        <div className={styles.info}>
          {isPending ? (
            <>
              <span className={classNames(styles.skeleton, styles.skeletonName)} />
              <span className={classNames(styles.skeleton, styles.skeletonSize)} />
            </>
          ) : (
            <>
              <h3 className={styles.name} title={name}>
                {name}
              </h3>
              {!isError && <span className={styles.size}>{formatFileSize(data.sizeBytes)}</span>}
            </>
          )}
        </div>
      </div>
    </article>
  )
}
