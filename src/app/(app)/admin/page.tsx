import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { fetchAll, summarize, monthly, MONTHS } from '@/lib/filters'
import { createStudent } from './students/actions'
import { reviewPhoto } from './actions'
import { Msg } from '../../auth-shell'
export default async function Admin(props: { searchParams: Promise<{ error?: string; ok?: string; year?: string }> }) {
  const searchParams = await props.searchParams
  const { sb } = await requireAdmin()
  const { data: people } = await sb.from('profiles').select('id, full_name, role, active, avatar_path').order('full_name')
  const { data: pending } = await sb.from('profile_photos').select('id, path, profiles!profile_photos_user_id_fkey(full_name)').eq('status', 'pending').order('created_at')
  const all = await fetchAll(() => sb.from('dives').select('user_id, dive_date, duration_min, max_depth_m, profiles!dives_user_id_fkey!inner(role)').eq('profiles.role', 'student').order('dive_date').order('id'))
  const cur = String(new Date().getFullYear()), year = searchParams.year || cur
  const years = [...new Set([cur, ...all.map((d) => d.dive_date.slice(0, 4))])].sort().reverse()
  const t = summarize(all), m = monthly(all, year), top = Math.max(1, ...m.map((x) => x.hours))
  const students = (people ?? []).filter((p) => p.role === 'student')
  const paths = [...(pending ?? []).map((p) => p.path), ...(people ?? []).map((p) => p.avatar_path).filter(Boolean)] as string[]
  const { data: signed } = paths.length ? await sb.storage.from('avatars').createSignedUrls(paths, 3600) : { data: [] }
  const u = (p?: string | null) => signed?.find((s) => s.path === p)?.signedUrl || undefined
  return <><h1 className="mb-4 text-2xl font-bold text-navy">Gestión de la clase</h1><Msg error={searchParams.error} ok={searchParams.ok} />
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{[['Alumnos', students.length], ['Inmersiones de la clase', t.n], ['Horas totales', t.hours.toFixed(1)], ['Profundidad máx.', t.maxDepth !== null ? `${t.maxDepth} m` : '—']].map(([k, v]) => <div key={k} className="rounded-xl border-l-4 border-teal bg-white p-4 shadow-sm"><div className="text-xs text-slate-500">{k}</div><div className="text-xl font-semibold text-navy">{v}</div></div>)}</div>
    <section className="mb-6 rounded-xl bg-white p-4 shadow-sm"><div className="mb-3 flex flex-wrap items-center gap-2"><h2 className="font-semibold text-deep">Actividad de la clase · {year} (horas)</h2><div className="ml-auto flex gap-1 text-sm">{years.map((a) => <Link key={a} href={`/admin?year=${a}`} className={`rounded-lg border px-3 py-1 ${a === year ? 'bg-teal-dark text-white' : 'bg-white'}`}>{a}</Link>)}</div></div>
      <div className="flex h-40 items-end gap-1 sm:gap-2">{m.map((x, i) => <div key={i} className="flex h-full flex-1 flex-col items-center justify-end text-xs" title={`${MONTHS[i]}: ${x.n} inmersiones, ${x.hours.toFixed(1)} h`}><span className="text-slate-500">{x.n || ''}</span><div className="w-full rounded-t bg-teal" style={{ height: `${(x.hours / top) * 100}%`, minHeight: x.n ? 4 : 0 }} /><span className="mt-1 text-slate-500">{MONTHS[i].slice(0, 3)}</span></div>)}</div>
      <p className="mt-2 text-xs text-slate-500">Altura = horas; número sobre la barra = inmersiones.</p></section>
    {!!pending?.length && <section className="mb-6 rounded-xl border-l-4 border-amber-400 bg-white p-4 shadow-sm"><h2 className="mb-3 font-semibold">Fotos pendientes de aprobación ({pending.length})</h2>
      <div className="space-y-4">{pending.map((f: any) => <div key={f.id} className="flex flex-wrap items-center gap-3">{u(f.path) && <img src={u(f.path)} alt="" className="h-24 w-24 rounded-lg object-cover" />}
        <div className="flex-1"><div className="font-medium">{f.profiles?.full_name || '(sin nombre)'}</div>
          <form action={reviewPhoto} className="mt-1 flex flex-wrap gap-2"><input type="hidden" name="id" value={f.id} /><input name="reason" placeholder="Motivo (si la rechazas)" className="input max-w-xs" />
            <button name="decision" value="approved" className="btn">Aprobar</button><button name="decision" value="rejected" className="rounded-lg border border-red-300 px-4 py-2 text-red-700">Rechazar</button></form></div></div>)}</div></section>}
    <div className="mb-6 flex flex-wrap items-center gap-3"><h2 className="font-semibold text-deep">Alumnos</h2><Link href="/admin/dives" className="rounded-lg border bg-white px-3 py-1 text-sm">Ver todas las inmersiones</Link><a href="/export?scope=class" className="rounded-lg border bg-white px-3 py-1 text-sm">Exportar CSV de la clase</a></div>
    <div className="mb-6 overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-slate-100"><tr><th className="p-3">Foto</th><th>Nombre</th><th>Inmersiones</th><th>Horas</th><th>Prof. máx.</th><th>Última</th><th>Activo</th></tr></thead>
      <tbody>{students.map((p) => { const s = summarize(all.filter((d) => d.user_id === p.id)); return <tr key={p.id} className="border-t"><td className="p-3">{u(p.avatar_path) ? <img src={u(p.avatar_path)} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-200">🤿</div>}</td>
        <td><Link href={`/admin/students/${p.id}`} className="font-medium text-teal-dark">{p.full_name || '(sin nombre)'}</Link></td><td>{s.n}</td><td>{s.hours.toFixed(1)}</td><td>{s.maxDepth !== null ? `${s.maxDepth} m` : '—'}</td><td>{s.last ?? '—'}</td><td>{p.active ? 'Sí' : 'No'}</td></tr> })}</tbody></table>
      {!students.length && <p className="p-4 text-slate-500">Aún no hay alumnos.</p>}</div>
    <section className="max-w-xl rounded-xl bg-white p-4 shadow-sm"><h2 className="mb-2 font-semibold">Crear alumno</h2><form action={createStudent} className="grid gap-2 sm:grid-cols-2"><input name="name" required placeholder="Nombre y apellidos" className="input" /><input name="email" type="email" required placeholder="Correo" className="input" />
        <input name="password" type="password" minLength={10} required placeholder="Contraseña provisional (mín. 10)" className="input" autoComplete="new-password" /><button className="btn">Crear alumno</button></form>
        <p className="mt-2 text-xs text-slate-500">Entrega la contraseña por un canal privado. Puedes cambiarla después desde la ficha del alumno.</p></section></>
}
