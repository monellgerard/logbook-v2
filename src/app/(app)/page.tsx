
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
    <div className="space-y-4 sm:space-y-8">

      {/* CABECERA PRINCIPAL */}

      <section className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[var(--g2)] opacity-10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[var(--accent)] opacity-10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 sm:mb-3">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)] sm:text-xs sm:tracking-[0.18em]">
                {today}
              </p>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--title)] sm:text-4xl">
              {t.greeting}, {first} <span>👋</span>
            </h1>

            <p className="mt-2 max-w-lg text-xs leading-5 text-[var(--muted)] sm:mt-3 sm:text-base sm:leading-6">
              {t.intro}
            </p>
          </div>

          <Link
            href="/dives/new"
            className="btn inline-flex shrink-0 self-start items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-lg transition hover:-translate-y-0.5 sm:px-5 sm:py-3 sm:text-base"
          >
            <Icon name="plus" className="h-4 w-4 sm:h-5 sm:w-5" />
            {t.newDive}
          </Link>
        </div>

        <div className="relative mt-4 flex flex-wrap gap-2 border-t border-[var(--line)] pt-3 sm:mt-7 sm:pt-5">
          <span className="rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-2.5 py-1 text-[10px] font-semibold text-[var(--accent)] sm:px-3 sm:py-1.5 sm:text-xs">
            LogBook · {t.tagline}
          </span>
          <span className="rounded-full border border-[var(--line)] bg-[var(--tint)] px-2.5 py-1 text-[10px] font-medium text-[var(--muted)] sm:px-3 sm:py-1.5 sm:text-xs">
            {total.n} {t.registered}
          </span>
        </div>
      </section>

      {/* AVISO DE CERTIFICACIONES */}

      {soon.length > 0 && (
        <Link
          href="/profile#certificaciones"
          className="group flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 transition hover:bg-amber-400/15 sm:gap-4 sm:p-4"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-400/15 text-amber-500 sm:h-11 sm:w-11">
            <Icon name="award" className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-amber-600 sm:text-base">
              {t.certifications}
            </span>
            <span className="mt-1 block text-xs text-[var(--muted)] sm:text-sm">
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

        <section className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 text-center shadow-[var(--shadow)] backdrop-blur-xl sm:rounded-3xl sm:p-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[var(--g2)] opacity-10 blur-3xl" />

          <div className="relative mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)] sm:mb-6 sm:h-20 sm:w-20 sm:rounded-3xl">
            <Icon name="plus" className="h-8 w-8 sm:h-9 sm:w-9" />
          </div>

          <h2 className="relative text-xl font-extrabold text-[var(--title)] sm:text-2xl">
            {t.emptyTitle}
          </h2>

          <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
            {t.emptyText}
          </p>

          <Link href="/dives/new" className="btn relative mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold sm:mt-7 sm:px-6 sm:py-3 sm:text-base">
            <Icon name="plus" className="h-5 w-5" />
            {t.firstDive}
          </Link>
        </section>

      ) : (

        <>
          {/* ESTADÍSTICAS */}

          <section>
            <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)] sm:text-xs">
                  {t.history}
                </p>
                <h2 className="mt-1 text-lg font-extrabold text-[var(--title)] sm:text-xl">
                  {t.general}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-4 2xl:grid-cols-4">
              {stats.map(([label, value, subtitle, icon]) => (
                <article
                  key={label}
                  className="group relative min-w-0 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[var(--shadow)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/40 sm:rounded-2xl sm:p-5"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[var(--accent)] opacity-[0.07] blur-2xl transition group-hover:opacity-20" />

                  <div className="relative flex min-w-0 items-center justify-between gap-1 sm:gap-3">
                    <span className="min-w-0 text-xs font-semibold leading-4 text-[var(--muted)] sm:text-sm">
                      {label}
                    </span>

                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)] transition group-hover:scale-105 sm:h-11 sm:w-11 sm:rounded-xl">
                      <Icon name={icon} className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                  </div>

                  <div className="relative mt-3 min-w-0 sm:mt-5">
                    <p className="break-words text-xl font-extrabold tracking-tight text-[var(--title)] sm:text-3xl 2xl:text-4xl">
                      {value}
                    </p>
                    <p className="mt-1 break-words text-[10px] font-medium leading-4 text-[var(--muted)] sm:mt-2 sm:text-xs">
                      {subtitle}
                    </p>
                  </div>

                  <div className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-[var(--g1)] to-[var(--g2)] opacity-60 transition group-hover:opacity-100 sm:left-5 sm:right-5" />
                </article>
              ))}
            </div>
          </section>

          {/* ACTIVIDAD ANUAL */}

          <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[var(--shadow)] backdrop-blur-xl sm:rounded-3xl sm:p-7">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start sm:gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)] sm:text-xs">
                  {t.statistics}
                </p>
                <h2 className="mt-1 text-lg font-extrabold text-[var(--title)] sm:text-2xl">
                  {t.activity} {year}
                </h2>
                <p className="mt-1 text-xs text-[var(--muted)] sm:mt-2 sm:text-sm">
                  {t.evolution}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {years.map((a) => (
                  <Link
                    key={a}
                    href={`/?year=${a}`}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold transition sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm ${
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

            <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-7 sm:grid-cols-3 sm:gap-3">
              <div className="rounded-xl border border-[var(--line)] bg-[var(--tint)] p-3 sm:rounded-2xl sm:p-4">
                <p className="text-[10px] font-semibold text-[var(--muted)] sm:text-xs">
                  {t.dives}
                </p>
                <p className="mt-1 text-xl font-extrabold text-[var(--title)] sm:mt-2 sm:text-2xl">
                  {y.n}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--line)] bg-[var(--tint)] p-3 sm:rounded-2xl sm:p-4">
                <p className="text-[10px] font-semibold text-[var(--muted)] sm:text-xs">
                  {t.hours}
                </p>
                <p className="mt-1 text-xl font-extrabold text-[var(--title)] sm:mt-2 sm:text-2xl">
                  {y.hours.toFixed(1)} <span className="text-sm">h</span>
                </p>
              </div>

              <div className="col-span-2 rounded-xl border border-[var(--line)] bg-[var(--tint)] p-3 sm:col-span-1 sm:rounded-2xl sm:p-4">
                <p className="text-[10px] font-semibold text-[var(--muted)] sm:text-xs">
                  {t.maxDepth}
                </p>
                <p className="mt-1 text-xl font-extrabold text-[var(--title)] sm:mt-2 sm:text-2xl">
                  {y.maxDepth !== null ? `${y.maxDepth} m` : '—'}
                </p>
              </div>
            </div>

            {/* GRÁFICO */}

            <div className="mt-6 sm:mt-8">
              <div className="flex h-36 items-end gap-1 border-b border-[var(--line)] pb-1 sm:h-48 sm:gap-3">
                {m.map((x, i) => {
                  const height = x.n ? Math.max((x.n / top) * 100, 8) : 2

                  return (
                    <Link
                      key={i}
                      href={`/dives?year=${year}&month=${i + 1}`}
                      title={`${t.months[i]}: ${x.n} ${t.dives.toLowerCase()}, ${x.hours.toFixed(1)} h`}
                      className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                    >
                      <span className="mb-1 text-xs font-bold text-[var(--accent)] opacity-0 transition group-hover:opacity-100 sm:mb-2">
                        {x.n || ''}
                      </span>

                      <div className="flex h-full w-full items-end justify-center">
                        <div
                          className="w-full max-w-10 rounded-t-md transition-all duration-300 group-hover:brightness-125 sm:rounded-t-lg"
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

                      <span className="mt-2 text-[9px] font-semibold text-[var(--muted)] sm:mt-3 sm:text-xs">
                        {t.months[i].slice(0, 3)}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>

            <p className="mt-3 text-center text-[10px] text-[var(--muted)] sm:mt-4 sm:text-xs">
              {t.selectMonth}
            </p>
          </section>

          {/* ÚLTIMAS INMERSIONES */}

          <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] backdrop-blur-xl sm:rounded-3xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] p-4 sm:gap-3 sm:p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)] sm:text-xs">
                  {t.recentActivity}
                </p>
                <h2 className="mt-1 text-lg font-extrabold text-[var(--title)] sm:text-xl">
                  {t.latestDives}
                </h2>
                <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
                  {t.fiveRecent}
                </p>
              </div>

              <Link
                href="/dives"
                className="rounded-lg border border-[var(--line)] bg-[var(--tint)] px-3 py-2 text-xs font-bold text-[var(--accent)] transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/10 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
              >
                {t.seeAll} →
              </Link>
            </div>

            <ul className="divide-y divide-[var(--line)]">
              {recent.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/dives/${d.id}?from=%2F`}
                    className="group flex items-center gap-2 px-3 py-3 transition hover:bg-[var(--tint)] sm:gap-4 sm:px-6 sm:py-4"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-xs font-extrabold text-[var(--accent)] transition group-hover:scale-105 sm:h-12 sm:w-12 sm:rounded-2xl sm:text-sm">
                      {d.dive_number}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-[var(--title)] transition group-hover:text-[var(--accent)] sm:text-base">
                        {d.site || t.unknownLocation}
                      </span>
                      <span className="mt-1 block text-[10px] text-[var(--muted)] sm:text-xs">
                        {formatDate(d.dive_date)}
                      </span>
                    </span>

                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-extrabold text-[var(--title)] sm:text-base">
                        {d.max_depth_m ?? '—'} m
                      </span>
                      <span className="mt-1 block text-[10px] text-[var(--muted)] sm:text-xs">
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

            <div className="border-t border-[var(--line)] p-3 text-center sm:hidden">
              <Link
                href="/dives"
                className="text-xs font-bold text-[var(--accent)]"
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
