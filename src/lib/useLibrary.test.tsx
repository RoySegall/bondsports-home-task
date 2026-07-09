// @vitest-environment jsdom
import type { ReactNode } from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLibrary, LIBRARY_KEY } from './useLibrary'
import { useAppStore } from '../States/useAppStore'

function withClient(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe('useLibrary', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
  })

  it('reads the list from the React Query cache and reports the total', () => {
    const client = new QueryClient()
    client.setQueryData(LIBRARY_KEY, ['/v/a.mp4', '/v/b.mp4', '/v/c.mp4'])
    const { result } = renderHook(() => useLibrary(), { wrapper: withClient(client) })
    expect(result.current.total).toBe(3)
    expect(result.current.paths).toHaveLength(3)
  })

  it('filters by the search term via the query select, keeping total unfiltered', () => {
    useAppStore.getState().setSearchTerm('sun')
    const client = new QueryClient()
    client.setQueryData(LIBRARY_KEY, ['/v/Sunset.mp4', '/v/beach.mov'])
    const { result } = renderHook(() => useLibrary(), { wrapper: withClient(client) })
    expect(result.current.total).toBe(2)
    expect(result.current.paths).toEqual(['/v/Sunset.mp4'])
  })
})
