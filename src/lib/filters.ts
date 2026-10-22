export type P = Record<string, string | undefined>
const esc = (s: string) => s.replace(/[%_,()\\]/g, ' ')
export function applyFilters(q: any, p: P) {
  const y = Number(p.year), m = Number(p.month), pad = (n: number) => String(n).padStart(2, '0')
  if (y) {
    if (m >= 1 && m <= 12) q = q.gte('dive_date', `${y}-${pad(m)}-01`).lt('dive_date', m === 12 ? `${y + 1}-01-01` : `${y}-${pad(m + 1)}-01`)
    else q = q.gte('dive_date', `${y}-01-01`).lt('dive_date', `${y + 1}-01-01`)
  }
  if (p.from) q = q.gte('dive_date', p.from)
  if (p.to) q = q.lte('dive_date', p.to)
  if (p.site?.trim()) q = q.ilike('site', `%${esc(p.site.trim())}%`)
  if (p.work?.trim()) q = q.ilike('work_task', `%${esc(p.work.trim())}%`)
  if (p.gas_mix) q = q.eq('gas_mix', p.gas_mix)
  if (p.min_depth) q = q.gte('max_depth_m', Number(p.min_depth))
  if (p.max_depth) q = q.lte('max_depth_m', Number(p.max_depth))
  if (p.min_rating) q = q.gte('rating', Number(p.min_rating))
  return q
}
// PostgREST devuelve máx. 1000 filas por petición: se pagina hasta terminar.
export async function fetchAll(build: () => any) {
  const out: any[] = []
  for (let i = 0; ; i += 1000) {
    const { data, error } = await build().range(i, i + 999)
    if (error) throw new Error(error.message)
    out.push(...data)
    if (data.length < 1000) break
  }
  return out
}
export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
type R = { dive_date: string; duration_min: number; max_depth_m: number | string }
export function summarize(rows: R[]) {
  const dates = rows.map((r) => r.dive_date).sort(), min = rows.reduce((s, r) => s + r.duration_min, 0)
  return { n: rows.length, minutes: min, hours: min / 60, maxDepth: rows.length ? Math.max(...rows.map((r) => Number(r.max_depth_m))) : null, avg: rows.length ? Math.round(min / rows.length) : null, first: dates[0] ?? null, last: dates.at(-1) ?? null }
}
export const monthly = (rows: R[], year: string) => MONTHS.map((_, i) => {
  const f = rows.filter((r) => r.dive_date.startsWith(`${year}-${String(i + 1).padStart(2, '0')}`))
  return { n: f.length, hours: f.reduce((s, r) => s + r.duration_min, 0) / 60 }
})
