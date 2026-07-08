import { protocol } from 'electron'
import { createReadStream } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { Readable } from 'node:stream'
import path from 'node:path'
import { resolveRange, type ResolvedRange } from './rangeUtil'
import { isVideoPath } from '../shared/types'

let cachedDummy: Buffer | null = null
async function loadDummyVideo(): Promise<Buffer> {
  if (!cachedDummy) {
    cachedDummy = await readFile(path.join(process.env.VITE_PUBLIC, 'dummy-video.mp4'))
  }
  return cachedDummy
}

// The vault URL carries the real path: vault://media/<encoded absolute path>.
function requestedPath(url: string): string {
  return decodeURIComponent(new URL(url).pathname.replace(/^\//, ''))
}

// Build a (possibly partial) video Response, echoing Range headers so the
// player can seek without downloading the whole file.
function videoResponse(body: BodyInit, range: ResolvedRange, total: number): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes',
    'Content-Length': String(range.end - range.start + 1),
  }
  if (range.partial) {
    headers['Content-Range'] = `bytes ${range.start}-${range.end}/${total}`
  }
  return new Response(body, { status: range.partial ? 206 : 200, headers })
}

// Streams the real video off disk when it exists; otherwise falls back to the
// bundled dummy clip. This is the "vault hack": the renderer can't touch file://,
// so the main process serves the bytes over a custom scheme instead.
export function registerVaultProtocol(): void {
  protocol.handle('vault', async (request) => {
    const filePath = requestedPath(request.url)
    const rangeHeader = request.headers.get('Range')
    const stats = isVideoPath(filePath) ? await stat(filePath).catch(() => null) : null

    if (stats) {
      const range = resolveRange(stats.size, rangeHeader)
      const stream = createReadStream(filePath, { start: range.start, end: range.end })
      return videoResponse(Readable.toWeb(stream) as unknown as ReadableStream, range, stats.size)
    }

    // No such file on disk (e.g. a "file not found" row) — serve the dummy.
    const data = await loadDummyVideo()
    const range = resolveRange(data.length, rangeHeader)
    return videoResponse(new Uint8Array(data.subarray(range.start, range.end + 1)), range, data.length)
  })
}
