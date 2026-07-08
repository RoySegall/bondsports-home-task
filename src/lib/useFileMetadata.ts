import { useQuery } from '@tanstack/react-query'
import { getFileMetadata } from './fileVaultApi'

// Per-cell metadata query. The path is both the cache key and the fetch input —
// so identical paths dedupe, and each cell owns its own loading/error state.
export function useFileMetadata(path: string) {
  return useQuery({
    queryKey: ['metadata', path],
    queryFn: () => getFileMetadata(path),
  })
}
