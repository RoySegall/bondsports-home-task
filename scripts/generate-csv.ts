#!/usr/bin/env tsx
// generate-csv — build a test CSV of file paths for File Vault.
// Scans a folder for real videos, then mixes in a chosen % of file-not-found and
// non-video rows. Output is RFC 4180 (header, quoted fields, CRLF).
//
// Interactive:      npm run generate:csv
// Non-interactive:  npm run generate:csv -- --rows 5000 --not-found 15 --non-video 10 --yes
// Flags: --videos <dir> --rows <n> --not-found <pct> --non-video <pct> --out <file> --yes
import { glob, writeFile } from 'node:fs/promises'
import path from 'node:path'
import readline from 'node:readline'
import { stdin, stdout, argv, exit } from 'node:process'
import { VIDEO_EXTENSIONS, isVideoPath } from '../shared/types'

const NON_VIDEO_EXTENSIONS = ['txt', 'pdf', 'png', 'jpg', 'docx', 'xlsx', 'zip', 'mp3', 'json', 'srt']

type SettingKey = 'videos' | 'rows' | 'not-found' | 'non-video' | 'out'

interface RowSpec {
  videosDir: string
  videoFiles: string[]
  notFound: number
  nonVideo: number
  valid: number
}

const DEFAULTS: Record<SettingKey, string | number> = {
  videos: './videos',
  rows: 5000,
  'not-found': 10,
  'non-video': 10,
  out: './sample-files.csv',
}

interface Flags {
  yes: boolean
  [key: string]: string | boolean | undefined
}

interface AskOpts {
  number?: boolean
  min?: number
  max?: number
  integer?: boolean
}

function parseArgs(args: string[]): Flags {
  const parsed: Flags = { yes: false }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--yes' || a === '-y') {
      parsed.yes = true
    } else if (a.startsWith('--')) {
      parsed[a.slice(2)] = args[++i]
    }
  }
  return parsed
}

// Collect absolute paths of video files under `dir` (recursively, via glob).
// The dir goes through the `cwd` option, not the pattern, so it stays Windows-safe.
async function scanVideos(dir: string): Promise<string[]> {
  const found: string[] = []
  try {
    for await (const match of glob('**/*', { cwd: dir })) {
      if (isVideoPath(match)) {
        found.push(path.resolve(dir, match))
      }
    }
  } catch {
    // Directory missing/unreadable → treat as no videos.
  }
  found.sort()
  return found
}

const pad = (n: number): string => String(n).padStart(5, '0')

// Fisher–Yates shuffle (in place).
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function buildRows({ videosDir, videoFiles, notFound, nonVideo, valid }: RowSpec): string[] {
  const absDir = path.resolve(videosDir)
  const out: string[] = []
  // Valid rows: cycle through the real files that exist on disk.
  for (let i = 0; i < valid; i++) {
    out.push(videoFiles[i % videoFiles.length])
  }
  // File-not-found rows: video-extension paths that do NOT exist.
  for (let i = 0; i < notFound; i++) {
    const ext = VIDEO_EXTENSIONS[i % VIDEO_EXTENSIONS.length]
    out.push(path.join(absDir, 'missing', `broken_clip_${pad(i)}.${ext}`))
  }
  // Non-video rows: non-video extensions, ignored on import.
  for (let i = 0; i < nonVideo; i++) {
    const ext = NON_VIDEO_EXTENSIONS[i % NON_VIDEO_EXTENSIONS.length]
    out.push(path.join(absDir, 'assets', `document_${pad(i)}.${ext}`))
  }
  return shuffle(out)
}

// Quote a field and escape embedded quotes (everything is quoted for safety).
function csvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

// Serialize rows to valid CSV: `path` header, quoted fields, CRLF endings.
function toCsv(rows: string[]): string {
  return ['path', ...rows].map(csvField).join('\r\n') + '\r\n'
}


// Line-buffered prompter: works for typed or piped input, defaults on EOF.
// Flags win over prompts; `--yes` skips prompting entirely.
function createPrompter(flags: Flags) {
  const rl = readline.createInterface({ input: stdin })
  const iterator = rl[Symbol.asyncIterator]()
  const readLine = async (): Promise<string | null> => {
    const { value, done } = await iterator.next()
    return done ? null : (value as string)
  }

  async function ask(key: SettingKey, label: string, opts: AskOpts = {}): Promise<string | number> {
    const { number = false, min = 0, max = Infinity, integer = false } = opts
    const flagValue = flags[key]
    if (typeof flagValue === 'string') {
      return number ? Number(flagValue) : flagValue
    }
    if (flags.yes) {
      return DEFAULTS[key]
    }
    stdout.write(`${label} [${DEFAULTS[key]}]: `)
    const line = await readLine()
    const raw = line === null ? '' : line.trim()
    if (raw === '') {
      return DEFAULTS[key]
    }
    if (!number) {
      return raw
    }
    const n = Number(raw)
    if (!Number.isFinite(n) || n < min || n > max) {
      stdout.write(`  ✖ enter a number between ${min} and ${max}\n`)
      return ask(key, label, opts) // invalid → ask again
    }
    return integer ? Math.round(n) : n
  }

  return { ask, close: () => rl.close() }
}

async function main(): Promise<void> {
  const flags = parseArgs(argv.slice(2))
  const { ask, close } = createPrompter(flags)

  console.log('\n📄  File Vault — CSV generator\n')

  const videosDir = String(await ask('videos', 'Videos folder to scan'))
  const videoFiles = await scanVideos(videosDir)
  if (videoFiles.length === 0) {
    console.log(`\n⚠  No video files found in "${videosDir}". Drop some videos there first`)
    console.log(`   (looked for: ${VIDEO_EXTENSIONS.join(', ')}).\n`)
    close()
    exit(1)
  }
  console.log(`\n✔  Found ${videoFiles.length} video file(s) in ${videosDir}\n`)

  const rows = Number(await ask('rows', 'Total rows', { number: true, min: 1, integer: true }))
  const pctNotFound = Number(await ask('not-found', '% of rows that are FILE NOT FOUND', { number: true, min: 0, max: 100 }))
  const pctNonVideo = Number(await ask('non-video', '% of rows that are NON-VIDEO (ignored)', { number: true, min: 0, max: 100 }))

  if (pctNotFound + pctNonVideo > 100) {
    console.log(`\n✖  file-not-found (${pctNotFound}%) + non-video (${pctNonVideo}%) exceeds 100%.\n`)
    close()
    exit(1)
  }

  const outPath = String(await ask('out', 'Output CSV path'))
  close()

  const notFound = Math.round(rows * (pctNotFound / 100))
  const nonVideo = Math.round(rows * (pctNonVideo / 100))
  const valid = rows - notFound - nonVideo

  const allRows = buildRows({ videosDir, videoFiles, notFound, nonVideo, valid })
  await writeFile(path.resolve(outPath), toCsv(allRows), 'utf8')

  console.log('\n─────────────────────────────────────────')
  console.log(`  ✔ Wrote ${allRows.length.toLocaleString()} rows → ${outPath}`)
  console.log('  ┌')
  console.log(`  │ valid videos    ${String(valid).padStart(6)}  (${(100 - pctNotFound - pctNonVideo).toFixed(0)}%)`)
  console.log(`  │ file-not-found  ${String(notFound).padStart(6)}  (${pctNotFound}%)`)
  console.log(`  │ non-video       ${String(nonVideo).padStart(6)}  (${pctNonVideo}%)`)
  console.log('  └')
  console.log('─────────────────────────────────────────\n')
}

main().catch((err) => {
  console.error(err)
  exit(1)
})
