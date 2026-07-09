import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isVideoPath } from '../../shared/types'
import { pickCsvFile } from './fileVaultApi'
import { parseCsvPaths } from './csv'
import { LIBRARY_KEY } from './useLibrary'

// Import as a mutation: pick a CSV over IPC, then drop the parsed video paths into
// the React Query cache. RQ is the data layer — the list waterfalls from there into
// the store (see useLibraryWaterfall). Exposes isPending/isError to the button.
export function useImportCsv() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: pickCsvFile,
    onSuccess: (text) => {
      if (text === null) {
        return
      }
      queryClient.setQueryData(LIBRARY_KEY, parseCsvPaths(text).filter(isVideoPath))
    },
  })
}
