import { basename } from '../../shared/deriveMetadata'

// Filter paths by file name (case-insensitive). Pure & testable; used by the
// library query's `select` transform.
export function filterPaths(paths: string[], term: string): string[] {
  const query = term.trim().toLowerCase()
  if (!query) {
    return paths
  }
  return paths.filter((path) => basename(path).toLowerCase().includes(query))
}
