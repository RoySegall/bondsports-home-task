import { useMutation } from '@tanstack/react-query'
import { useAppStore } from '../States/useAppStore'
import { isVideoPath } from '../../shared/types'
import { pickCsvFile } from './fileVaultApi'
import { parseCsvPaths } from './csv'

// Import as a mutation: pick a CSV over IPC, then load the video paths into the
// store. Exposes isPending/isError to the button for free.
export function useImportCsv() {
  const setFilePaths = useAppStore((state) => state.setFilePaths)

  return useMutation({
    mutationFn: pickCsvFile,
    onSuccess: (text) => {
      if (text === null) {
        return
      }
      setFilePaths(parseCsvPaths(text).filter(isVideoPath))
    },
  })
}
