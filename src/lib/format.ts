// Human-readable formatting helpers for file metadata. Pure & unit-testable.

// Format a byte count with binary units (1 KB = 1024 B), e.g. 24.5 MB, 1.2 GB.
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '—'
  }
  if (bytes < 1024) {
    return `${bytes} B`
  }
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  // One decimal below 100, none above — reads cleaner (9.4 MB, 340 MB).
  const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10
  return `${rounded} ${units[unit]}`
}

// Format a duration in seconds as m:ss, or h:mm:ss past an hour.
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '0:00'
  }
  const s = Math.floor(totalSeconds % 60)
  const m = Math.floor((totalSeconds / 60) % 60)
  const h = Math.floor(totalSeconds / 3600)
  const ss = String(s).padStart(2, '0')
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${ss}`
  }
  return `${m}:${ss}`
}
