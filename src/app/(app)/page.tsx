import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fetchAll, summarize, monthly, MONTHS } from '@/lib/filters'
import EquipmentCard from './equipment-card'
export default async function Dashboard(props: { searchParams: Promise<{ year?: string; metric?: string }> }) {
  const searchParams = await props.searchParams
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  const uid = user!.id
  let all: any[]
  try { all = await fetchAll(() => sb.from('dives').select('id, dive_number, dive_date, site, work_task, rating, duration_min, max_depth_m').eq('user_id', uid).order('dive_date').order('id')) }
  catch (e: any) { return <p className="text-red-700">Error al cargar datos: {e.message}</p> }
  const [{ data: me }, eq, { data: certs }] = await Promise.all([
    sb.from('profiles').select('full_name').eq('id', uid).single(),
    sb.from('equipment_items').select('id, name, checked').eq('user_id', uid).order('created_at'),
    sb.from('certifications').select('title, expires_on').eq('user_id', uid).not('expires_on', 'is', null).order('expires_on')])
  const cur = String(new Date().getFullYear()), year = searchParams.year || cur
  const years = [...new Set([cur, ...all.map((d) => d.dive_date.slice(0, 4))])].sort().reverse()
  const t = summarize(all), y = summarize(all.filter((d) => d.dive_date.startsWith(year))), m = monthly(all, year)
  const byDives = searchParams.metric === 'n', mq = byDives ? '&metric=n' : '', val = (x: { n: number; hours: number }) => (byDives ? x.n : x.hours), top = Math.max(1, ...m.map(val))
  const sites = new Map<string, number>(); all.forEach((d) => sites.set(d.site, (sites.get(d.site) ?? 0) + 1))
  const fav = [...sites.entries()].sort((a, b) => b[1] - a[1])[0]
  const rated = all.filter((d) => d.rating != null), avgRating = rated.length ? (rated.reduce((s, d) => s + d.rating, 0) / rated.length).toFixed(1) : '—'
  const avgDepth = all.length ? (all.reduce((s, d) => s + Number(d.max_depth_m), 0) / all.length).toFixed(1) : '—'
  const recent = [...all].sort((a, b) => b.dive_date.localeCompare(a.dive_date) || (b.dive_number ?? 0) - (a.dive_number ?? 0)).slice(0, 5)
  const limit = new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10), today = new Date().toISOString().slice(0, 10)
  const soon = (certs ?? []).filter((c) => c.expires_on && c.expires_on <= limit)
  const cards = [['Inmersiones', t.n], ['Horas totales', t.hours.toFixed(1)], ['Profundidad máx.', t.maxDepth !== null ? `${t.maxDepth} m` : '—'], ['Duración media', t.avg !== null ? `${t.avg} min` : '—'],
    [`Inmersiones ${year}`, y.n], [`Horas ${year}`, y.hours.toFixed(1)], ['Última inmersión', t.last ?? '—'], ['Valoración media', avgRating]]
  return <div className="mx-auto max-w-6xl space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-6 pb-2"><div>
      <p className="eyebrow">Panel · {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid' })}</p>
      <h1 className="display mt-3">Hola, {me?.full_name?.split(' ')[0] || 'buceador'}.</h1>
      <p className="mt-3 max-w-xl text-slate-500">{t.n ? `${t.n} inmersiones y ${t.hours.toFixed(1)} h bajo el agua${t.maxDepth !== null ? `, profundidad máxima ${t.maxDepth} m` : ''}.` : 'Registra tu primera inmersión para empezar tu historial.'}</p></div>
      <div className="flex gap-2"><Link href="/dives/new" className="btn">Nueva inmersión</Link><Link href="/dives" className="pill">Historial</Link></div></header>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map(([k, v]) => <div key={k} className="card-lift rounded-xl bg-white p-4"><div className="eyebrow">{k}</div><div className="mt-2 text-3xl font-light tracking-tight text-navy">{v}</div></div>)}</div>
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2"><div className="mb-3 flex flex-wrap items-center gap-2"><h2 className="font-semibold text-deep">Actividad por meses · {year}</h2>
        <div className="ml-auto flex gap-1 text-sm">{years.map((a) => <Link key={a} href={`/?year=${a}${mq}`} className={`rounded-lg border px-3 py-1 ${a === year ? 'bg-teal-dark text-white' : ''}`}>{a}</Link>)}</div></div>
        <div className="mb-3 flex gap-1 text-sm"><Link href={`/?year=${year}`} className={`rounded-lg border px-3 py-1 ${!byDives ? 'bg-teal-dark text-white' : ''}`}>Horas</Link><Link href={`/?year=${year}&metric=n`} className={`rounded-lg border px-3 py-1 ${byDives ? 'bg-teal-dark text-white' : ''}`}>Inmersiones</Link></div>
        <div className="flex h-44 items-end gap-1 sm:gap-2">{m.map((x, i) => <Link key={i} href={`/dives?year=${year}&month=${i + 1}`} className="flex h-full flex-1 flex-col items-center justify-end text-xs" title={`${MONTHS[i]}: ${x.n} inmersiones, ${x.hours.toFixed(1)} h`}>
          <span className="text-slate-500">{val(x) ? (byDives ? x.n : x.hours.toFixed(1)) : ''}</span><div className="bar-grow bar-v w-full" style={{ height: `${(val(x) / top) * 100}%`, minHeight: x.n ? 4 : 0, animationDelay: `${i * 45}ms` }} /><span className="mt-1 text-slate-500">{MONTHS[i].slice(0, 3)}</span></Link>)}</div></section>
      <EquipmentCard items={eq.data ?? []} error={!!eq.error} detail={eq.error?.message} showLink /></div>
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-deep">Últimas inmersiones</h2><Link href="/dives" className="text-sm text-teal-dark">Ver todas →</Link></div>
        {!recent.length ? <p className="text-sm text-slate-500">Todavía no hay inmersiones.</p> : <ul className="divide-y">{recent.map((d) => <li key={d.id}><Link href={`/dives/${d.id}?from=%2F`} className="flex items-center gap-3 py-2.5 text-sm hover:opacity-80">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal/15 font-semibold text-teal-dark">{d.dive_number}</span><span className="min-w-0 flex-1"><span className="block truncate font-medium">{d.site}</span><span className="block truncate text-xs text-slate-500">{d.dive_date}{d.work_task ? ` · ${d.work_task}` : ''}</span></span>
          <span className="text-right text-xs text-slate-500"><span className="block">{d.max_depth_m} m</span><span className="block">{d.duration_min} min</span></span></Link></li>)}</ul>}</section>
      <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="mb-3 font-semibold text-deep">Resumen</h2>
        <dl className="space-y-2 text-sm"><div className="flex justify-between"><dt className="text-slate-500">Lugar más frecuente</dt><dd className="max-w-[55%] truncate text-right font-medium">{fav ? `${fav[0]} (${fav[1]})` : '—'}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Profundidad media</dt><dd className="font-medium">{avgDepth !== '—' ? `${avgDepth} m` : '—'}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Primera inmersión</dt><dd className="font-medium">{t.first ?? '—'}</dd></div></dl>
        <h3 className="mb-1 mt-4 text-sm font-semibold text-deep">Certificaciones</h3>
        {soon.length ? <ul className="space-y-1 text-sm">{soon.map((c, i) => <li key={i} className={c.expires_on! < today ? 'text-red-700' : 'text-amber-800'}>{c.title}: {c.expires_on! < today ? 'caducada el' : 'caduca el'} {c.expires_on}</li>)}</ul> : <p className="text-sm text-slate-500">Ninguna caduca en los próximos 90 días.</p>}
        <Link href="/profile#certificaciones" className="mt-2 inline-block text-sm text-teal-dark">Gestionar certificaciones →</Link></section></div></div>
}
