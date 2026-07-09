import { describe, it, expect } from 'vitest'
import { filterPaths } from './filterPaths'

const paths = [
  '/Users/roy/videos/Sunset.mp4',
  '/Users/roy/videos/beach-clip.mov',
  '/Users/roy/archive/SUNSET-2.mkv',
]

describe('filterPaths', () => {
  it('returns the same array (no copy) for an empty or whitespace query', () => {
    expect(filterPaths(paths, '')).toBe(paths)
    expect(filterPaths(paths, '   ')).toBe(paths)
  })

  it('matches the file name case-insensitively', () => {
    expect(filterPaths(paths, 'sunset')).toEqual([paths[0], paths[2]])
  })

  it('matches the base name only, not the directory', () => {
    // "videos" is in the folder path but not in any file name → no matches.
    expect(filterPaths(paths, 'videos')).toEqual([])
  })

  it('supports partial matches', () => {
    expect(filterPaths(paths, 'beach')).toEqual([paths[1]])
  })
})
