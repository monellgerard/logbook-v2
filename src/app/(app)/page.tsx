
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fetchAll, summarize, monthly } from '@/lib/filters'
import Icon from '@/components/icon'

const translations = {
  ca: {
    greeting: 'Hola',
    diver: 'bussejador',
    today: 'long',
    intro: 'Cada immersió explica una història. Consulta la teva activitat, controla els teus registres i segueix la teva evolució com a bussejador.',
    newDive: 'Nova immersió',
    tagline: 'El teu diari de busseig',
    registered: 'immersions registrades',
    certifications: 'Revisa les teves certificacions',
    certificationOne: 'certificació caducada o pròxima a caducar.',
    certificationMany: 'certificacions caducades o pròximes a caducar.',
    emptyTitle: 'La teva pròxima aventura comença aquí',
    emptyText: 'Registra la teva primera immersió i comença a construir el teu historial de busseig. Aquí podràs consultar les teves estadístiques i la teva evolució.',
    firstDive: 'Registrar la primera immersió',
    history: 'El teu historial',
    general: 'Resum general',
    dives: 'Immersions',
    hours: 'Hores sota l’aigua',
    maxDepth: 'Profunditat màxima',
    lastDive: 'Última immersió',
    during: 'durant',
    average: 'Mitjana',
    minutes: 'min',
    noData: 'Sense dades',
    since: 'Des de',
    statistics: 'Estadístiques',
    activity: 'Activitat de',
    evolution: 'Evolució de les teves immersions durant l’any.',
    selectMonth: 'Selecciona un mes per consultar les seves immersions.',
    recentActivity: 'La teva activitat recent',
    latestDives: 'Últimes immersions',
    fiveRecent: 'Els teus cinc registres més recents.',
    seeAll: 'Veure totes',
    seeAllDives: 'Consultar totes les immersions',
    unknownLocation: 'Ubicació no indicada',
    loadError: 'Error en carregar les dades',
    months: ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'],
    locale: 'ca-ES',
  },
  es: {
    greeting: 'Hola',
    diver: 'buceador',
    today: 'long',
    intro: 'Cada inmersión cuenta una historia. Consulta tu actividad, controla tus registros y sigue tu evolución como buceador.',
    newDive: 'Nueva inmersión',
    tagline: 'Tu diario de buceo',
    registered: 'inmersiones registradas',
    certifications: 'Revisa tus certificaciones',
    certificationOne: 'certificación caducada o próxima a caducar.',
    certificationMany: 'certificaciones caducadas o próximas a caducar.',
    emptyTitle: 'Tu próxima aventura empieza aquí',
    emptyText: 'Registra tu primera inmersión y empieza a construir tu historial de buceo. Aquí podrás consultar tus estadísticas y tu evolución.',
    firstDive: 'Registrar primera inmersión',
    history: 'Tu historial',
    general: 'Resumen general',
    dives: 'Inmersiones',
    hours: 'Horas bajo el agua',
    maxDepth: 'Profundidad máxima',
    lastDive: 'Última inmersión',
    during: 'durante',
    average: 'Media',
    minutes: 'min',
    noData: 'Sin datos',
    since: 'Desde',
    statistics: 'Estadísticas',
    activity: 'Actividad de',
    evolution: 'Evolución de tus inmersiones durante el año.',
    selectMonth: 'Selecciona un mes para consultar sus inmersiones.',
    recentActivity: 'Tu actividad reciente',
    latestDives: 'Últimas inmersiones',
    fiveRecent: 'Tus cinco registros más recientes.',
    seeAll: 'Ver todas',
    seeAllDives: 'Consultar todas las inmersiones',
    unknownLocation: 'Ubicación no indicada',
    loadError: 'Error al cargar los datos',
    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    locale: 'es-ES',
  },
  en: {
    greeting: 'Hello',
    diver: 'diver',
    today: 'long',
    intro: 'Every dive tells a story. Review your activity, manage your logs and track your progress as a diver.',
    newDive: 'New dive',
    tagline: 'Your diving logbook',
    registered: 'dives logged',
    certifications: 'Check your certifications',
    certificationOne: 'certification has expired or is about to expire.',
    certificationMany: 'certifications have expired or are about to expire.',
    emptyTitle: 'Your next adventure starts here',
    emptyText: 'Log your first dive and start building your diving history. Here you can check your statistics and track your progress.',
    firstDive: 'Log your first dive',
    history: 'Your history',
    general: 'Overall summary',
    dives: 'Dives',
    hours: 'Hours underwater',
    maxDepth: 'Maximum depth',
    lastDive: 'Last dive',
    during: 'in',
    average: 'Average',
    minutes: 'min',
    noData: 'No data',
    since: 'Since',
    statistics: 'Statistics',
    activity: 'Activity in',
    evolution: 'Your diving activity throughout the year.',
    selectMonth: 'Select a month to view its dives.',
    recentActivity: 'Your recent activity',
    latestDives: 'Latest dives',
    fiveRecent: 'Your five most recent logs.',
    seeAll: 'View all',
    seeAllDives: 'View all dives',
    unknownLocation: 'Location not specified',
    loadError: 'Error loading data',
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    locale: 'en-GB',
  },
}

export default async function Dashboard(props: {
  searchParams: Promise<{ year?: string }>
}) {
  const sp = await props.searchParams
  const sb = createClient()

  const {
    data: { user },
  } = await sb.auth.getUser()

  const uid = user!.id

  const [{ data: me }, { data: certs }] = await Promise.all([
    sb.from('profiles')
      .select('full_name, language')
      .eq('id', uid)
      .single(),

    sb.from('certifications')
      .select('title, expires_on')
      .eq('user_id', uid)
      .not('expires_on', 'is', null)
      .order('expires_on'),
  ])

  const language = me?.language || 'ca'
  const t =
    translations[language as keyof typeof translations] || translations.ca

  const locale = t.locale

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
      <p className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-red-500">
        {t.loadError}: {e.message}
      </p>
    )
  }

  const cur = String(new Date().getFullYear())
  const year = sp.year || cur

  const years = [
    ...new Set([cur, ...all.map((d) => d.dive_date.slice(0, 4))]),
  ].sort().reverse()

  const total = summarize(all)
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

  const first = me?.full_name?.split(' ')[0] || t.diver

  const formatDate = (date: string) => {
    if (!date) return '—'

    const parsed = new Date(`${date.slice(0, 10)}T12:00:00`)

    return parsed.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const today = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Madrid',
  })

  const stats: [string, string | number, string, string][] = [
    [t.dives, total.n, `${y.n} ${t.during} ${year}`, 'list'],
    [t.hours, total.hours.toFixed(1), `${y.hours.toFixed(1)} h ${t.during} ${year}`, 'sun'],
    [
      t.maxDepth,
      total.maxDepth !== null ? `${total.maxDepth} m` : '—',
      total.avg !== null ? `${t.average}: ${total.avg} ${t.minutes}` : t.noData,
      'down',
    ],
    [
      t.lastDive,
      total.last ? formatDate(total.last) : '—',
      total.first ? `${t.since} ${formatDate(total.first)}` : t.noData,
      'check',
    ],
  ]

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* CABECERA PRINCIPAL */}

      <section className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[var(--g2)] opacity-10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[var(--accent)] opacity-10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]" />
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
                {today}
              </p>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--title)] sm:text-4xl">
              {t.greeting}, {first} <span>👋</span>
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--muted)] sm:text-base">
              {t.intro}
            </p>
          </div>

          <Link
            href="/dives/new"
            className="btn inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold shadow-lg transition hover:-translate-y-0.5"
          >
            <Icon name="plus" className="h-5 w-5" />
            {t.newDive}
          </Link>
        </div>

        <div className="relative mt-7 flex flex-wrap gap-2 border-t border-[var(--line)] pt-5">
          <span className="rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--accent)]">
            LogBook · {t.tagline}
          </span>
          <span className="rounded-full border border-[var(--line)] bg-[var(--tint)] px-3 py-1.5 text-xs font-medium text-[var(--muted)]">
            {total.n} {t.registered}
          </span>
        </div>
      </section>

      {/* AVISO DE CERTIFICACIONES */}

      {soon.length > 0 && (
        <Link
          href="/profile#certificaciones"
          className="group flex items-center gap-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 transition hover:bg-amber-400/15"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-400/15 text-amber-500">
            <Icon name="award" className="h-5 w-5" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block font-bold text-amber-600">
              {t.certifications}
            </span>
            <span className="mt-1 block text-sm text-[var(--muted)]">
              {soon.length} {soon.length === 1 ? t.certificationOne : t.certificationMany}
            </span>
          </span>

          <span className="text-sm font-bold text-amber-600 transition group-hover:translate-x-1">
            →
          </span>
        </Link>
      )}

      {!all.length ? (

        /* ESTADO SIN INMERSIONES */

        <section className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow)] backdrop-blur-xl sm:p-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[var(--g2)] opacity-10 blur-3xl" />

          <div className="relative mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)]">
            <Icon name="plus" className="h-9 w-9" />
          </div>

          <h2 className="relative text-2xl font-extrabold text-[var(--title)]">
            {t.emptyTitle}
          </h2>

          <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
            {t.emptyText}
          </p>

          <Link href="/dives/new" className="btn relative mt-7 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold">
            <Icon name="plus" className="h-5 w-5" />
            {t.firstDive}
          </Link>
        </section>

      ) : (

        <>
          {/* ESTADÍSTICAS */}

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
                  {t.history}
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-[var(--title)]">
                  {t.general}
                </h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {stats.map(([label, value, subtitle, icon]) => (
                <article
                  key={label}
                  className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/40"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[var(--accent)] opacity-[0.07] blur-2xl transition group-hover:opacity-20" />

                  <div className="relative flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-[var(--muted)]">
                      {label}
                    </span>

                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)] transition group-hover:scale-105">
                      <Icon name={icon} className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="relative mt-5">
                    <p className="break-words text-3xl font-extrabold tracking-tight text-[var(--title)] sm:text-4xl">
                      {value}
                    </p>
                    <p className="mt-2 text-xs font-medium text-[var(--muted)]">
                      {subtitle}
                    </p>
                  </div>

                  <div className="absolute bottom-0 left-5 right-5 h-[2px] rounded-full bg-gradient-to-r from-[var(--g1)] to-[var(--g2)] opacity-60 transition group-hover:opacity-100" />
                </article>
              ))}
            </div>
          </section>

          {/* ACTIVIDAD ANUAL */}

          <section className="overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl sm:p-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
                  {t.statistics}
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-[var(--title)] sm:text-2xl">
                  {t.activity} {year}
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {t.evolution}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {years.map((a) => (
                  <Link
                    key={a}
                    href={`/?year=${a}`}
                    className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${
                      a === year
                        ? 'border-[var(--accent)]/40 bg-[var(--accent)]/15 text-[var(--accent)] shadow-sm'
                        : 'border-[var(--line)] bg-[var(--tint)] text-[var(--muted)] hover:border-[var(--accent)]/30 hover:text-[var(--title)]'
                    }`}
                  >
                    {a}
                  </Link>
                ))}
              </div>
            </div>

            {/* RESUMEN DEL AÑO */}

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--tint)] p-4">
                <p className="text-xs font-semibold text-[var(--muted)]">
                  {t.dives}
                </p>
                <p className="mt-2 text-2xl font-extrabold text-[var(--title)]">
                  {y.n}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--line)] bg-[var(--tint)] p-4">
                <p className="text-xs font-semibold text-[var(--muted)]">
                  {t.hours}
                </p>
                <p className="mt-2 text-2xl font-extrabold text-[var(--title)]">
                  {y.hours.toFixed(1)} <span className="text-sm">h</span>
                </p>
              </div>

              <div className="col-span-2 rounded-2xl border border-[var(--line)] bg-[var(--tint)] p-4 sm:col-span-1">
                <p className="text-xs font-semibold text-[var(--muted)]">
                  {t.maxDepth}
                </p>
                <p className="mt-2 text-2xl font-extrabold text-[var(--title)]">
                  {y.maxDepth !== null ? `${y.maxDepth} m` : '—'}
                </p>
              </div>
            </div>

            {/* GRÁFICO */}

            <div className="mt-8">
              <div className="flex h-48 items-end gap-2 border-b border-[var(--line)] pb-1 sm:gap-3">
                {m.map((x, i) => {
                  const height = x.n ? Math.max((x.n / top) * 100, 8) : 2

                  return (
                    <Link
                      key={i}
                      href={`/dives?year=${year}&month=${i + 1}`}
                      title={`${t.months[i]}: ${x.n} ${t.dives.toLowerCase()}, ${x.hours.toFixed(1)} h`}
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
                            opacity: x.n ? 1 : 0.7,
                          }}
                        />
                      </div>

                      <span className="mt-3 text-[10px] font-semibold text-[var(--muted)] sm:text-xs">
                        {t.months[i].slice(0, 3)}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-[var(--muted)]">
              {t.selectMonth}
            </p>
          </section>

          {/* ÚLTIMAS INMERSIONES */}

          <section className="overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] p-5 sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
                  {t.recentActivity}
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-[var(--title)]">
                  {t.latestDives}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {t.fiveRecent}
                </p>
              </div>

              <Link
                href="/dives"
                className="rounded-xl border border-[var(--line)] bg-[var(--tint)] px-4 py-2.5 text-sm font-bold text-[var(--accent)] transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/10"
              >
                {t.seeAll} →
              </Link>
            </div>

            <ul className="divide-y divide-[var(--line)]">
              {recent.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/dives/${d.id}?from=%2F`}
                    className="group flex items-center gap-3 px-5 py-4 transition hover:bg-[var(--tint)] sm:gap-4 sm:px-6"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-sm font-extrabold text-[var(--accent)] transition group-hover:scale-105">
                      {d.dive_number}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold text-[var(--title)] transition group-hover:text-[var(--accent)]">
                        {d.site || t.unknownLocation}
                      </span>
                      <span className="mt-1 block text-xs text-[var(--muted)]">
                        {formatDate(d.dive_date)}
                      </span>
                    </span>

                    <span className="shrink-0 text-right">
                      <span className="block font-extrabold text-[var(--title)]">
                        {d.max_depth_m ?? '—'} m
                      </span>
                      <span className="mt-1 block text-xs text-[var(--muted)]">
                        {d.duration_min ?? '—'} min
                      </span>
                    </span>

                    <span className="hidden text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)] sm:block">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="border-t border-[var(--line)] p-4 text-center sm:hidden">
              <Link
                href="/dives"
                className="text-sm font-bold text-[var(--accent)]"
              >
                {t.seeAllDives} →
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
