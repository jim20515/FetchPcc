<script setup lang="ts">
const { data, pending } = await useFetch('/api/pcc/tenders', { query: { page: 1 } })
const total = computed(() => data.value?.total ?? 0)
const latest = computed(() => (data.value?.data ?? []).slice(0, 5))
</script>

<template>
  <div class="space-y-6">
    <!-- 統計卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <p class="text-xs font-medium text-slate-500 mb-1">等標期內標案</p>
        <p class="text-3xl font-bold text-indigo-600">{{ pending ? '…' : total.toLocaleString() }}</p>
        <p class="text-xs text-slate-400 mt-1">勞務類 842</p>
      </div>
      <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <p class="text-xs font-medium text-slate-500 mb-1">資料來源</p>
        <p class="text-lg font-semibold text-slate-700">政府電子採購網</p>
        <p class="text-xs text-slate-400 mt-1">web.pcc.gov.tw</p>
      </div>
      <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <p class="text-xs font-medium text-slate-500 mb-1">更新時間</p>
        <p class="text-lg font-semibold text-slate-700">即時撈取</p>
        <p class="text-xs text-slate-400 mt-1">每次開啟頁面自動更新</p>
      </div>
    </div>

    <!-- 最新標案預覽 -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 class="text-sm font-semibold text-slate-800">最新標案</h2>
        <NuxtLink to="/tenders" class="text-xs text-indigo-600 hover:underline">查看全部</NuxtLink>
      </div>
      <div v-if="pending" class="px-5 py-8 text-center text-slate-400 text-sm">載入中…</div>
      <ul v-else class="divide-y divide-slate-50">
        <li v-for="t in latest" :key="t.tenderNo" class="px-5 py-3.5 hover:bg-slate-50 transition">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <a
                v-if="t.detailUrl"
                :href="`https://web.pcc.gov.tw${t.detailUrl}`"
                target="_blank"
                class="text-sm font-medium text-slate-800 hover:text-indigo-600 transition truncate block"
              >{{ t.tenderName }}</a>
              <span v-else class="text-sm font-medium text-slate-800 truncate block">{{ t.tenderName }}</span>
              <p class="text-xs text-slate-400 mt-0.5">{{ t.agencyName }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-xs font-medium text-slate-600">{{ t.budget }}</p>
              <p class="text-xs text-slate-400 mt-0.5">截止 {{ t.deadline }}</p>
            </div>
          </div>
        </li>
        <li v-if="!latest.length" class="px-5 py-8 text-center text-slate-400 text-sm">目前沒有資料</li>
      </ul>
    </div>
  </div>
</template>
