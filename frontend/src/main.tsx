import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'

// Unregister any active service workers in development to prevent caching issues
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then((unregistered) => {
        if (unregistered) {
          console.log('Successfully unregistered service worker');
          window.location.reload();
        }
      });
    }
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      // Data is considered fresh for 5 minutes — navigating between pages
      // (Home ↔ Map ↔ ID) will NOT re-fetch while data is fresh.
      staleTime: 5 * 60_000,
      // Keep unused query data in memory for 10 minutes so coming back
      // to a page shows the cached result instantly.
      gcTime: 10 * 60_000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
