import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './style.css'

import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'

import { App } from '@/app'
import { queryClient } from '@/lib/query-client'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error("Root element with ID 'root' not found.")
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />

      <TanStackDevtools
        plugins={[
          {
            name: 'Tanstack Query',
            render: <ReactQueryDevtoolsPanel />,
          },
        ]}
      />
    </QueryClientProvider>
  </StrictMode>,
)
