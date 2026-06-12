import { parse } from 'node-html-parser'

export default defineEventHandler(async () => {
  const today = formatDate(new Date())
  const future = formatDate(addDays(new Date(), 180))

  const params = new URLSearchParams({
    pageSize: '10',
    'd-49738-p': '1',
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

  const url = `https://web.pcc.gov.tw/prkms/tender/common/proctrg/readTenderProctrg?${params}`

  const html = await $fetch<string>(url, {
    method: 'GET',
    headers: {
      'Referer': 'https://web.pcc.gov.tw/prkms/tender/common/proctrg/indexTenderProctrg',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    },
    responseType: 'text',
  })

  const root = parse(html)
  const totalMatch = html.match(/共有[\s\S]*?>\s*([\d,]+)\s*<\/span>\s*筆/)
  const rows = root.querySelectorAll('table tbody tr')

  return {
    htmlLength: html.length,
    totalMatch: totalMatch?.[1] ?? null,
    rowCount: rows.length,
    hasPccContent: html.includes('共有'),
    firstRowText: rows[0]?.text.trim().slice(0, 200) ?? null,
  }
})
