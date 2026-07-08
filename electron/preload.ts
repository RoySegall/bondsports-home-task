import { contextBridge, ipcRenderer } from 'electron'
import type { FileVaultApi } from '../shared/types'

// Minimal, typed surface exposed to the renderer over IPC.
const api: FileVaultApi = {
  pickCsvFile: () => ipcRenderer.invoke('vault:pick-csv-file'),
  getFileMetadata: (filePath) => ipcRenderer.invoke('vault:get-file-metadata', filePath),
}

contextBridge.exposeInMainWorld('fileVaultApi', api)
