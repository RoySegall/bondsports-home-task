import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './useAppStore'

// The store now holds only pure UI state; the file list lives in React Query.
describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
  })

  it('setSearchTerm updates the term and stops playback (positions shift on filter)', () => {
    useAppStore.getState().setPlayingIndex(2)
    useAppStore.getState().setSearchTerm('clip')
    const state = useAppStore.getState()
    expect(state.searchTerm).toBe('clip')
    expect(state.playingIndex).toBeNull()
  })

  it('setPlayingIndex tracks the single active tile', () => {
    useAppStore.getState().setPlayingIndex(5)
    expect(useAppStore.getState().playingIndex).toBe(5)
    useAppStore.getState().setPlayingIndex(null)
    expect(useAppStore.getState().playingIndex).toBeNull()
  })

  it('reset clears UI state', () => {
    useAppStore.getState().setSearchTerm('x')
    useAppStore.getState().setPlayingIndex(1)
    useAppStore.getState().reset()
    expect(useAppStore.getState()).toMatchObject({ searchTerm: '', playingIndex: null })
  })
})
