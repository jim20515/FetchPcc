import { useSupabase } from '~/server/utils/supabase'

const ALLOWED_SORT_FIELDS = ['publish_date', 'deadline', 'budget', 'agency_name'] as const
type SortField = typeof ALLOWED_SORT_FIELDS[number]

export default defineEventHandler(async (event) => {
  const url = new URL(event.node.req.url!, 'http://localhost')
  const page = Number(url.searchParams.get('page')) || 1
  const rawSort = url.searchParams.get('sortField') ?? 'publish_date'
  const sortField: SortField = ALLOWED_SORT_FIELDS.includes(rawSort as SortField)
    ? rawSort as SortField
    : 'publish_date'
  const sortAsc = url.searchParams.get('sortOrder') === 'asc'

  const pageSize = 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const supabase = useSupabase()

  const { data, error, count } = await supabase
    .from('tenders')
    .select('*', { count: 'exact' })
    .order(sortField, { ascending: sortAsc })
    .range(from, to)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  const items = (data ?? []).map(r => ({
    agencyName:  r.agency_name,
    tenderNo:    r.tender_no,
    tenderName:  r.tender_name,
    method:      r.method,
    nature:      r.nature,
    publishDate: r.publish_date,
    deadline:    r.deadline,
    budget:      r.budget,
    detailUrl:   r.detail_url,
  }))

  return { page, total: count ?? 0, data: items }
})
