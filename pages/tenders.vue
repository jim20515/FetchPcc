<script setup lang="ts">
const page = ref(1)
const { data, pending, error } = await useFetch('/api/pcc/tenders', {
  query: { page },
  watch: [page],
})
const tenders = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / 10))
</script>

<template>
  <div class="space-y-4">
    <!-- 頁首資訊 -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-slate-500">
        共 <span class="font-semibold text-slate-800">{{ total.toLocaleString() }}</span> 筆標案
      </p>
      <span class="text-xs text-slate-400">第 {{ page }} / {{ totalPages }} 頁</span>
    </div>

    <!-- 錯誤提示 -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600">
      {{ error.message }}
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div v-if="pending" class="px-5 py-12 text-center text-slate-400 text-sm">載入中…</div>
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="text-left px-5 py-3 text-xs font-medium text-slate-500">機關名稱</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-slate-500">標案名稱</th>
            <th class="text-center px-4 py-3 text-xs font-medium text-slate-500 hidden md:table-cell">招標方式</th>
            <th class="text-center px-4 py-3 text-xs font-medium text-slate-500 hidden lg:table-cell">公告日期</th>
            <th class="text-center px-4 py-3 text-xs font-medium text-slate-500">截止投標</th>
            <th class="text-right px-5 py-3 text-xs font-medium text-slate-500 hidden sm:table-cell">預算金額</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="t in tenders" :key="t.tenderNo" class="hover:bg-slate-50/50 transition">
            <td class="px-5 py-3 text-xs text-slate-500 max-w-32 truncate">{{ t.agencyName }}</td>
            <td class="px-4 py-3 max-w-xs">
              <a
                v-if="t.detailUrl"
                :href="`https://web.pcc.gov.tw${t.detailUrl}`"
                target="_blank"
                class="text-slate-800 font-medium hover:text-indigo-600 transition line-clamp-2"
              >{{ t.tenderName }}</a>
              <span v-else class="text-slate-800 font-medium">{{ t.tenderName }}</span>
            </td>
            <td class="px-4 py-3 text-center hidden md:table-cell">
              <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
                {{ t.method || '—' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center text-xs text-slate-500 hidden lg:table-cell">{{ t.publishDate || '—' }}</td>
            <td class="px-4 py-3 text-center text-xs font-medium text-slate-700">{{ t.deadline || '—' }}</td>
            <td class="px-5 py-3 text-right text-xs text-slate-600 hidden sm:table-cell">{{ t.budget || '—' }}</td>
          </tr>
          <tr v-if="!tenders.length">
            <td colspan="6" class="px-5 py-12 text-center text-slate-400 text-sm">目前沒有資料</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分頁 -->
    <div class="flex items-center justify-center gap-2">
      <button
        :disabled="page <= 1 || pending"
        @click="page--"
        class="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >上一頁</button>
      <span class="text-sm text-slate-500 px-2">第 {{ page }} 頁</span>
      <button
        :disabled="page >= totalPages || pending"
        @click="page++"
        class="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >下一頁</button>
    </div>
  </div>
</template>
