import { createClient } from '@/lib/supabase/server'
import { fetchAll, summarize } from '@/lib/filters'
import Icon from '@/components/icon'
import { Msg } from '../../auth-shell'
import { saveProfile, addCert, deleteCert } from './actions'
import PhotoUploader from './photo-uploader'
export default async function Profile(props: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const searchParams = await props.searchParams
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  const uid = user!.id
  const { data: p } = await sb.from('profiles').select('full_name, specialty, organization, avatar_path, role').eq('id', uid).single()
  const { data: certs } = await sb.from('certifications').select('*').eq('user_id', uid).order('obtained_on', { ascending: false })
  const all = await fetchAll(() => sb.from('dives').select('dive_date, duration_min, max_depth_m').eq('user_id', uid).order('dive_date').order('id'))
  const { data: photos } = await sb.from('profile_photos').select('path, status, reject_reason').eq('user_id', uid).order('created_at', { ascending: false }).limit(1)
  const last = photos?.[0], isAdmin = p?.role === 'admin'
  const url = async (path?: string | null) => (path ? (await sb.storage.from('avatars').createSignedUrl(path, 3600)).data?.signedUrl || undefined : undefined)
  const photo = await url(p?.avatar_path), pendingUrl = last?.status === 'pending' ? await url(last.path) : undefined
  const t = summarize(all), years = [...new Set(all.map((d) => d.dive_date.slice(0, 4)))].sort().reverse()
  const byYear = years.map((y) => ({ y, ...summarize(all.filter((d) => d.dive_date.startsWith(y))) })), maxH = Math.max(1, ...byYear.map((r) => r.hours))
  const today = new Date().toISOString().slice(0, 10)
  const tiles: [string, string | number][] = [['Inmersiones', t.n], ['Horas', t.hours.toFixed(1)], ['Prof. máxima', t.maxDepth !== null ? `${t.maxDepth} m` : '—'], ['Duración media', t.avg !== null ? `${t.avg} min` : '—'], ['Primera', t.first ?? '—'], ['Última', t.last ?? '—']]
  return <div className="space-y-6">
    <header><p className="eyebrow">Mi perfil</p><h1 className="display mt-2">Ficha del buceador</h1></header>
    <Msg error={searchParams.error} ok={searchParams.ok} />
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(16rem,22rem)_1fr]">
      <aside className="rounded-xl bg-white p-5 text-center lg:sticky lg:top-6">
        <div className="relief mx-auto aspect-square w-full max-w-[20rem] overflow-hidden rounded-2xl">{photo ? <img src={photo} alt="Tu fotografía" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-slate-500"><Icon name="user" className="h-24 w-24 opacity-50" /></div>}</div>
        <h2 className="font-display mt-5 text-2xl font-semibold text-navy">{p?.full_name || 'Sin nombre'}</h2>
        <p className="mt-1 text-sm text-slate-500">{[p?.specialty, p?.organization].filter(Boolean).join(' · ') || 'Completa tus datos para personalizar la ficha'}</p>
        <div className="mt-4"><PhotoUploader hasPhoto={!!photo} /></div>
        {!isAdmin && last?.status === 'pending' && <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">⏳ Foto pendiente de aprobación del profesor.{pendingUrl && <img src={pendingUrl} alt="" className="mx-auto mt-2 h-14 w-14 rounded-full object-cover" />}</p>}
        {!isAdmin && last?.status === 'rejected' && <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">Foto rechazada{last.reject_reason ? `: ${last.reject_reason}` : '.'} Sube otra.</p>}
        {!isAdmin && !last && !photo && <p className="mt-3 text-xs text-slate-500">El profesor debe aprobar tu foto antes de que sea visible.</p>}
      </aside>
      <div className="min-w-0 space-y-6">
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{tiles.map(([k, v]) => <div key={k} className="card-lift rounded-xl bg-white p-4"><div className="eyebrow">{k}</div><div className="mt-2 text-2xl font-light tracking-tight text-navy">{v}</div></div>)}</section>
        <section className="rounded-xl bg-white p-5"><h2 className="mb-4 font-semibold text-deep">Datos personales</h2>
          <form action={saveProfile} className="fit-grid items-end"><label className="block text-sm"><span className="mb-1 block text-slate-500">Nombre y apellidos *</span><input name="full_name" required defaultValue={p?.full_name} className="input" /></label>
            <label className="block text-sm"><span className="mb-1 block text-slate-500">Especialidad o función</span><input name="specialty" defaultValue={p?.specialty ?? ''} className="input" /></label>
            <label className="block text-sm"><span className="mb-1 block text-slate-500">Centro formativo o empresa</span><input name="organization" defaultValue={p?.organization ?? ''} className="input" /></label>
            <div><button className="btn">Guardar cambios</button></div></form></section>
        <section className="rounded-xl bg-white p-5"><h2 className="mb-4 font-semibold text-deep">Evolución por años</h2>
          {!byYear.length ? <p className="text-sm text-slate-500">Cuando registres inmersiones verás aquí tu evolución.</p> :
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Año</th><th>Inmersiones</th><th className="w-1/2">Horas</th><th>Prof. máx.</th></tr></thead>
              <tbody>{byYear.map((r) => <tr key={r.y} className="border-t"><td className="p-2 mono">{r.y}</td><td>{r.n}</td>
                <td><div className="flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"><div className="bar-grow bar-h h-full" style={{ width: `${(r.hours / maxH) * 100}%`, transformOrigin: 'left' }} /></div><span className="w-14 text-right text-xs">{r.hours.toFixed(1)} h</span></div></td><td>{r.maxDepth} m</td></tr>)}</tbody></table></div>}</section>
        <section id="certificaciones" className="rounded-xl bg-white p-5"><h2 className="mb-4 font-semibold text-deep">Certificaciones y titulaciones</h2>
          {!certs?.length ? <p className="mb-4 text-sm text-slate-500">Aún no has añadido ninguna.</p> : <ul className="mb-5 grid gap-3 md:grid-cols-2">{certs.map((c) => <li key={c.id} className="flex items-start justify-between gap-3 rounded-xl border p-3 text-sm">
            <div><div className="font-medium text-navy">{c.title}</div><div className="text-slate-500">{c.issuer}</div><div className="mt-1 text-xs text-slate-500">Obtenida {c.obtained_on}{c.expires_on ? ` · caduca ${c.expires_on}${c.expires_on < today ? ' (CADUCADA)' : ''}` : ''}{c.cert_number ? ` · nº ${c.cert_number}` : ''}</div></div>
            <form action={deleteCert}><input type="hidden" name="id" value={c.id} /><button className="pill !px-2.5 !py-1 text-xs text-red-700">Quitar</button></form></li>)}</ul>}
          <form action={addCert} className="fit-grid items-end"><input name="title" required placeholder="Titulación *" className="input" /><input name="issuer" required placeholder="Organismo emisor *" className="input" />
            <label className="block text-xs text-slate-500">Fecha de obtención *<input name="obtained_on" type="date" required className="input mt-1" /></label><label className="block text-xs text-slate-500">Caducidad (si existe)<input name="expires_on" type="date" className="input mt-1" /></label>
            <input name="cert_number" placeholder="Nº de certificación (opcional)" className="input" /><div><button className="btn">Añadir certificación</button></div></form></section>
      </div></div></div>
}
