import { createClient } from '@/lib/supabase/server'
import { fetchAll, summarize } from '@/lib/filters'
import { Msg } from '../../auth-shell'
import { saveProfile, addCert, deleteCert, uploadPhoto } from './actions'
export default async function Profile(props: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const searchParams = await props.searchParams
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  const uid = user!.id
  const { data: p } = await sb.from('profiles').select('full_name, specialty, organization, avatar_path, role').eq('id', uid).single()
  const { data: certs } = await sb.from('certifications').select('*').eq('user_id', uid).order('obtained_on', { ascending: false })
  const all = await fetchAll(() => sb.from('dives').select('dive_date, duration_min, max_depth_m').eq('user_id', uid).order('dive_date').order('id'))
  const t = summarize(all), years = [...new Set(all.map((d) => d.dive_date.slice(0, 4)))].sort().reverse()
  const { data: photos } = await sb.from('profile_photos').select('path, status, reject_reason').eq('user_id', uid).order('created_at', { ascending: false }).limit(1)
  const last = photos?.[0]
  const url = async (path?: string | null) => (path ? (await sb.storage.from('avatars').createSignedUrl(path, 3600)).data?.signedUrl : undefined)
  const approvedUrl = await url(p?.avatar_path), pendingUrl = last?.status === 'pending' ? await url(last.path) : undefined
  const isAdmin = p?.role === 'admin'
  const today = new Date().toISOString().slice(0, 10)
  return <div className="max-w-3xl space-y-6"><h1 className="text-2xl font-bold text-navy">Mi ficha de buceador</h1><Msg error={searchParams.error} ok={searchParams.ok} />
    <section className="rounded-xl bg-white p-4 shadow-sm"><h2 className="mb-3 font-semibold text-deep">Fotografía</h2>
      <div className="flex flex-wrap items-center gap-4">{approvedUrl ? <img src={approvedUrl} alt="Tu foto aprobada" className="h-24 w-24 rounded-full object-cover" /> : <div className="grid h-24 w-24 place-items-center rounded-full bg-slate-200 text-3xl">🤿</div>}
        <div className="flex-1 text-sm">
          {!isAdmin && last?.status === 'pending' && <p className="mb-2 rounded bg-amber-50 p-2 text-amber-800">⏳ Foto pendiente de aprobación del profesor. Hasta entonces se mantiene la anterior.{pendingUrl && <img src={pendingUrl} alt="Foto pendiente" className="mt-2 h-16 w-16 rounded-full object-cover" />}</p>}
          {!isAdmin && last?.status === 'rejected' && <p className="mb-2 rounded bg-red-50 p-2 text-red-700">Tu última foto fue rechazada{last.reject_reason ? `: ${last.reject_reason}` : '.'} Sube otra.</p>}
          <form action={uploadPhoto} className="flex flex-wrap items-center gap-2"><input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required className="text-sm" /><button className="btn">{isAdmin ? 'Cambiar foto' : 'Enviar foto'}</button></form>
          <p className="mt-1 text-xs text-slate-500">JPG, PNG o WebP, máximo 2 MB. {isAdmin ? 'Como profesor, tu foto se publica directamente.' : 'El profesor debe aprobarla antes de que sea visible.'}</p></div></div></section>
    <section className="rounded-xl bg-white p-4 shadow-sm"><h2 className="mb-3 font-semibold text-deep">Datos personales</h2>
      <form action={saveProfile} className="grid gap-3 sm:grid-cols-2"><input name="full_name" required defaultValue={p?.full_name} placeholder="Nombre y apellidos *" className="input sm:col-span-2" />
        <input name="specialty" defaultValue={p?.specialty ?? ''} placeholder="Especialidad o función" className="input" /><input name="organization" defaultValue={p?.organization ?? ''} placeholder="Centro formativo o empresa (opcional)" className="input" />
        <button className="btn sm:w-40">Guardar</button></form></section>
    <section className="rounded-xl bg-white p-4 shadow-sm"><h2 className="mb-3 font-semibold text-deep">Estadísticas</h2>
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">{[['Inmersiones', t.n], ['Horas', t.hours.toFixed(1)], ['Prof. máx.', t.maxDepth !== null ? `${t.maxDepth} m` : '—'], ['Duración media', t.avg !== null ? `${t.avg} min` : '—'], ['Primera', t.first ?? '—'], ['Última', t.last ?? '—']].map(([k, v]) => <div key={k}><div className="text-xs text-slate-500">{k}</div><div className="font-semibold">{v}</div></div>)}</div>
      {years.length > 0 && <table className="mt-4 w-full text-left text-sm"><thead className="bg-slate-100"><tr><th className="p-2">Año</th><th>Inmersiones</th><th>Horas</th><th>Prof. máx.</th></tr></thead><tbody>{years.map((y) => { const s = summarize(all.filter((d) => d.dive_date.startsWith(y))); return <tr key={y} className="border-t"><td className="p-2">{y}</td><td>{s.n}</td><td>{s.hours.toFixed(1)}</td><td>{s.maxDepth} m</td></tr> })}</tbody></table>}</section>
    <section id="certificaciones" className="rounded-xl bg-white p-4 shadow-sm"><h2 className="mb-3 font-semibold text-deep">Certificaciones y titulaciones</h2>
      {!certs?.length ? <p className="mb-3 text-sm text-slate-500">Aún no has añadido ninguna.</p> : <ul className="mb-4 divide-y text-sm">{certs.map((c) => <li key={c.id} className="flex items-center justify-between gap-2 py-2"><div><b>{c.title}</b> · {c.issuer}<div className="text-xs text-slate-500">Obtenida {c.obtained_on}{c.expires_on ? ` · caduca ${c.expires_on}${c.expires_on < today ? ' (CADUCADA)' : ''}` : ''}{c.cert_number ? ` · nº ${c.cert_number}` : ''}</div></div>
        <form action={deleteCert}><input type="hidden" name="id" value={c.id} /><button className="text-red-700">Eliminar</button></form></li>)}</ul>}
      <form action={addCert} className="grid gap-2 sm:grid-cols-2"><input name="title" required placeholder="Titulación *" className="input" /><input name="issuer" required placeholder="Organismo emisor *" className="input" />
        <label className="text-xs text-slate-500">Fecha de obtención *<input name="obtained_on" type="date" required className="input" /></label><label className="text-xs text-slate-500">Caducidad (si existe)<input name="expires_on" type="date" className="input" /></label>
        <input name="cert_number" placeholder="Nº de certificación (opcional)" className="input" /><button className="btn sm:w-40">Añadir</button></form></section></div>
}
