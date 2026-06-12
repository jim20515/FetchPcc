<script setup lang="ts">
type SortField = 'publish_date' | 'deadline' | 'budget' | 'agency_name'

const page = ref(1)
const sortField = ref<SortField>('publish_date')
const sortOrder = ref<'asc' | 'desc'>('desc')

const { data, pending, error } = await useFetch('/api/pcc/tenders', {
  query: { page, sortField, sortOrder },
  watch: [page, sortField, sortOrder],
})
const tenders = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / 10))

function toggleSort(field: SortField) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'desc'
  }
  page.value = 1
}

function sortIcon(field: SortField) {
  if (sortField.value !== field) return '↕'
  return sortOrder.value === 'desc' ? '↓' : '↑'
}

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  page.value = p
}
</script>

<template>
  <div class="space-y-5">
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">

      <!-- 表頭 -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 class="text-sm font-semibold text-slate-800">標案列表</h3>
        <p class="text-xs text-slate-400">共 {{ total.toLocaleString() }} 筆</p>
      </div>

      <!-- 錯誤 -->
      <div v-if="error" class="px-5 py-4 text-sm text-red-600 bg-red-50">{{ error.message }}</div>

      <!-- 載入中 -->
      <div v-if="pending" class="py-12 text-center text-sm text-slate-400">載入中…</div>

      <!-- 表格 -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 cursor-pointer select-none hover:text-indigo-600"
                @click="toggleSort('agency_name')">
                機關名稱
                <span class="ml-1 opacity-50">{{ sortIcon('agency_name') }}</span>
              </th>
              <th class="text-left px-4 py-3 text-xs font-medium text-slate-500">標案名稱</th>
              <th class="text-center px-4 py-3 text-xs font-medium text-slate-500 hidden md:table-cell">招標方式</th>
              <th class="text-center px-4 py-3 text-xs font-medium text-slate-500 hidden lg:table-cell cursor-pointer select-none hover:text-indigo-600"
                @click="toggleSort('publish_date')">
                公告日期
                <span class="ml-1" :class="sortField === 'publish_date' ? 'text-indigo-500' : 'opacity-50'">{{ sortIcon('publish_date') }}</span>
              </th>
              <th class="text-center px-4 py-3 text-xs font-medium text-slate-500 cursor-pointer select-none hover:text-indigo-600"
                @click="toggleSort('deadline')">
                截止投標
                <span class="ml-1" :class="sortField === 'deadline' ? 'text-indigo-500' : 'opacity-50'">{{ sortIcon('deadline') }}</span>
              </th>
              <th class="text-right px-5 py-3 text-xs font-medium text-slate-500 hidden sm:table-cell cursor-pointer select-none hover:text-indigo-600"
                @click="toggleSort('budget')">
                預算金額
                <span class="ml-1" :class="sortField === 'budget' ? 'text-indigo-500' : 'opacity-50'">{{ sortIcon('budget') }}</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="t in tenders" :key="t.tenderNo + t.publishDate"
              class="hover:bg-slate-50/50 transition">
              <td class="px-5 py-3.5 text-xs text-slate-500 max-w-32 truncate">{{ t.agencyName }}</td>
              <td class="px-4 py-3.5 max-w-xs">
                <a v-if="t.detailUrl"
                  :href="`https://web.pcc.gov.tw${t.detailUrl}`"
                  target="_blank"
                  class="font-medium text-slate-800 hover:text-indigo-600 transition line-clamp-2">
                  {{ t.tenderName }}
                </a>
                <span v-else class="font-medium text-slate-800">{{ t.tenderName }}</span>
              </td>
              <td class="px-4 py-3.5 text-center hidden md:table-cell">
                <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
                  {{ t.method || '—' }}
                </span>
              </td>
              <td class="px-4 py-3.5 text-center text-xs text-slate-500 hidden lg:table-cell">{{ t.publishDate || '—' }}</td>
              <td class="px-4 py-3.5 text-center text-xs font-medium text-slate-700">{{ t.deadline || '—' }}</td>
              <td class="px-5 py-3.5 text-right text-xs text-slate-600 hidden sm:table-cell">{{ t.budget || '—' }}</td>
            </tr>
            <tr v-if="!tenders.length">
              <td colspan="6" class="px-5 py-12 text-center text-slate-400 text-sm">目前沒有資料</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁 -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-5 py-3 border-t border-slate-100">
        <p class="text-xs text-slate-400">共 {{ total.toLocaleString() }} 筆，第 {{ page }} / {{ totalPages }} 頁</p>
        <div class="flex items-center gap-1">
          <button @click="goPage(1)" :disabled="page === 1"
            class="px-2 py-1 text-xs rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition">«</button>
          <button @click="goPage(page - 1)" :disabled="page === 1"
            class="px-2 py-1 text-xs rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition">‹</button>
          <template v-for="p in totalPages" :key="p">
            <button v-if="Math.abs(p - page) <= 2 || p === 1 || p === totalPages"
              @click="goPage(p)"
              class="px-3 py-1 text-xs rounded-lg transition font-medium"
              :class="p === page ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'">
              {{ p }}
            </button>
            <span v-else-if="Math.abs(p - page) === 3" class="px-1 text-slate-300 text-xs">…</span>
          </template>
          <button @click="goPage(page + 1)" :disabled="page === totalPages"
            class="px-2 py-1 text-xs rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition">›</button>
          <button @click="goPage(totalPages)" :disabled="page === totalPages"
            class="px-2 py-1 text-xs rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition">»</button>
        </div>
      </div>
    </div>
  </div>
</template>
