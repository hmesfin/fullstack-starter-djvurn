<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ProjectList from '@/components/projects/ProjectList.vue'
</script>

<template>
  <DashboardLayout>
    <template #header>
      Projects
    </template>

    <ProjectList />
  </DashboardLayout>
</template>
