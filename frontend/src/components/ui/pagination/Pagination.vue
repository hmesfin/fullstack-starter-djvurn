<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  isLoading?: boolean
}

const props = withDefaults(defineProps<PaginationProps>(), {
  isLoading: false,
})

const emit = defineEmits<{
  'update:page': [page: number]
}>()

// Compute page range to show
const pageRange = computed(() => {
  const range: number[] = []
  const { currentPage, totalPages } = props

  // Show up to 5 page numbers
  const maxButtons = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2))
  const endPage = Math.min(totalPages, startPage + maxButtons - 1)

  // Adjust start if we're near the end
  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    range.push(i)
  }

  return range
})

const firstPage = computed(() => pageRange.value[0])
const lastPage = computed(() => pageRange.value[pageRange.value.length - 1])

// Calculate item range for current page
const itemRange = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize + 1
  const end = Math.min(props.currentPage * props.pageSize, props.totalCount)
  return { start, end }
})

function goToPage(page: number): void {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:page', page)
  }
}
</script>

<template>
  <div
    v-if="totalPages > 1"
    class="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4"
  >
    <!-- Item count -->
    <div class="text-sm text-muted-foreground">
      Showing <strong>{{ itemRange.start }}</strong> to <strong>{{ itemRange.end }}</strong> of
      <strong>{{ totalCount }}</strong> results
    </div>

    <!-- Pagination controls -->
    <div class="flex items-center gap-2">
      <!-- Previous button -->
      <Button
        variant="outline"
        size="sm"
        :disabled="currentPage === 1 || isLoading"
        @click="goToPage(currentPage - 1)"
      >
        <ChevronLeft class="h-4 w-4 mr-1" />
        Previous
      </Button>

      <!-- Page numbers -->
      <div class="hidden sm:flex items-center gap-1">
        <!-- First page if not in range -->
        <Button
          v-if="firstPage !== undefined && firstPage > 1"
          variant="outline"
          size="sm"
          :disabled="isLoading"
          @click="goToPage(1)"
        >
          1
        </Button>
        <span v-if="firstPage !== undefined && firstPage > 2" class="px-2 text-muted-foreground">...</span>

        <!-- Page range buttons -->
        <Button
          v-for="page in pageRange"
          :key="page"
          :variant="page === currentPage ? 'default' : 'outline'"
          size="sm"
          :disabled="isLoading"
          @click="goToPage(page)"
        >
          {{ page }}
        </Button>

        <!-- Last page if not in range -->
        <span
          v-if="lastPage !== undefined && lastPage < totalPages - 1"
          class="px-2 text-muted-foreground"
        >
          ...
        </span>
        <Button
          v-if="lastPage !== undefined && lastPage < totalPages"
          variant="outline"
          size="sm"
          :disabled="isLoading"
          @click="goToPage(totalPages)"
        >
          {{ totalPages }}
        </Button>
      </div>

      <!-- Next button -->
      <Button
        variant="outline"
        size="sm"
        :disabled="currentPage === totalPages || isLoading"
        @click="goToPage(currentPage + 1)"
      >
        Next
        <ChevronRight class="h-4 w-4 ml-1" />
      </Button>
    </div>
  </div>
</template>
