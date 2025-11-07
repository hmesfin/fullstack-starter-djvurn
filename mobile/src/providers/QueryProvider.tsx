/**
 * React Query provider with offline support and persistence
 * Wraps the app with QueryClientProvider and initializes network monitoring
 */

import React, { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, asyncStoragePersister } from '@/services/query-client'
import { useNetworkState } from '@/hooks/useNetworkState'

interface QueryProviderProps {
  /** Child components */
  children: React.ReactNode
  /** Whether to enable persistence (default: true) */
  enablePersistence?: boolean
}

/**
 * Inner component to initialize network monitoring
 * Separated so it can use hooks while being inside QueryClientProvider
 */
function NetworkMonitor(): null {
  // Initialize network state monitoring
  // This hook syncs device network state with TanStack Query's online manager
  useNetworkState()

  return null
}

/**
 * Query provider component with offline support
 * Use this to wrap your app root
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <QueryProvider>
 *       <YourApp />
 *     </QueryProvider>
 *   )
 * }
 * ```
 */
export function QueryProvider({
  children,
  enablePersistence = true,
}: QueryProviderProps): React.ReactElement {
  if (enablePersistence) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: asyncStoragePersister,
          // Max age: 24 hours (same as gcTime)
          maxAge: 24 * 60 * 60 * 1000,
        }}
      >
        <NetworkMonitor />
        {children}
      </PersistQueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NetworkMonitor />
      {children}
    </QueryClientProvider>
  )
}
