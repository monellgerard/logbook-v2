import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { applyFilters, fetchAll, MONTHS, type P } from '@/lib/filters'
import { OPT } from '@/lib/dive-schema'
const PAGE = 20
const COLS: [string, string][] = [['dive_number', 'Nº'], ['dive_date', 'Fecha'], ['site', 'Lugar'], ['max_depth_m', 'Prof. (m)'], ['duration_min', 'Min'], ['work_task', 'Trabajo'], ['rating', 'Valoración']]
export default async function Dives(props: { searchParams: Promise<P & { page?: string; sort?: string; dir?: string }> }) {
  const sp = await props.searchParams
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  const page = Math.max(1, Number(sp.page) || 1), sort = COLS.some(([k]) => k === sp.sort) ? sp.sort! : 'dive_date', asc = sp.dir === 'asc'
  const mine = () => sb.from('dives').select('id, dive_number, dive_date, site, max_depth_m, duration_min, work_task, rating, modified_since_review', { count: 'exact' }).eq('user_id', user!.id)
  const { data, count, error } = await applyFilters(mine(), sp).order(sort, { ascending: asc }).order('dive_number', { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1)
  if (error) return <p className="text-red-700">Error: {error.message}</p>
  const mins = (await fetchAll(() => applyFilters(sb.from('dives').select('duration_min').eq('user_id', user!.id), sp).order('id'))).reduce((s, r) => s + r.duration_min, 0)
  const { data: first } = await sb.from('dives').select('dive_date').eq('user_id', user!.id).order('dive_date').limit(1)
  const cy = new Date().getFullYear(), y0 = first?.[0] ? Number(first[0].dive_date.slice(0, 4)) : cy
  const years = Array.from({ length: cy - y0 + 1 }, (_, i) => cy - i)
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE))
  const q = (o: Record<string, string | number>) => '/dives?' + new URLSearchParams(Object.entries({ ...sp, ...o }).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)]))
  const exp = '/export?scope=mine&' + q({}).split('?')[1]
  const filtered = Object.entries(sp).some(([k, v]) => !['page', 'sort', 'dir'].includes(k) && v)
  return <><div className="mb-4 flex items-center justify-between"><h1 className="text-2xl font-bold text-navy">Mis inmersiones</h1><Link href="/dives/new" className="btn">+ Nueva</Link></div>
    <form key={JSON.stringify(sp)} className="mb-4 grid gap-2 rounded-xl bg-white p-3 text-sm shadow-sm sm:grid-cols-3 lg:grid-cols-5">
      <select name="year" defaultValue={sp.year ?? ''} className="input"><option value="">Año (todos)</option>{years.map((a) => <option key={a}>{a}</option>)}</select>
      <select name="month" defaultValue={sp.month ?? ''} className="input"><option value="">Mes (todos)</option>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select>
      <input name="from" type="date" defaultValue={sp.from} className="input" title="Desde" /><input name="to" type="date" defaultValue={sp.to} className="input" title="Hasta" />
      <input name="site" placeholder="Lugar" defaultValue={sp.site} className="input" /><input name="work" placeholder="Tipo de trabajo" defaultValue={sp.work} className="input" />
      <input name="min_depth" type="number" min={0} placeholder="Prof. mín (m)" defaultValue={sp.min_depth} className="input" /><input name="max_depth" type="number" min={0} placeholder="Prof. máx (m)" defaultValue={sp.max_depth} className="input" />
      <select name="gas_mix" defaultValue={sp.gas_mix ?? ''} className="input"><option value="">Gas (todos)</option>{OPT.gas_mix.map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select>
      <input name="min_rating" type="number" min={1} max={10} placeholder="Valoración mín" defaultValue={sp.min_rating} className="input" />
      <div className="flex gap-2 sm:col-span-3 lg:col-span-5"><button className="btn">Aplicar filtros</button><Link href="/dives" className="rounded-lg border px-4 py-2">Limpiar filtros</Link></div></form>
    <p className="mb-3 text-sm text-slate-600">{filtered ? 'Periodo filtrado' : 'Todas'}: <b>{count ?? 0}</b> inmersiones · <b>{(mins / 60).toFixed(1)}</b> h acumuladas · <a href={exp} className="text-teal-dark underline">Exportar CSV</a></p>
    {!data?.length ? <p className="text-slate-500">{filtered ? 'Ninguna inmersión coincide con los filtros.' : 'Todavía no has registrado ninguna inmersión.'}</p> :
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-slate-100"><tr>
        {COLS.map(([k, l]) => <th key={k} className="p-3"><Link href={q({ sort: k, dir: sort === k && !asc ? 'asc' : 'desc', page: 1 })}>{l}{sort === k ? (asc ? ' ▲' : ' ▼') : ''}</Link></th>)}</tr></thead>
        <tbody>{data.map((d: any) => <tr key={d.id} className="border-t row-hover">
          {[d.dive_number, d.dive_date, d.site, d.max_depth_m, d.duration_min, d.work_task?.slice(0, 40) ?? '—', d.rating ?? '—'].map((c, i) => <td key={i} className="p-3"><Link href={`/dives/${d.id}?from=${encodeURIComponent(q({}))}`} className="block">{c}{i === 0 && d.modified_since_review ? ' ✎' : ''}</Link></td>)}</tr>)}</tbody></table></div>}
    <div className="mt-4 flex items-center gap-3 text-sm">{page > 1 && <Link href={q({ page: page - 1 })} className="rounded border px-3 py-1">← Anterior</Link>}<span>Página {page} de {pages}</span>{page < pages && <Link href={q({ page: page + 1 })} className="rounded border px-3 py-1">Siguiente →</Link>}</div></>
}
