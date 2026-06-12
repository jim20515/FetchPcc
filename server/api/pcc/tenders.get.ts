import { parse } from 'node-html-parser'

export default defineEventHandler(async (event) => {
  const url = new URL(event.node.req.url!, 'http://localhost')
  const page = Number(url.searchParams.get('page')) || 1

  try {
    const { total, items } = await fetchTenders(page)
    return { page, total, data: items }
  } catch (e: any) {
    console.error('[PCC] fetch error:', e?.message ?? e)
    throw createError({ statusCode: 500, message: e?.message ?? 'fetch failed' })
  }
})

async function fetchTenders(page: number) {
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

  const fetchUrl = `https://web.pcc.gov.tw/prkms/tender/common/proctrg/readTenderProctrg?${params}`

  const html = await $fetch<string>(fetchUrl, {
    method: 'GET',
    headers: {
      'Referer': 'https://web.pcc.gov.tw/prkms/tender/common/proctrg/indexTenderProctrg',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'zh-TW,zh;q=0.9',
    },
    responseType: 'text',
  })

  const result = parseTenders(html)

  // 依公告日期倒序排序（民國年格式 115/06/12 → 直接字串比較即可）
  result.items.sort((a, b) => b.publishDate.localeCompare(a.publishDate))

  return result
}

function parseTenders(html: string) {
  const root = parse(html)

  // 總筆數
  // HTML 結構: 共有<span class="red"> 97 </span>筆資料
  const totalMatch = html.match(/共有[\s\S]*?>\s*([\d,]+)\s*<\/span>\s*筆/)
  const total = totalMatch ? parseInt(totalMatch[1].replace(',', '')) : 0

  // 欄位順序：[0]項次 [1]機關名稱 [2]標案案號/名稱 [3]傳輸次數
  //           [4]招標方式 [5]採購性質 [6]公告日期 [7]截止投標 [8]預算金額
  const rows = root.querySelectorAll('table tbody tr')

  const items = rows.map((row) => {
    const cells = row.querySelectorAll('td')
    if (cells.length < 8) return null

    const link = cells[2]?.querySelector('a')
    const cell2Html = cells[2]?.innerHTML ?? ''
    // 案名藏在 JS: Geps3.CNS.pageCode2Img("案名")
    const nameMatch = cell2Html.match(/pageCode2Img\("([^"]+)"\)/)
    const tenderName = nameMatch ? nameMatch[1] : (link?.text.trim() ?? '')

    return {
      agencyName:  cells[1]?.text.trim() ?? '',
      tenderNo:    '',
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
  const result = new Date(d)
  result.setDate(result.getDate() + days)
  return result
}

function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}
