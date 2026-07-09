import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../States/useAppStore'
import { filterPaths } from './filterPaths'

// The imported file list is the result of a backend/IPC call, so it lives in the
// React Query cache — RQ is the data layer, and the single source of truth for the
// list. `enabled: false` means we never fetch it (there is no re-fetchable
// resource); the import mutation pushes it in with setQueryData.
export const LIBRARY_KEY = ['library'] as const

export interface Library {
  /** Total imported video paths (before the search filter). */
  total: number
  /** Paths after the name filter — what the grid renders. */
  paths: string[]
}

// Reads the list straight from the cache and applies the name filter with RQ's
// `select` transform — no copy into another store, no component-level memo. The
// search term (pure UI state) comes from Zustand; `select` re-runs when it changes.
export function useLibrary(): Library {
  const searchTerm = useAppStore((state) => state.searchTerm)
  const select = useCallback(
    (all: string[]): Library => ({ total: all.length, paths: filterPaths(all, searchTerm) }),
    [searchTerm],
  )
  return useQuery({ queryKey: LIBRARY_KEY, enabled: false, select }).data ?? { total: 0, paths: [] }
}

// Routing signal: is there a non-empty library to show? A CSV that imported no valid
// videos leaves an empty list, which we treat as "nothing to show" — the user simply
// lands back on the home/import screen.
export function useHasLibrary(): boolean {
  const paths = useQuery<string[]>({ queryKey: LIBRARY_KEY, enabled: false }).data
  return paths !== undefined && Boolean(paths.length);
}
