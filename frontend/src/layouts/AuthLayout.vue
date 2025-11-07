<script setup lang="ts">
/**
 * AuthLayout - Centered card layout for authentication pages
 *
 * Features:
 * - Purple gradient background
 * - Centered card container
 * - Responsive padding
 * - Slot for auth form content
 */
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700 p-4">
    <div class="bg-card rounded-lg shadow-xl w-full max-w-md">
      <slot />
    </div>
  </div>
</template>
