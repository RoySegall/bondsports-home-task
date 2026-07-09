import { describe, it, expect } from 'vitest'
import { formatFileSize, formatDuration } from './format'

describe('formatFileSize', () => {
  it('shows raw bytes under 1 KB', () => {
    expect(formatFileSize(512)).toBe('512 B')
  })

  it('scales with binary (1024) units', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(1024 * 1024)).toBe('1 MB')
    expect(formatFileSize(5 * 1024 * 1024 * 1024)).toBe('5 GB')
  })

  it('keeps one decimal below 100 and drops it at/above', () => {
    expect(formatFileSize(Math.round(9.4 * 1024 * 1024))).toBe('9.4 MB')
    expect(formatFileSize(340 * 1024 * 1024)).toBe('340 MB')
  })

  it('returns a dash for invalid sizes', () => {
    expect(formatFileSize(-1)).toBe('—')
    expect(formatFileSize(NaN)).toBe('—')
  })
})

describe('formatDuration', () => {
  it('formats under an hour as m:ss', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(65)).toBe('1:05')
    expect(formatDuration(600)).toBe('10:00')
  })

  it('formats an hour or more as h:mm:ss', () => {
    expect(formatDuration(3661)).toBe('1:01:01')
  })

  it('returns 0:00 for invalid input', () => {
    expect(formatDuration(-5)).toBe('0:00')
    expect(formatDuration(NaN)).toBe('0:00')
  })
})
