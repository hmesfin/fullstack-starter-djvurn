/**
 * Tests for network state management hook
 * Following TDD: RED phase - these tests will fail until implementation exists
 */

import { renderHook, waitFor } from '@testing-library/react-native'
import NetInfo from '@react-native-community/netinfo'
import { onlineManager } from '@tanstack/react-query'
import { useNetworkState } from '../useNetworkState'

// Mock NetInfo
jest.mock('@react-native-community/netinfo')

// Mock TanStack Query online manager
jest.mock('@tanstack/react-query', () => ({
  onlineManager: {
    setOnline: jest.fn(),
    setEventListener: jest.fn(),
  },
}))

describe('useNetworkState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Hook Initialization', () => {
    it('should return initial network state', () => {
      const mockNetInfo = {
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      }

      ;(NetInfo.fetch as jest.Mock).mockResolvedValue(mockNetInfo)

      const { result } = renderHook(() => useNetworkState())

      expect(result.current).toBeDefined()
      expect(result.current.isConnected).toBeDefined()
      expect(result.current.isInternetReachable).toBeDefined()
    })

    it('should fetch network state on mount', async () => {
      const mockNetInfo = {
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      }

      ;(NetInfo.fetch as jest.Mock).mockResolvedValue(mockNetInfo)

      renderHook(() => useNetworkState())

      await waitFor(() => {
        expect(NetInfo.fetch).toHaveBeenCalled()
      })
    })
  })

  describe('Network State Updates', () => {
    it('should update state when network becomes available', async () => {
      const initialState = {
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      }

      const updatedState = {
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      }

      ;(NetInfo.fetch as jest.Mock).mockResolvedValue(initialState)
      let listener: ((state: any) => void) | undefined
      ;(NetInfo.addEventListener as jest.Mock).mockImplementation((callback: any) => {
        listener = callback
        return jest.fn() // unsubscribe function
      })

      const { result } = renderHook(() => useNetworkState())

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.isConnected).toBe(false)
      })

      // Simulate network change
      if (listener) {
        listener(updatedState)
      }

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })
    })

    it('should update state when network becomes unavailable', async () => {
      const initialState = {
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      }

      const updatedState = {
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      }

      ;(NetInfo.fetch as jest.Mock).mockResolvedValue(initialState)
      let listener: ((state: any) => void) | undefined
      ;(NetInfo.addEventListener as jest.Mock).mockImplementation((callback: any) => {
        listener = callback
        return jest.fn() // unsubscribe function
      })

      const { result } = renderHook(() => useNetworkState())

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })

      // Simulate network change
      if (listener) {
        listener(updatedState)
      }

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false)
      })
    })
  })

  describe('TanStack Query Integration', () => {
    it('should sync network state with TanStack Query onlineManager', async () => {
      const mockNetInfo = {
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      }

      ;(NetInfo.fetch as jest.Mock).mockResolvedValue(mockNetInfo)

      renderHook(() => useNetworkState())

      await waitFor(() => {
        expect(onlineManager.setOnline).toHaveBeenCalledWith(true)
      })
    })

    it('should set offline when network is disconnected', async () => {
      const mockNetInfo = {
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      }

      ;(NetInfo.fetch as jest.Mock).mockResolvedValue(mockNetInfo)

      renderHook(() => useNetworkState())

      await waitFor(() => {
        expect(onlineManager.setOnline).toHaveBeenCalledWith(false)
      })
    })

    it('should set offline when internet is not reachable', async () => {
      const mockNetInfo = {
        isConnected: true,
        isInternetReachable: false,
        type: 'wifi',
      }

      ;(NetInfo.fetch as jest.Mock).mockResolvedValue(mockNetInfo)

      renderHook(() => useNetworkState())

      await waitFor(() => {
        expect(onlineManager.setOnline).toHaveBeenCalledWith(false)
      })
    })
  })

  describe('Cleanup', () => {
    it('should unsubscribe from NetInfo on unmount', () => {
      const unsubscribe = jest.fn()
      ;(NetInfo.addEventListener as jest.Mock).mockReturnValue(unsubscribe)
      ;(NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      })

      const { unmount } = renderHook(() => useNetworkState())

      unmount()

      expect(unsubscribe).toHaveBeenCalled()
    })
  })

  describe('Network Type Detection', () => {
    it('should return network type (wifi)', async () => {
      const mockNetInfo = {
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      }

      ;(NetInfo.fetch as jest.Mock).mockResolvedValue(mockNetInfo)

      const { result } = renderHook(() => useNetworkState())

      await waitFor(() => {
        expect(result.current.type).toBe('wifi')
      })
    })

    it('should return network type (cellular)', async () => {
      const mockNetInfo = {
        isConnected: true,
        isInternetReachable: true,
        type: 'cellular',
      }

      ;(NetInfo.fetch as jest.Mock).mockResolvedValue(mockNetInfo)

      const { result } = renderHook(() => useNetworkState())

      await waitFor(() => {
        expect(result.current.type).toBe('cellular')
      })
    })

    it('should return network type (none) when offline', async () => {
      const mockNetInfo = {
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      }

      ;(NetInfo.fetch as jest.Mock).mockResolvedValue(mockNetInfo)

      const { result } = renderHook(() => useNetworkState())

      await waitFor(() => {
        expect(result.current.type).toBe('none')
      })
    })
  })
})
