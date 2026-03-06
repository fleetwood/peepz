<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div class="h-screen flex bg-page text-page-foreground">
    <PeepsSidebar />

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-6">
      <slot />
    </main>
  </div>
</template>
