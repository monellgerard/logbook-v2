import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { fetchAll, summarize } from '@/lib/filters'
import { Msg } from '../../../../auth-shell'
import { setPassword, setActive } from '../actions'
import DeleteStudent from './delete-student'
export default async function Student(props: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> }) {
  const params = await props.params, searchParams = await props.searchParams
  const { sb } = await requireAdmin()
  const { data: p } = await sb.from('profiles').select('full_name, specialty, organization, avatar_path, active').eq('id', params.id).maybeSingle()
  if (!p) notFound()
  const { data: certs } = await sb.from('certifications').select('*').eq('user_id', params.id).order('obtained_on', { ascending: false })
  const all = await fetchAll(() => sb.from('dives').select('dive_date, duration_min, max_depth_m').eq('user_id', params.id).order('dive_date').order('id'))
  const photo = p.avatar_path ? (await sb.storage.from('avatars').createSignedUrl(p.avatar_path, 3600)).data?.signedUrl : undefined
  const t = summarize(all), years = [...new Set(all.map((d) => d.dive_date.slice(0, 4)))].sort().reverse(), today = new Date().toISOString().slice(0, 10)
  return <div className="max-w-3xl space-y-6"><Link href="/admin" className="text-teal-dark">← Gestión de la clase</Link>
    <div className="flex items-center gap-4">{photo ? <img src={photo} alt="" className="h-24 w-24 rounded-full object-cover" /> : <div className="grid h-24 w-24 place-items-center rounded-full bg-slate-200 text-3xl">🤿</div>}
      <div><h1 className="text-2xl font-bold text-navy">{p.full_name || '(sin nombre)'}</h1><p className="text-sm text-slate-600">{[p.specialty, p.organization].filter(Boolean).join(' · ') || 'Sin especialidad ni centro indicados'}{p.active ? '' : ' · CUENTA DESACTIVADA'}</p></div></div>
    <div className="flex flex-wrap gap-2"><Link href={`/admin/dives?student=${params.id}`} className="btn">Ver sus inmersiones</Link><a href={`/export?scope=class&student=${params.id}`} className="rounded-lg border bg-white px-4 py-2">Exportar CSV</a></div>
    <section className="rounded-xl bg-white p-4 shadow-sm"><h2 className="mb-3 font-semibold text-deep">Estadísticas</h2><div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">{[['Inmersiones', t.n], ['Horas', t.hours.toFixed(1)], ['Prof. máx.', t.maxDepth !== null ? `${t.maxDepth} m` : '—'], ['Duración media', t.avg !== null ? `${t.avg} min` : '—'], ['Primera', t.first ?? '—'], ['Última', t.last ?? '—']].map(([k, v]) => <div key={k}><div className="text-xs text-slate-500">{k}</div><div className="font-semibold">{v}</div></div>)}</div>
      {years.length > 0 && <table className="mt-4 w-full text-left text-sm"><thead className="bg-slate-100"><tr><th className="p-2">Año</th><th>Inmersiones</th><th>Horas</th></tr></thead><tbody>{years.map((y) => { const s = summarize(all.filter((d) => d.dive_date.startsWith(y))); return <tr key={y} className="border-t"><td className="p-2">{y}</td><td>{s.n}</td><td>{s.hours.toFixed(1)}</td></tr> })}</tbody></table>}</section>
    <section className="rounded-xl bg-white p-4 shadow-sm"><h2 className="mb-3 font-semibold text-deep">Certificaciones</h2>{!certs?.length ? <p className="text-sm text-slate-500">Ninguna registrada.</p> : <ul className="divide-y text-sm">{certs.map((c) => <li key={c.id} className="py-2"><b>{c.title}</b> · {c.issuer}<div className="text-xs text-slate-500">Obtenida {c.obtained_on}{c.expires_on ? ` · caduca ${c.expires_on}${c.expires_on < today ? ' (CADUCADA)' : ''}` : ''}{c.cert_number ? ` · nº ${c.cert_number}` : ''}</div></li>)}</ul>}</section>
    <section className="rounded-xl bg-white p-4 shadow-sm"><h2 className="mb-3 font-semibold text-deep">Cuenta</h2><Msg error={searchParams.error} ok={searchParams.ok} />
      <form action={setPassword} className="mb-3 flex flex-wrap gap-2"><input type="hidden" name="id" value={params.id} /><input name="password" type="password" minLength={10} required placeholder="Nueva contraseña (mín. 10)" className="input max-w-xs" autoComplete="new-password" /><button className="btn">Cambiar contraseña</button></form>
      <form action={setActive}><input type="hidden" name="id" value={params.id} /><input type="hidden" name="active" value={p.active ? 'false' : 'true'} /><button className="rounded-lg border px-4 py-2">{p.active ? 'Desactivar cuenta' : 'Reactivar cuenta'}</button></form>
      <p className="mt-2 text-xs text-slate-500">Desactivar impide iniciar sesión; los datos se conservan y se puede revertir.</p>
      <div className="mt-4 border-t pt-4"><DeleteStudent id={params.id} /></div></section></div>
}
