'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:            30_000,
            refetchOnWindowFocus: true,
            retry:                1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background:   '#10101e',
            border:       '1px solid #252540',
            color:        '#f1f5f9',
            fontFamily:   "'DM Sans', sans-serif",
            fontSize:     '13px',
          },
        }}
      />
    </QueryClientProvider>
  )
}
