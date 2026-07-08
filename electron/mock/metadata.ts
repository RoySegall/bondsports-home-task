import { existsSync } from 'node:fs'
import { deriveFileMetadata, basename } from '../../shared/deriveMetadata'
import type { FileMetadata } from '../../shared/types'

const MIN_LATENCY_MS = 300
const MAX_LATENCY_MS = 800
const FAILURE_RATE = 0.1

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Mock network lookup: realistic latency, a deterministic "not found" for missing
// files, plus a random ~10% failure. Metadata itself is derived from the path.
export async function fetchFileMetadata(filePath: string): Promise<FileMetadata> {
  const latency = MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS)
  await delay(latency)

  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${basename(filePath)}`)
  }
  if (Math.random() < FAILURE_RATE) {
    throw new Error(`Metadata lookup failed for ${basename(filePath)}`)
  }
  return deriveFileMetadata(filePath)
}
