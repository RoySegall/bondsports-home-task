import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppLayout } from './components/AppLayout'
import Router from "./views/Router";

// Cell-level fetching: no retries (surface the mock's ~10% failures for manual retry),
// and staleTime Infinity since path-derived metadata never changes.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      gcTime: 5 * 60_000,
    },
  },
})

// Composition root: provides React Query, then routes on the store's view.
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <Router />
      </AppLayout>
    </QueryClientProvider>
  )
}
