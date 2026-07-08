import type { FileMetadata } from './types'

// Deterministic (no Date.now / Math.random) fake metadata from a path, so it's
// cache-friendly and testable. The main-process mock API reuses this exact fn.

const MB = 1024 * 1024
/** Fixed "now" anchor so lastModified is stable across runs (≈ 2026-06-01). */
const REFERENCE_NOW_MS = 1_780_000_000_000
const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000

/** FNV-1a — small, fast, well-distributed 32-bit hash. */
function hash32(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Basename of a path, handling both `/` and `\` separators. */
export function basename(path: string): string {
  const parts = path.split(/[\\/]/)
  return parts[parts.length - 1] || path
}

/** Lowercase extension without the dot (empty string if none). */
export function extname(path: string): string {
  const name = basename(path)
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : ''
}

export function deriveFileMetadata(path: string): FileMetadata {
  const seed = hash32(path)
  const seedB = hash32(`${path}#b`)

  // Size: ~3 MB … ~2 GB
  const sizeBytes = 3 * MB + (seed % (2000 * MB))
  // Duration: 15s … ~2h
  const durationSec = 15 + (seedB % (2 * 60 * 60))
  // Last modified: sometime in the ~2 years before the reference anchor.
  const lastModifiedMs = REFERENCE_NOW_MS - (seed % TWO_YEARS_MS)

  return {
    path,
    name: basename(path),
    extension: extname(path),
    sizeBytes,
    durationSec,
    lastModifiedMs,
    thumbnailUrl: '',
  }
}
