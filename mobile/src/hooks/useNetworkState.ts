/**
 * Network state management hook with TanStack Query integration
 * Syncs device network state with TanStack Query's online manager
 */

import { useEffect, useState } from 'react'
import NetInfo, { NetInfoState } from '@react-native-community/netinfo'
import { onlineManager } from '@tanstack/react-query'

/**
 * Network state type
 */
export interface NetworkState {
  /** Whether the device is connected to a network */
  isConnected: boolean | null
  /** Whether the network has internet access */
  isInternetReachable: boolean | null
  /** Network connection type (wifi, cellular, none, etc.) */
  type: string | null
}

/**
 * Hook to monitor network connectivity and sync with TanStack Query
 * @returns Current network state
 */
export function useNetworkState(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: null,
    isInternetReachable: null,
    type: null,
  })

  useEffect(() => {
    // Fetch initial network state
    NetInfo.fetch().then((state: NetInfoState) => {
      updateNetworkState(state)
    })

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      updateNetworkState(state)
    })

    // Cleanup on unmount
    return () => {
      unsubscribe()
    }
  }, [])

  /**
   * Updates network state and syncs with TanStack Query online manager
   */
  function updateNetworkState(state: NetInfoState): void {
    const isConnected = state.isConnected ?? false
    const isInternetReachable = state.isInternetReachable ?? false
    const type = state.type ?? 'unknown'

    // Update local state
    setNetworkState({
      isConnected,
      isInternetReachable,
      type,
    })

    // Sync with TanStack Query online manager
    // Device is online if connected AND internet is reachable
    const isOnline = isConnected && isInternetReachable
    onlineManager.setOnline(isOnline)
  }

  return networkState
}
