<script setup lang="ts">
import type { AvatarImageProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { AvatarImage } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<AvatarImageProps & { class?: HTMLAttributes['class'] }>(),
  {}
)
</script>

<template>
  <AvatarImage :class="cn('aspect-square h-full w-full', props.class)" v-bind="props" />
</template>
