// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Router from './Router'
import { LIBRARY_KEY } from '../lib/useLibrary'
import { useAppStore } from '../States/useAppStore'

function renderRouter(client: QueryClient) {
  return render(
    <QueryClientProvider client={client}>
      <Router />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  // jsdom has no layout engine; the grid mounts a ResizeObserver, so stub it. That
  // shim is exactly why render tests are a smoke check, not a safety net (DECISIONS.md).
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
  it('shows the empty state while the library cache is empty', () => {
    renderRouter(new QueryClient())
    expect(screen.getByText(/your vault is empty/i)).toBeTruthy()
    expect(screen.queryByText(/video library/i)).toBeNull()
  })

  it('routes to the library once the cache holds a non-empty list', () => {
    const client = new QueryClient()
    client.setQueryData(LIBRARY_KEY, ['/videos/a.mp4', '/videos/b.mp4'])
    renderRouter(client)
    expect(screen.getByText(/video library/i)).toBeTruthy()
    expect(screen.queryByText(/your vault is empty/i)).toBeNull()
  })

  it('stays on the home screen when an import yields no valid videos (empty list)', () => {
    const client = new QueryClient()
    client.setQueryData(LIBRARY_KEY, [])
    renderRouter(client)
    expect(screen.getByText(/your vault is empty/i)).toBeTruthy()
    expect(screen.queryByText(/video library/i)).toBeNull()
  })
})
