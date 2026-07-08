import { FileVideo, Upload } from 'lucide-react'
import { Button } from '../../components/Button'
import { useImportCsv } from '../../lib/useImportCsv'
import styles from './EmptyState.module.css'

export function EmptyState() {
  const importCsv = useImportCsv()

  return (
    <div className={styles.empty}>
      <div className={styles.icon} aria-hidden>
        <FileVideo size={40} strokeWidth={1.5} />
      </div>

      <h2 className={styles.title}>Your vault is empty</h2>
      <p className={styles.desc}>
        Import a CSV of local file paths to browse your videos in a fast, virtualized grid.
        Non-video paths are ignored automatically.
      </p>

      <Button onClick={() => importCsv.mutate()} disabled={importCsv.isPending}>
        <Upload size={16} strokeWidth={2.25} aria-hidden />
        {importCsv.isPending ? 'Importing…' : 'Import CSV'}
      </Button>

      <p className={styles.hint}>One file path per row — non-video rows are skipped.</p>
    </div>
  )
}
