// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import App from './App'
import { useAppStore } from './States/useAppStore'

// A deliberately small router test: the store's `view` should drive which screen
// shows. Note the ResizeObserver stub — jsdom has no layout engine, so the grid
// can't even mount without it. That shim is the reason we treat render tests as a
// smoke check, not a safety net (see DECISIONS.md).
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  useAppStore.getState().reset()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Router', () => {
  it('shows the empty state until a CSV is imported', () => {
    render(<App />)
    expect(screen.getByText(/your vault is empty/i)).toBeTruthy()
    expect(screen.queryByText(/video library/i)).toBeNull()
  })

  it('routes to the library once the store has file paths', () => {
    render(<App />)
    act(() => {
      useAppStore.getState().setFilePaths(['/videos/a.mp4', '/videos/b.mp4'])
    })
    expect(screen.getByText(/video library/i)).toBeTruthy()
    expect(screen.queryByText(/your vault is empty/i)).toBeNull()
  })
})
