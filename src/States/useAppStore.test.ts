import { describe, it, expect, beforeEach } from 'vitest'
import { filterPaths, useAppStore } from './useAppStore'

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
    expect(filterPaths(paths, 'sunset')).toEqual([
      '/Users/roy/videos/Sunset.mp4',
      '/Users/roy/archive/SUNSET-2.mkv',
    ])
  })

  it('matches the base name only, not the directory', () => {
    // "videos" is in the folder path but not in any file name → no matches.
    expect(filterPaths(paths, 'videos')).toEqual([])
  })

  it('supports partial matches', () => {
    expect(filterPaths(paths, 'beach')).toEqual(['/Users/roy/videos/beach-clip.mov'])
  })
})

// The store's actions are where the UI's state transitions live; verifying them
// needs no DOM, which is why this is worth far more than a render assertion.
describe('useAppStore actions', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
  })

  it('setFilePaths loads the paths, seeds filteredPaths, and enters grid view', () => {
    useAppStore.getState().setFilePaths(['/v/a.mp4', '/v/b.mp4'])
    const state = useAppStore.getState()
    expect(state.filePaths).toEqual(['/v/a.mp4', '/v/b.mp4'])
    expect(state.filteredPaths).toEqual(['/v/a.mp4', '/v/b.mp4'])
    expect(state.view).toBe('grid')
  })

  it('setSearchTerm narrows filteredPaths while leaving the full list intact', () => {
    const { setFilePaths, setSearchTerm } = useAppStore.getState()
    setFilePaths(['/v/sunset.mp4', '/v/beach.mov'])
    setSearchTerm('sun')
    const state = useAppStore.getState()
    expect(state.searchTerm).toBe('sun')
    expect(state.filteredPaths).toEqual(['/v/sunset.mp4'])
    expect(state.filePaths).toHaveLength(2)
  })

  it('tracks a single playing tile, and clears it on a new import', () => {
    const { setPlayingIndex, setFilePaths } = useAppStore.getState()
    setPlayingIndex(3)
    expect(useAppStore.getState().playingIndex).toBe(3)
    setFilePaths(['/v/a.mp4'])
    expect(useAppStore.getState().playingIndex).toBeNull()
  })

  it('reset returns to the initial import state', () => {
    const store = useAppStore.getState()
    store.setFilePaths(['/v/a.mp4'])
    store.setSearchTerm('a')
    store.setPlayingIndex(0)
    store.reset()
    expect(useAppStore.getState()).toMatchObject({
      view: 'import',
      filePaths: [],
      filteredPaths: [],
      searchTerm: '',
      playingIndex: null,
    })
  })
})
