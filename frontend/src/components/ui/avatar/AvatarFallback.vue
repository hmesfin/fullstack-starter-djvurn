<script setup lang="ts">
import type { AvatarFallbackProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { AvatarFallback } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<AvatarFallbackProps & { class?: HTMLAttributes['class'] }>(),
  {}
)
</script>

<template>
  <AvatarFallback
    :class="
      cn('flex h-full w-full items-center justify-center rounded-full bg-muted', props.class)
    "
    v-bind="props"
  >
    <slot />
  </AvatarFallback>
</template>
