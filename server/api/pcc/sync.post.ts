import { parse } from 'node-html-parser'
import { useSupabase } from '~/server/utils/supabase'

export default defineEventHandler(async () => {
  const supabase = useSupabase()
  let totalSynced = 0
  let page = 1
  let hasMore = true

  while (hasMore) {
    const html = await fetchPage(page)
    const { total, items } = parseTenders(html)

    if (items.length === 0) break

    // 只寫入有 detail_url 的資料，用 upsert 避免重複
    const rows = items
      .filter(i => i.detailUrl)
      .map(i => ({
        tender_no:    i.tenderNo || null,
        tender_name:  i.tenderName,
        agency_name:  i.agencyName,
        method:       i.method,
        nature:       i.nature,
        publish_date: i.publishDate,
        deadline:     i.deadline,
        budget:       i.budget,
        detail_url:   i.detailUrl,
      }))

    if (rows.length === 0) { page++; continue }

    const { error, count } = await supabase
      .from('tenders')
      .upsert(rows, { onConflict: 'detail_url', ignoreDuplicates: true })
      .select('id')

    if (error) {
      console.error('[SYNC] supabase error:', error.message, error.details)
      break
    }
    console.log(`[SYNC] page ${page}: inserted ${count ?? rows.length} rows`)

    totalSynced += items.length
    const totalPages = Math.ceil(total / 10)
    hasMore = page < totalPages
    page++
  }

  console.log(`[SYNC] done, synced ${totalSynced} records`)
  return { success: true, synced: totalSynced }
})

async function fetchPage(page: number): Promise<string> {
  const today = formatDate(new Date())
  const future = formatDate(addDays(new Date(), 180))

  const params = new URLSearchParams({
    pageSize: '10',
    'd-49738-p': String(page),
    firstSearch: 'false',
    searchType: 'tpam',
    isBinding: 'N',
    isLogIn: 'N',
    level_1: 'on',
    tenderStatus: 'TENDER_STATUS_0',
    tenderWay: 'TENDER_WAY_ALL_DECLARATION',
    proctrgCode1: '',
    proctrgCode2: '',
    radProctrgCate: 'RAD_PROCTRG_CATE_3',
    proctrgCode3: '50003065',
    dateType: 'isSpdt',
    tenderStartDate: today,
    tenderEndDate: future,
  })

  return $fetch<string>(
    `https://web.pcc.gov.tw/prkms/tender/common/proctrg/readTenderProctrg?${params}`,
    {
      method: 'GET',
      headers: {
        'Referer': 'https://web.pcc.gov.tw/prkms/tender/common/proctrg/indexTenderProctrg',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      responseType: 'text',
    }
  )
}

function parseTenders(html: string) {
  const root = parse(html)

  const totalMatch = html.match(/共有[\s\S]*?>\s*([\d,]+)\s*<\/span>\s*筆/)
  const total = totalMatch ? parseInt(totalMatch[1].replace(',', '')) : 0

  const rows = root.querySelectorAll('table tbody tr')
  const items = rows.map((row) => {
    const cells = row.querySelectorAll('td')
    if (cells.length < 8) return null

    const link = cells[2]?.querySelector('a')
    const cell2Html = cells[2]?.innerHTML ?? ''
    const nameMatch = cell2Html.match(/pageCode2Img\("([^"]+)"\)/)
    const tenderName = nameMatch ? nameMatch[1] : (link?.text.trim() ?? '')
    const tenderNo = cells[2]?.text.trim().split('\n')[0].trim() ?? ''

    return {
      agencyName:  cells[1]?.text.trim() ?? '',
      tenderNo,
      tenderName,
      method:      cells[4]?.text.trim() ?? '',
      nature:      cells[5]?.text.trim() ?? '',
      publishDate: cells[6]?.text.trim() ?? '',
      deadline:    cells[7]?.text.trim() ?? '',
      budget:      cells[8]?.text.trim() ?? '',
      detailUrl:   link?.getAttribute('href') ?? '',
    }
  }).filter((i): i is NonNullable<typeof i> => !!i && !!i.agencyName)

  return { total, items }
}

function addDays(d: Date, days: number) {
  const r = new Date(d); r.setDate(r.getDate() + days); return r
}
function formatDate(d: Date) {
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`
}
