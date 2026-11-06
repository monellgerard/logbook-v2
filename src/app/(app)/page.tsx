
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fetchAll, summarize, monthly, MONTHS } from '@/lib/filters'
import Icon from '@/components/icon'

export default async function Dashboard(props: {
  searchParams: Promise<{ year?: string }>
}) {
  const sp = await props.searchParams
  const sb = createClient()

  const { data: { user } } = await sb.auth.getUser()
  const uid = user!.id

  let all: any[]

  try {
    all = await fetchAll(() =>
      sb.from('dives')
        .select('id, dive_number, dive_date, site, duration_min, max_depth_m')
        .eq('user_id', uid)
        .order('dive_date')
        .order('id')
    )
  } catch (e: any) {
    return (
      <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-500">
        Error al cargar datos: {e.message}
      </p>
    )
  }

  const [{ data: me }, { data: certs }] = await Promise.all([
    sb.from('profiles')
      .select('full_name')
      .eq('id', uid)
      .single(),

    sb.from('certifications')
      .select('title, expires_on')
      .eq('user_id', uid)
      .not('expires_on', 'is', null)
      .order('expires_on')
  ])

  const cur = String(new Date().getFullYear())
  const year = sp.year || cur

  const years = [
    ...new Set([cur, ...all.map((d) => d.dive_date.slice(0, 4))])
  ].sort().reverse()

  const t = summarize(all)
  const y = summarize(all.filter((d) => d.dive_date.startsWith(year)))
  const m = monthly(all, year)
  const top = Math.max(1, ...m.map((x) => x.n))

  const recent = [...all]
    .sort((a, b) =>
      b.dive_date.localeCompare(a.dive_date) ||
      (b.dive_number ?? 0) - (a.dive_number ?? 0)
    )
    .slice(0, 5)

  const limit = new Date(Date.now() + 90 * 864e5)
    .toISOString()
    .slice(0, 10)

  const soon = (certs ?? []).filter(
    (c) => c.expires_on && c.expires_on <= limit
  )

  const first = me?.full_name?.split(' ')[0] || 'buceador'

  const formatDate = (date: string) => {
    if (!date) return '—'

    const parsed = new Date(`${date.slice(0, 10)}T12:00:00`)

    return parsed.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const stats: [string, string | number, string, string][] = [
    ['Inmersiones', t.n, `${y.n} en ${year}`, 'list'],
    ['Horas bajo el agua', t.hours.toFixed(1), `${y.hours.toFixed(1)} h en ${year}`, 'sun'],
    [
      'Profundidad máxima',
      t.maxDepth !== null ? `${t.maxDepth} m` : '—',
      t.avg !== null ? `Media: ${t.avg} min` : 'Sin datos',
      'down'
    ],
    [
      'Última inmersión',
      t.last ? formatDate(t.last) : '—',
      t.first ? `Desde ${formatDate(t.first)}` : 'Sin datos',
      'check'
    ]
  ]

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Madrid'
  })

  return (
    <div className="space-y-7">

      {/* CABECERA */}

      <header className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="mb-2 text-sm font-semibold capitalize tracking-wide text-[var(--accent)]">
            {today}
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--title)] sm:text-4xl">
            Hola, {first} <span>👋</span>
          </h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Tu actividad y evolución como buceador.
          </p>
        </div>

        <Link
          href="/dives/new"
          className="btn hidden items-center gap-2 sm:inline-flex"
        >
          <Icon name="plus" className="h-5 w-5" />
          Nueva inmersión
        </Link>
      </header>

      {/* AVISO DE CERTIFICACIONES */}

      {soon.length > 0 && (
        <Link
          href="/profile#certificaciones"
          className="flex items-center gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-600 transition hover:bg-amber-400/15"
        >
          <Icon name="award" className="h-5 w-5 shrink-0" />

          <span>
            Tienes {soon.length}{' '}
            {soon.length === 1 ? 'certificación' : 'certificaciones'} caducada
            o a punto de caducar. <b>Revisar →</b>
          </span>
        </Link>
      )}

      {!all.length ? (

        /* ESTADO SIN INMERSIONES */

        <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-10 text-center shadow-[var(--shadow)]">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--tint)] text-[var(--accent)]">
            <Icon name="plus" className="h-8 w-8" />
          </div>

          <h2 className="text-2xl font-bold text-[var(--title)]">
            Registra tu primera inmersión
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
            Aquí verás tus horas bajo el agua, tu profundidad máxima y tu
            evolución mes a mes.
          </p>

          <Link href="/dives/new" className="btn mt-6">
            <Icon name="plus" className="h-5 w-5" />
            Empezar
          </Link>
        </section>

      ) : (

        <>
          {/* TARJETAS DE ESTADÍSTICAS */}

          <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {stats.map(([label, value, subtitle, icon]) => (
              <article
                key={label}
                className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/40"
              >
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[var(--accent)] opacity-[0.045] blur-2xl transition group-hover:opacity-[0.12]" />

                <div className="relative flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-[var(--muted)]">
                    {label}
                  </span>

                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-[var(--tint)] text-[var(--accent)]">
                    <Icon name={icon} className="h-5 w-5" />
                  </span>
                </div>

                <div className="relative mt-5 text-4xl font-extrabold tracking-tight text-[var(--title)]">
                  {value}
                </div>

                <p className="relative mt-2 text-sm text-[var(--muted)]">
                  {subtitle}
                </p>

                <div className="absolute bottom-0 left-5 right-5 h-[2px] rounded-full bg-gradient-to-r from-[var(--g1)] to-[var(--g2)] opacity-60" />
              </article>
            ))}
          </section>

          {/* ACTIVIDAD ANUAL */}

          <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />

                  <h2 className="text-xl font-bold text-[var(--title)]">
                    Actividad de {year}
                  </h2>
                </div>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Evolución de tus inmersiones durante el año.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {years.map((a) => (
                  <Link
                    key={a}
                    href={`/?year=${a}`}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      a === year
                        ? 'border-[var(--accent)]/40 bg-[var(--accent)]/15 text-[var(--accent)]'
                        : 'border-[var(--line)] bg-[var(--tint)] text-[var(--muted)] hover:text-[var(--title)]'
                    }`}
                  >
                    {a}
                  </Link>
                ))}
              </div>
            </div>

            {/* RESUMEN DEL AÑO */}

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--line)] bg-[var(--tint)] p-3">
                <p className="text-xs text-[var(--muted)]">Inmersiones</p>
                <p className="mt-1 text-xl font-bold text-[var(--title)]">
                  {y.n}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--line)] bg-[var(--tint)] p-3">
                <p className="text-xs text-[var(--muted)]">Horas bajo el agua</p>
                <p className="mt-1 text-xl font-bold text-[var(--title)]">
                  {y.hours.toFixed(1)} h
                </p>
              </div>

              <div className="col-span-2 rounded-xl border border-[var(--line)] bg-[var(--tint)] p-3 sm:col-span-1">
                <p className="text-xs text-[var(--muted)]">Profundidad máxima</p>
                <p className="mt-1 text-xl font-bold text-[var(--title)]">
                  {y.maxDepth !== null ? `${y.maxDepth} m` : '—'}
                </p>
              </div>
            </div>

            {/* GRÁFICO */}

            <div className="flex h-48 items-end gap-2 border-b border-[var(--line)] pb-1 sm:gap-3">
              {m.map((x, i) => {
                const height = x.n ? Math.max((x.n / top) * 100, 8) : 2

                return (
                  <Link
                    key={i}
                    href={`/dives?year=${year}&month=${i + 1}`}
                    title={`${MONTHS[i]}: ${x.n} inmersiones, ${x.hours.toFixed(1)} h`}
                    className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                  >
                    <span className="mb-2 text-xs font-bold text-[var(--accent)] opacity-0 transition group-hover:opacity-100">
                      {x.n || ''}
                    </span>

                    <div className="flex h-full w-full items-end justify-center">
                      <div
                        className="w-full max-w-10 rounded-t-lg transition-all duration-300 group-hover:brightness-125"
                        style={{
                          height: `${height}%`,
                          minHeight: x.n ? '8px' : '3px',
                          background: x.n
                            ? 'linear-gradient(180deg, #56c7f0 0%, #2677d8 100%)'
                            : 'var(--line)',
                          opacity: x.n ? 1 : 0.7
                        }}
                      />
                    </div>

                    <span className="mt-3 text-[10px] font-medium text-[var(--muted)] sm:text-xs">
                      {MONTHS[i].slice(0, 3)}
                    </span>
                  </Link>
                )
              })}
            </div>

            <p className="mt-4 text-center text-xs text-[var(--muted)]">
              Selecciona un mes para consultar sus inmersiones.
            </p>
          </section>

          {/* ÚLTIMAS INMERSIONES */}

          <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--title)]">
                  Últimas inmersiones
                </h2>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Tus cinco registros más recientes.
                </p>
              </div>

              <Link
                href="/dives"
                className="rounded-xl border border-[var(--line)] bg-[var(--tint)] px-4 py-2 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)]/15"
              >
                Ver todas →
              </Link>
            </div>

            <ul className="divide-y divide-[var(--line)]">
              {recent.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/dives/${d.id}?from=%2F`}
                    className="flex items-center gap-3 px-5 py-4 transition hover:bg-[var(--tint)] sm:gap-4 sm:px-6"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-sm font-bold text-[var(--accent)]">
                      {d.dive_number}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-[var(--title)]">
                        {d.site || 'Ubicación no indicada'}
                      </span>

                      <span className="mt-1 block text-xs text-[var(--muted)]">
                        {formatDate(d.dive_date)}
                      </span>
                    </span>

                    <span className="shrink-0 text-right">
                      <span className="block font-bold text-[var(--title)]">
                        {d.max_depth_m ?? '—'} m
                      </span>

                      <span className="mt-1 block text-xs text-[var(--muted)]">
                        {d.duration_min ?? '—'} min
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
