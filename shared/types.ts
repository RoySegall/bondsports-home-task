/**
 * The single source of truth for the file-metadata shape that crosses the
 * IPC boundary. The main process (mock API) produces it; the renderer's grid
 * cells consume it. Both `src/` and `electron/` import this so the contract
 * can never drift between the two sides.
 */
export interface FileMetadata {
  /** Original path from the CSV — also the cache key and the video source. */
  path: string
  /** Basename, e.g. `clip.mp4`. */
  name: string
  /** Lowercase extension without the dot, e.g. `mp4`. */
  extension: string
  /** Fake size in bytes, derived deterministically from the path. */
  sizeBytes: number
  /** Fake duration in seconds, derived deterministically from the path. */
  durationSec: number
  /** Last-modified time as epoch milliseconds. */
  lastModifiedMs: number
  /** A placeholder thumbnail (empty string = render a generated placeholder). */
  thumbnailUrl: string
}

/** Extensions we treat as video; everything else is silently ignored on import. */
export const VIDEO_EXTENSIONS = [
  'mp4', 'mkv', 'mov', 'webm', 'avi', 'm4v', 'flv', 'wmv', 'mpg', 'mpeg', 'm2ts', 'ts',
] as const

// True when a path ends in a known video extension (case-insensitive).
export function isVideoPath(path: string): boolean {
  const dot = path.lastIndexOf('.')
  if (dot < 0) {
    return false
  }
  const ext = path.slice(dot + 1).toLowerCase()
  return (VIDEO_EXTENSIONS as readonly string[]).includes(ext)
}

/** The API surface exposed to the renderer via `contextBridge` on `window.fileVaultApi`. */
export interface FileVaultApi {
  /** Opens a native dialog and returns the chosen CSV's text (or null if cancelled). */
  pickCsvFile: () => Promise<string | null>
  /** Fetches metadata for one path. Rejects ~10% of the time to simulate failures. */
  getFileMetadata: (path: string) => Promise<FileMetadata>
}
