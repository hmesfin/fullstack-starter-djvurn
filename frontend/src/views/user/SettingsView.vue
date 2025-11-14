<script setup lang="ts">
import PlaceholderCard from '@/components/PlaceholderCard.vue'
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-foreground mb-2">Settings</h2>
      <p class="text-muted-foreground">Manage your account settings and preferences</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <PlaceholderCard
        title="Profile Settings"
        description="Update your personal information and preferences"
      />

      <PlaceholderCard
        title="Account Security"
        description="Set up two-factor authentication and manage your security settings"
      />

      <PlaceholderCard
        title="Notification Preferences"
        description="Manage your notification settings and preferences"
      />

      <PlaceholderCard
        title="Connected Accounts"
        description="Manage your connected social and third-party accounts"
      />
    </div>
  </div>
</template>
