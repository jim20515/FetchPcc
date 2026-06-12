<script setup lang="ts">
const route = useRoute()
const emit = defineEmits(['menu'])

const titleMap: Record<string, string> = {
  '/':        '總覽儀表板',
  '/tenders': '標案列表',
}

const pageTitle = computed(() => titleMap[route.path] ?? '採購標案')
const today = computed(() =>
  new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
)
</script>

<template>
  <header class="bg-white border-b border-slate-200 px-4 md:px-6">
    <div class="h-14 flex items-center justify-between">
      <div class="flex items-center gap-3 min-w-0">
        <button @click="emit('menu')"
          class="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div class="min-w-0">
          <h1 class="text-base font-semibold text-slate-800 truncate">{{ pageTitle }}</h1>
          <p class="text-xs text-slate-400 hidden sm:block">{{ today }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span class="text-xs text-slate-400 hidden sm:block">勞務類 842 · 等標期內</span>
      </div>
    </div>
  </header>
</template>
