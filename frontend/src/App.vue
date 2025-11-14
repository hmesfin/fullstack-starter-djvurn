<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

// Initialize auth on app load (fetch user data if tokens exist)
const { initAuth } = useAuth()

onMounted(async () => {
  await initAuth()
})
</script>

<template>
  <router-view />
</template>
