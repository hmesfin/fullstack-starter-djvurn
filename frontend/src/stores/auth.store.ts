/**
 * Authentication Store
 *
 * Global state management for user authentication with Pinia
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/api/types.gen'
import { hasTokens, clearTokens } from '@/lib/token-storage'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isAuthenticated = ref<boolean>(hasTokens())
  const isLoading = ref<boolean>(false)

  // Computed
  const userName = computed(() => {
    if (!user.value) return null
    return `${user.value.first_name} ${user.value.last_name}`.trim()
  })

  const userInitials = computed(() => {
    if (!user.value) return null
    const firstInitial = user.value.first_name.charAt(0).toUpperCase()
    const lastInitial = user.value.last_name.charAt(0).toUpperCase()
    return `${firstInitial}${lastInitial}`
  })

  // Actions
  function setUser(userData: User): void {
    user.value = userData
    isAuthenticated.value = true
  }

  function setLoading(loading: boolean): void {
    isLoading.value = loading
  }

  function logout(): void {
    user.value = null
    isAuthenticated.value = false
    clearTokens()
  }

  function clearUser(): void {
    user.value = null
    isAuthenticated.value = false
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    // Computed
    userName,
    userInitials,
    // Actions
    setUser,
    setLoading,
    logout,
    clearUser,
  }
})
