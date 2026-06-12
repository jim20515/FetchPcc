import { parse } from 'node-html-parser'

export default defineEventHandler(async () => {
  const today = new Date()
  const future = new Date(today)
  future.setDate(future.getDate() + 180)
  const fmt = (d: Date) => `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`

  const params = new URLSearchParams({
    pageSize: '10', 'd-49738-p': '1', firstSearch: 'false',
    searchType: 'tpam', isBinding: 'N', isLogIn: 'N', level_1: 'on',
    tenderStatus: 'TENDER_STATUS_0', tenderWay: 'TENDER_WAY_ALL_DECLARATION',
    proctrgCode1: '', proctrgCode2: '',
    radProctrgCate: 'RAD_PROCTRG_CATE_3', proctrgCode3: '50003065',
    dateType: 'isSpdt', tenderStartDate: fmt(today), tenderEndDate: fmt(future),
  })

  const html = await $fetch<string>(
    `https://web.pcc.gov.tw/prkms/tender/common/proctrg/readTenderProctrg?${params}`,
    { responseType: 'text', headers: { 'User-Agent': 'Mozilla/5.0' } }
  )

  const root = parse(html)
  const tbodyRows = root.querySelectorAll('table tbody tr')
  const allTr = root.querySelectorAll('tr')
  const totalMatch = html.match(/共有[\s\S]*?>\s*([\d,]+)\s*<\/span>\s*筆/)

  // 抓第一個 tbody tr 的 cells 數量和內容
  const firstRow = tbodyRows[0]
  const cells = firstRow?.querySelectorAll('td') ?? []

  return {
    totalMatch: totalMatch?.[1] ?? null,
    tbodyRowCount: tbodyRows.length,
    allTrCount: allTr.length,
    firstRowCellCount: cells.length,
    firstRowCells: cells.map((c, i) => ({ index: i, text: c.text.trim().slice(0, 50) })),
  }
})
