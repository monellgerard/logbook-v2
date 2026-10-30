import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OPT } from '@/lib/dive-schema'
import DeleteButton from './delete-button'
import DiveProfile from '@/components/dive-profile'
import { reviewDive } from '../../admin/actions'
const ST: Record<string, string> = { pending: 'Pendiente', reviewed: 'Revisada', needs_correction: 'Necesita corrección' }
const lab = (k: string, v: any) => { const o = (OPT as any)[k]?.find((x: string[]) => x[0] === v); return o ? o[1] : v }
const ROWS: [string, string, string?][] = [['Nº', 'dive_number'], ['Lugar', 'site'], ['Fecha', 'dive_date'], ['Hora', 'start_time'], ['Profundidad (m)', 'max_depth_m'], ['Tiempo (min)', 'duration_min'],
  ['Temp. agua (°C)', 'water_temp_c'], ['Visibilidad', 'visibility'], ['Oleaje', 'swell'], ['Corriente', 'current'], ['Traje', 'suit_type'], ['Lastre (kg)', 'weight_kg'],
  ['Material botella', 'tank_material', 'tank_material_other'], ['Capacidad botella', 'tank_capacity_l', 'tank_capacity_other'], ['Mezcla', 'gas_mix', 'gas_mix_other'],
  ['Presión inicial (bar)', 'pressure_start_bar'], ['Presión final (bar)', 'pressure_end_bar'], ['Jefe de equipo', 'team_leader'], ['Pareja', 'buddy'],
  ['Trabajo', 'work_task'], ['Incidencias', 'incidents'], ['Herramientas', 'tools'], ['Valoración', 'rating']]
export default async function Detail(props: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; from?: string }> }) {
  const params = await props.params, searchParams = await props.searchParams
  const sb = createClient()
  const { data: d } = await sb.from('dives').select('*').eq('id', params.id).maybeSingle()
  if (!d) notFound()
  const { data: reviews } = await sb.from('dive_reviews').select('status, comment, created_at').eq('dive_id', d.id).order('created_at', { ascending: false })
  const { data: { user } } = await sb.auth.getUser()
  const { data: me } = await sb.from('profiles').select('role').eq('id', user!.id).single()
  const isAdmin = me?.role === 'admin', own = d.user_id === user!.id
  const from = searchParams.from ?? '', back = from.startsWith('/') && !from.startsWith('//') ? from : own ? '/dives' : '/admin/dives'
  const owner = own ? '' : (await sb.from('profiles').select('full_name').eq('id', d.user_id).single()).data?.full_name ?? ''
  return <>{searchParams.error && <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{searchParams.error}</p>}<Link href={back} className="mb-2 inline-block text-teal-dark">← Volver</Link><div className="mb-4 flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold text-navy">Inmersión nº {d.dive_number}{owner ? ` · ${owner}` : ''}</h1>{!(isAdmin && own) && <span className="rounded bg-slate-100 px-2 py-1 text-xs">{ST[d.review_status]}</span>}
    {d.modified_since_review && <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">Modificada tras revisión</span>}
    {own && <div className="ml-auto flex gap-2"><Link href={`/dives/${d.id}/edit`} className="btn">Editar</Link><DeleteButton id={d.id} /></div>}</div>
    {reviews?.length ? <div className="mb-4 rounded-xl border-l-4 border-teal bg-white p-3 text-sm">{reviews.map((r, i) => <p key={i}><b>{ST[r.status]}</b> · {new Date(r.created_at).toLocaleDateString('es-ES')}{r.comment ? `: ${r.comment}` : ''}</p>)}</div> : null}
    {isAdmin && !own && <form action={reviewDive} className="mb-4 max-w-3xl rounded-xl bg-white p-4 shadow-sm"><input type="hidden" name="dive_id" value={d.id} /><input type="hidden" name="from" value={back} /><h2 className="mb-2 font-semibold text-deep">Revisión del profesor</h2>
      <textarea name="comment" rows={2} placeholder="Comentario (obligatorio si necesita corrección)" className="input mb-2" /><div className="flex flex-wrap gap-2"><button name="status" value="reviewed" className="btn">Marcar revisada</button><button name="status" value="needs_correction" className="rounded-lg border border-amber-400 px-4 py-2">Necesita corrección</button><button name="status" value="pending" className="rounded-lg border px-4 py-2">Volver a pendiente</button><Link href={back} className="rounded-lg border px-4 py-2 sm:ml-auto">← Volver</Link></div></form>}
    <DiveProfile depth={d.max_depth_m} minutes={d.duration_min} gasMix={d.gas_mix} startBar={d.pressure_start_bar} endBar={d.pressure_end_bar} />
    <dl className="grid max-w-3xl gap-px overflow-hidden rounded-xl bg-slate-200 sm:grid-cols-2">{ROWS.map(([l, k, o]) => { const v = d[k] === 'otros' && o ? `Otros: ${d[o] ?? ''}` : lab(k, d[k]); return <div key={k} className="bg-white p-3"><dt className="text-xs text-slate-500">{l}</dt><dd className="whitespace-pre-wrap">{v ?? '—'}</dd></div> })}</dl>
    <Link href={back} className="mt-4 inline-block text-teal-dark">← Volver</Link></>
}
