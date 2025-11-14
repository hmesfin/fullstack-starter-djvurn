<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Construction } from 'lucide-vue-next'

interface PlaceholderCardProps {
  title?: string
  description?: string
}

withDefaults(defineProps<PlaceholderCardProps>(), {
  title: 'Coming Soon',
  description: 'This feature is under development',
})
</script>

<template>
  <Card class="border-dashed">
    <CardHeader>
      <div class="flex items-center gap-3">
        <Construction class="h-8 w-8 text-muted-foreground" />
        <div>
          <CardTitle>{{ title }}</CardTitle>
          <CardDescription>{{ description }}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <slot>
        <p class="text-sm text-muted-foreground">
          This section will be available in a future update.
        </p>
      </slot>
    </CardContent>
  </Card>
</template>
