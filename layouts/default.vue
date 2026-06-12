<script setup lang="ts">
const route = useRoute()
const sidebarOpen = ref(false)
watch(route, () => { sidebarOpen.value = false })
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex">
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/40 z-30 md:hidden" @click="sidebarOpen = false" />
    <LayoutSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="md:ml-60 flex-1 flex flex-col min-h-screen overflow-x-hidden">
      <LayoutAppHeader @menu="sidebarOpen = true" />
      <main class="flex-1 p-4 md:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
