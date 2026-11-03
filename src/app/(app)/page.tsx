import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fetchAll, summarize, monthly, MONTHS } from '@/lib/filters'
import Icon from '@/components/icon'
export default async function Dashboard(props: { searchParams: Promise<{ year?: string }> }) {
  const sp = await props.searchParams
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  const uid = user!.id
  let all: any[]
  try { all = await fetchAll(() => sb.from('dives').select('id, dive_number, dive_date, site, duration_min, max_depth_m').eq('user_id', uid).order('dive_date').order('id')) }
  catch (e: any) { return <p className="text-red-700">Error al cargar datos: {e.message}</p> }
  const [{ data: me }, { data: certs }] = await Promise.all([
    sb.from('profiles').select('full_name').eq('id', uid).single(),
    sb.from('certifications').select('title, expires_on').eq('user_id', uid).not('expires_on', 'is', null).order('expires_on')])
  const cur = String(new Date().getFullYear()), year = sp.year || cur
  const years = [...new Set([cur, ...all.map((d) => d.dive_date.slice(0, 4))])].sort().reverse()
  const t = summarize(all), y = summarize(all.filter((d) => d.dive_date.startsWith(year))), m = monthly(all, year), top = Math.max(1, ...m.map((x) => x.n))
  const recent = [...all].sort((a, b) => b.dive_date.localeCompare(a.dive_date) || (b.dive_number ?? 0) - (a.dive_number ?? 0)).slice(0, 5)
  const limit = new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10), soon = (certs ?? []).filter((c) => c.expires_on && c.expires_on <= limit)
  const first = me?.full_name?.split(' ')[0] || 'buceador'
  const stats: [string, string | number, string, string][] = [['Inmersiones', t.n, `${y.n} en ${year}`, 'list'], ['Horas bajo el agua', t.hours.toFixed(1), `${y.hours.toFixed(1)} h en ${year}`, 'sun'], ['Profundidad máxima', t.maxDepth !== null ? `${t.maxDepth} m` : '—', t.avg !== null ? `Media: ${t.avg} min` : 'Sin datos', 'down'], ['Última inmersión', t.last ?? '—', t.first ? `Desde ${t.first}` : 'Sin datos', 'check']]
  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow capitalize">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Madrid' })}</p>
      <h1 className="display mt-1">Hola, {first} <span className="wave">👋</span></h1></div><Link href="/dives/new" className="btn hidden sm:inline-flex"><Icon name="plus" className="h-5 w-5" />Nueva inmersión</Link></header>
    {soon.length > 0 && <Link href="/profile#certificaciones" className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800"><Icon name="award" className="h-5 w-5 shrink-0" /><span>Tienes {soon.length} {soon.length === 1 ? 'certificación' : 'certificaciones'} caducada o a punto de caducar. <b>Revisar</b></span></Link>}
    {!all.length ? <section className="bg-white rounded-2xl p-8 text-center"><div className="tint mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full"><Icon name="plus" className="h-8 w-8" /></div>
        <h2 className="text-xl font-bold text-navy">Registra tu primera inmersión</h2><p className="mx-auto mt-2 max-w-md text-slate-500">Aquí verás tus horas, tu profundidad máxima y tu evolución mes a mes.</p><Link href="/dives/new" className="btn mt-5">Empezar</Link></section> : <>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([k, v, s, ic]) => <div key={k} className="bg-white card-lift rounded-2xl p-5"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{k}</span><span className="tint grid h-9 w-9 place-items-center rounded-full"><Icon name={ic} className="h-4 w-4" /></span></div>
      <div className="mt-3 text-4xl font-extrabold tracking-tight text-navy">{v}</div><div className="mt-1 text-sm text-slate-500">{s}</div></div>)}</section>
    <section className="bg-white rounded-2xl p-5 md:p-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-navy">Actividad de {year}</h2><p className="text-sm text-slate-500">Inmersiones por mes. Pulsa una barra para ver sus inmersiones.</p></div>
      <div className="flex flex-wrap gap-1.5">{years.map((a) => <Link key={a} href={`/?year=${a}`} className={`chip ${a === year ? 'chip-on' : ''}`}>{a}</Link>)}</div></div>
      <div className="flex h-48 items-end gap-2 sm:gap-3">{m.map((x, i) => <Link key={i} href={`/dives?year=${year}&month=${i + 1}`} className="group flex h-full flex-1 flex-col items-center justify-end text-xs" title={`${MONTHS[i]}: ${x.n} inmersiones, ${x.hours.toFixed(1)} h`}>
        <span className="mb-1 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">{x.n}</span><div className="bar-v bar-grow w-full" style={{ height: `${(x.n / top) * 100}%`, minHeight: x.n ? 8 : 4, opacity: x.n ? 1 : 0.25, animationDelay: `${i * 45}ms` }} /><span className="mt-2 text-slate-500">{MONTHS[i].slice(0, 3)}</span></Link>)}</div></section>
    <section className="bg-white rounded-2xl p-5 md:p-6"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold text-navy">Últimas inmersiones</h2><Link href="/dives" className="text-sm font-semibold text-teal-dark">Ver todas →</Link></div>
      <ul className="divide-y">{recent.map((d) => <li key={d.id}><Link href={`/dives/${d.id}?from=%2F`} className="flex items-center gap-4 rounded-xl px-2 py-3 hover:bg-[var(--tint)]"><span className="tint grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold">{d.dive_number}</span>
        <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-navy">{d.site}</span><span className="block text-sm text-slate-500">{d.dive_date}</span></span><span className="text-right text-sm text-slate-500"><span className="block font-semibold text-navy">{d.max_depth_m} m</span>{d.duration_min} min</span></Link></li>)}</ul></section></>}
  </div>
}
