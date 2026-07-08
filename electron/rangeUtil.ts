export interface ResolvedRange {
  start: number
  end: number
  partial: boolean
}

// Resolve an HTTP Range header against a total byte length. Pure & testable
// (no electron import, so it runs in a plain Node/test context).
export function resolveRange(total: number, rangeHeader: string | null): ResolvedRange {
  const match = rangeHeader ? /bytes=(\d*)-(\d*)/.exec(rangeHeader) : null
  if (!match) {
    return { start: 0, end: total - 1, partial: false }
  }
  let start = match[1] ? parseInt(match[1], 10) : 0
  let end = match[2] ? parseInt(match[2], 10) : total - 1
  if (Number.isNaN(start) || start < 0) {
    start = 0
  }
  if (Number.isNaN(end) || end >= total) {
    end = total - 1
  }
  if (start > end) {
    start = 0
    end = total - 1
  }
  return { start, end, partial: true }
}
