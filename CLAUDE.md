# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`file-vault` is an **Electron desktop app** (renderer = React 18 + TypeScript, bundled by Vite 5). It was scaffolded from the `electron-vite-react` template and, as of now, the renderer (`src/App.tsx`) is still the template's default counter demo — the actual file-vault feature code has not been written yet. `@tanstack/react-query` and `@tanstack/react-virtual` are installed but unused, signalling the intended direction: data-fetching + virtualized lists for large file collections.

## Commands

- `npm run dev` — Vite dev server **and** launches the Electron window (the `vite-plugin-electron` plugin rebuilds `electron/main.ts` + `preload.ts` and relaunches on change). This is the normal way to develop; do not run `vite` and Electron separately.
- `npm run build` — full production pipeline: `tsc` (typecheck only, `noEmit`) → `vite build` → `electron-builder` (packages installers into `release/${version}`).
- `npm run lint` — ESLint over `.ts`/`.tsx`, `--max-warnings 0` (any warning fails).
- `npm run preview` — serve the built renderer without Electron.

Tests run with **Vitest** — `npm test` (once) or `npm run test:watch`. Tests live beside their subject as `*.test.ts` / `*.test.tsx`; pure logic and store/`useLibrary` tests run in Node, the one router test opts into jsdom.

This **is** a git repository.

## Architecture: three Electron contexts, one Vite build

A single `vite.config.ts` drives all three Electron contexts through `vite-plugin-electron/simple`:

| Context | Source | Build output | Role |
|---|---|---|---|
| Main | `electron/main.ts` | `dist-electron/main.js` (the `main` field in `package.json`) | Node process, owns `BrowserWindow`, app lifecycle |
| Preload | `electron/preload.ts` | `dist-electron/preload.mjs` | Bridge, runs with Node access before renderer scripts |
| Renderer | `src/` (entry `src/main.tsx` → `index.html`) | `dist/` | The React UI, no direct Node access |

**IPC bridge.** The renderer has no Node integration. `preload.ts` uses `contextBridge` to expose a `window.ipcRenderer` object (`on`/`off`/`send`/`invoke`) — that is the only channel between UI and main process. Its type is declared in `electron/electron-env.d.ts` (which augments the global `Window` interface). New main↔renderer communication goes through this bridge: add an `ipcMain.handle`/`.on` in `main.ts`, call it via `window.ipcRenderer.invoke`/`.send` in the renderer. There is currently one demo channel, `main-process-message` (main → renderer on window load, logged in `src/main.tsx`).

**Dev vs. packaged runtime.** `main.ts` branches on `process.env.VITE_DEV_SERVER_URL`: in dev it `loadURL`s the Vite server; when packaged it `loadFile`s `dist/index.html`. `VITE_PUBLIC` similarly points at `public/` in dev and `dist/` in prod. Keep this branch intact when touching window creation — breaking it breaks either dev HMR or the packaged app.

## TypeScript setup

Project references: `tsconfig.json` compiles both `src` and `electron` (bundler module resolution, `allowImportingTsExtensions`, `noEmit` — Vite/esbuild does the actual transpile) and references `tsconfig.node.json` for the Vite/Node config files. `strict`, `noUnusedLocals`, and `noUnusedParameters` are on, so unused imports/vars are hard errors under `tsc`, not just lint warnings.

## Packaging

`electron-builder.json5` defines installers (mac `dmg`, win `nsis`, linux `AppImage`). Note `appId` and `productName` are still placeholders (`"YourAppID"` / `"YourAppName"`) — set real values before shipping a build.
