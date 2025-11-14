<script setup lang="ts">
import PlaceholderCard from '@/components/PlaceholderCard.vue'
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-foreground mb-2">Dashboard</h2>
      <p class="text-muted-foreground">Welcome to your dashboard</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <PlaceholderCard
        title="Analytics"
        description="View your project statistics and insights"
      />

      <PlaceholderCard
        title="Recent Activity"
        description="See what's been happening recently"
      />

      <PlaceholderCard
        title="Quick Actions"
        description="Frequently used actions and shortcuts"
      />

      <PlaceholderCard
        title="Notifications"
        description="Stay up to date with your projects"
      />
    </div>
  </div>
</template>
