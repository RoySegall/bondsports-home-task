import type { ReactNode } from 'react'
import { Topbar } from '../Topbar'
import styles from './AppLayout.module.css'

// Persistent chrome: fixed topbar over a scrolling content column.
export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.layout}>
      <Topbar />
      <main className={styles.content}>{children}</main>
    </div>
  )
}
