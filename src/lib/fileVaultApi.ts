import { deriveFileMetadata } from '../../shared/deriveMetadata'
import type { FileMetadata } from '../../shared/types'
import { SAMPLE_FILE_PATHS } from './sampleData'

// Single access point for the preload-exposed API. Inside Electron it uses real
// IPC; in a plain browser (no preload) it falls back to sample data / a simulated
// mock so the UI stays demoable.

export async function pickCsvFile(): Promise<string | null> {
  if (window.fileVaultApi) {
    return window.fileVaultApi.pickCsvFile()
  }
  return SAMPLE_FILE_PATHS.map((path) => `"${path}"`).join('\r\n')
}

export async function getFileMetadata(filePath: string): Promise<FileMetadata> {
  if (window.fileVaultApi) {
    return window.fileVaultApi.getFileMetadata(filePath)
  }
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500))
  if (Math.random() < 0.1) {
    throw new Error('Metadata lookup failed')
  }
  return deriveFileMetadata(filePath)
}

// Playback source for a file: the custom vault:// scheme in Electron (streamed
// by the main process), or the vite-served dummy video in a plain browser.
export function videoSource(filePath: string): string {
  if (window.fileVaultApi) {
    return `vault://media/${encodeURIComponent(filePath)}`
  }
  return '/dummy-video.mp4'
}
