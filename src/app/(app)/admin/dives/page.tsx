import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { applyFilters, MONTHS, type P } from '@/lib/filters'
const PAGE = 25, ST: Record<string, string> = { pending: 'Pendiente', reviewed: 'Revisada', needs_correction: 'Necesita corrección' }
export default async function ClassDives(props: { searchParams: Promise<P & { page?: string; student?: string; review?: string }> }) {
  const sp = await props.searchParams
  const { sb } = await requireAdmin()
  const page = Math.max(1, Number(sp.page) || 1)
  const { data: students } = await sb.from('profiles').select('id, full_name').eq('role', 'student').order('full_name')
  let q = sb.from('dives').select('id, dive_number, dive_date, site, max_depth_m, duration_min, work_task, review_status, modified_since_review, profiles!dives_user_id_fkey!inner(full_name, role)', { count: 'exact' })
  q = q.eq('profiles.role', 'student')
  if (sp.student) q = q.eq('user_id', sp.student)
  if (sp.review) q = q.eq('review_status', sp.review)
  const { data, count, error } = await applyFilters(q, sp).order('dive_date', { ascending: false }).order('id').range((page - 1) * PAGE, page * PAGE - 1)
  if (error) return <p className="text-red-700">Error: {error.message}</p>
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE))
  const qs = (o: Record<string, string | number>) => new URLSearchParams(Object.entries({ ...sp, ...o }).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString()
  const yr = new Date().getFullYear()
  return <><h1 className="mb-4 text-2xl font-bold text-navy">Inmersiones de la clase ({count ?? 0})</h1>
    <form key={JSON.stringify(sp)} className="mb-4 grid gap-2 rounded-xl bg-white p-3 text-sm shadow-sm sm:grid-cols-3 lg:grid-cols-4">
      <select name="student" defaultValue={sp.student ?? ''} className="input"><option value="">Alumno (todos)</option>{students?.map((s) => <option key={s.id} value={s.id}>{s.full_name || s.id.slice(0, 8)}</option>)}</select>
      <select name="year" defaultValue={sp.year ?? ''} className="input"><option value="">Año (todos)</option>{Array.from({ length: 12 }, (_, i) => yr - i).map((a) => <option key={a}>{a}</option>)}</select>
      <select name="month" defaultValue={sp.month ?? ''} className="input"><option value="">Mes (todos)</option>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select>
      <select name="review" defaultValue={sp.review ?? ''} className="input"><option value="">Revisión (todas)</option>{Object.entries(ST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      <input name="from" type="date" defaultValue={sp.from} className="input" title="Desde" /><input name="to" type="date" defaultValue={sp.to} className="input" title="Hasta" />
      <input name="site" placeholder="Lugar" defaultValue={sp.site} className="input" /><input name="work" placeholder="Tipo de trabajo" defaultValue={sp.work} className="input" />
      <div className="flex flex-wrap gap-2 sm:col-span-3 lg:col-span-4"><button className="btn">Aplicar filtros</button><Link href="/admin/dives" className="rounded-lg border px-4 py-2">Limpiar filtros</Link><a href={`/export?scope=class&${qs({})}`} className="rounded-lg border px-4 py-2">Exportar CSV (filtro actual)</a></div></form>
    {!data?.length ? <p className="text-slate-500">No hay inmersiones con estos filtros.</p> : <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-slate-100"><tr>{['Alumno', 'Nº', 'Fecha', 'Lugar', 'Prof.', 'Min', 'Trabajo', 'Revisión'].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
      <tbody>{data.map((d: any) => <tr key={d.id} className="border-t hover:bg-slate-50">{[d.profiles?.full_name || '—', d.dive_number, d.dive_date, d.site, d.max_depth_m, d.duration_min, d.work_task?.slice(0, 35) ?? '—', ST[d.review_status] + (d.modified_since_review ? ' ✎ modificada' : '')].map((c, i) => <td key={i} className="p-3"><Link href={`/dives/${d.id}?from=${encodeURIComponent(`/admin/dives?${qs({})}`)}`} className="block">{c}</Link></td>)}</tr>)}</tbody></table></div>}
    <div className="mt-4 flex items-center gap-3 text-sm">{page > 1 && <Link href={`/admin/dives?${qs({ page: page - 1 })}`} className="rounded border px-3 py-1">← Anterior</Link>}<span>Página {page} de {pages}</span>{page < pages && <Link href={`/admin/dives?${qs({ page: page + 1 })}`} className="rounded border px-3 py-1">Siguiente →</Link>}</div></>
}
