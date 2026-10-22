import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fetchAll, summarize, monthly, MONTHS } from '@/lib/filters'
export default async function Dashboard(props: { searchParams: Promise<{ year?: string; metric?: string }> }) {
  const searchParams = await props.searchParams
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  let all: any[]
  try { all = await fetchAll(() => sb.from('dives').select('dive_date, duration_min, max_depth_m').eq('user_id', user!.id).order('dive_date').order('id')) }
  catch (e: any) { return <p className="text-red-700">Error al cargar datos: {e.message}</p> }
  const cur = String(new Date().getFullYear()), year = searchParams.year || cur
  const years = [...new Set([cur, ...all.map((d) => d.dive_date.slice(0, 4))])].sort().reverse()
  const t = summarize(all), y = summarize(all.filter((d) => d.dive_date.startsWith(year))), m = monthly(all, year)
  const byDives = searchParams.metric === 'n', mq = byDives ? '&metric=n' : '', val = (x: { n: number; hours: number }) => (byDives ? x.n : x.hours)
  const top = Math.max(1, ...m.map(val))
  const cards = [['Total inmersiones', t.n], ['Horas totales', t.hours.toFixed(1)], ['Profundidad máx.', t.maxDepth !== null ? `${t.maxDepth} m` : '—'], ['Duración media', t.avg !== null ? `${t.avg} min` : '—'],
    [`Inmersiones ${year}`, y.n], [`Horas ${year}`, y.hours.toFixed(1)], ['Última inmersión', t.last ?? '—']]
  return <><div className="mb-4 flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold text-navy">Mi panel</h1>
    <div className="flex gap-1 text-sm">{years.map((a) => <Link key={a} href={`/?year=${a}${mq}`} className={`rounded-lg border px-3 py-1 ${a === year ? 'bg-teal-dark text-white' : 'bg-white'}`}>{a}</Link>)}</div></div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map(([k, v]) => <div key={k} className="rounded-xl border-l-4 border-teal bg-white p-4 shadow-sm"><div className="text-xs text-slate-500">{k}</div><div className="text-xl font-semibold text-navy">{v}</div></div>)}</div>
    <section className="mt-6 rounded-xl bg-white p-4 shadow-sm"><div className="mb-3 flex flex-wrap items-center gap-2"><h2 className="font-semibold text-deep">Actividad por meses · {year}</h2><div className="ml-auto flex gap-1 text-sm"><Link href={`/?year=${year}`} className={`rounded-lg border px-3 py-1 ${!byDives ? 'bg-teal-dark text-white' : 'bg-white'}`}>Horas</Link><Link href={`/?year=${year}&metric=n`} className={`rounded-lg border px-3 py-1 ${byDives ? 'bg-teal-dark text-white' : 'bg-white'}`}>Inmersiones</Link></div></div>
      <div className="flex h-44 items-end gap-1 sm:gap-2">{m.map((x, i) => <Link key={i} href={`/dives?year=${year}&month=${i + 1}`} className="flex h-full flex-1 flex-col items-center justify-end text-xs" title={`${MONTHS[i]}: ${x.n} inmersiones, ${x.hours.toFixed(1)} h`}>
        <span className="text-slate-500">{val(x) ? (byDives ? x.n : x.hours.toFixed(1)) : ''}</span><div className="w-full rounded-t bg-teal" style={{ height: `${(val(x) / top) * 100}%`, minHeight: x.n ? 4 : 0 }} /><span className="mt-1 text-slate-500">{MONTHS[i].slice(0, 3)}</span></Link>)}</div>
      <p className="mt-2 text-xs text-slate-500">Cada barra muestra {byDives ? "el número de inmersiones" : "las horas de inmersión"} de ese mes. Pulsa un mes para ver sus inmersiones.</p></section>
    <div className="mt-4 flex flex-wrap gap-2"><Link href="/dives/new" className="btn">Nueva inmersión</Link><Link href="/dives" className="rounded-lg border bg-white px-4 py-2">Mi historial</Link><Link href="/profile" className="rounded-lg border bg-white px-4 py-2">Mi ficha</Link><Link href="/profile#certificaciones" className="rounded-lg border bg-white px-4 py-2">Mis certificaciones</Link></div></>
}
