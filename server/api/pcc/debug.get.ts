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

  try {
    const html = await $fetch<string>(
      `https://web.pcc.gov.tw/prkms/tender/common/proctrg/readTenderProctrg?${params}`,
      { responseType: 'text', headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    return {
      ok: true,
      htmlLength: html.length,
      hasData: html.includes('共有'),
      sample: html.slice(0, 300),
    }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) }
  }
})
