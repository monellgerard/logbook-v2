
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { applyFilters, fetchAll, MONTHS, type P } from '@/lib/filters'
import { OPT } from '@/lib/dive-schema'

const PAGE = 20

const COLS: [string, string][] = [
  ['dive_number', 'Nº'],
  ['dive_date', 'Fecha'],
  ['site', 'Lugar'],
  ['max_depth_m', 'Profundidad'],
  ['duration_min', 'Duración'],
  ['work_task', 'Trabajo'],
  ['rating', 'Valoración'],
]

const translations = {
  ca: {
    activity: 'La meva activitat submarina',
    title: 'Les meves immersions',
    description: 'Consulta, organitza i revisa tot el teu historial de busseig.',
    newDive: 'Nova immersió',
    foundDives: 'Immersions trobades',
    totalDives: 'Total d’immersions',
    records: 'Registres',
    currentFilters: 'amb els filtres actuals',
    inBook: 'al teu llibre',
    underwaterTime: 'Temps sota l’aigua',
    accumulatedHours: 'Hores acumulades',
    thisSelection: 'en aquesta selecció',
    registered: 'registrades',
    searchStatus: 'Estat de la cerca',
    activeFilters: 'Filtres actius',
    filterDives: 'Filtrar immersions',
    filterDescription: 'Data, ubicació, profunditat, gas i valoració',
    active: 'actius',
    year: 'Any',
    allYears: 'Tots els anys',
    month: 'Mes',
    allMonths: 'Tots els mesos',
    from: 'Des de',
    to: 'Fins a',
    place: 'Lloc',
    searchLocation: 'Cerca una ubicació...',
    workType: 'Tipus de feina',
    searchWork: 'Cerca una feina...',
    minDepth: 'Profunditat mínima (m)',
    maxDepth: 'Profunditat màxima (m)',
    example: 'Ex. 10',
    exampleMax: 'Ex. 40',
    gasMix: 'Barreja de gas',
    allGases: 'Tots els gasos',
    minRating: 'Valoració mínima',
    ratingRange: 'De 1 a 10',
    applyFilters: 'Aplicar filtres',
    clearFilters: 'Netejar filtres',
    history: 'Historial d’immersions',
    filteredResults: 'Resultats segons els filtres seleccionats',
    allRegistered: 'Totes les teves immersions registrades',
    export: 'Exportar CSV',
    noResults: 'No hi ha resultats',
    emptyBook: 'El teu llibre d’immersions és buit',
    noMatches: 'No hem trobat immersions que coincideixin amb aquests filtres. Prova de modificar-los.',
    firstDive: 'Quan registris la teva primera immersió, aquí apareixerà tot el teu historial.',
    removeFilters: 'Treure filtres',
    registerDive: 'Registrar immersió',
    modified: 'Modificada des de l’última revisió',
    showing: 'Mostrant',
    of: 'de',
    dives: 'immersions',
    previous: '← Anterior',
    next: 'Següent →',
    error: 'No s’han pogut carregar les immersions:',
    months: [
      'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
      'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre',
    ],
    columns: ['Nº', 'Data', 'Lloc', 'Profunditat', 'Durada', 'Feina', 'Valoració'],
    dateLocale: 'ca-ES',
  },
  es: {
    activity: 'Mi actividad submarina',
    title: 'Mis inmersiones',
    description: 'Consulta, organiza y revisa todo tu historial de buceo.',
    newDive: 'Nueva inmersión',
    foundDives: 'Inmersiones encontradas',
    totalDives: 'Total de inmersiones',
    records: 'Registros',
    currentFilters: 'con los filtros actuales',
    inBook: 'en tu libro',
    underwaterTime: 'Tiempo bajo el agua',
    accumulatedHours: 'Horas acumuladas',
    thisSelection: 'en esta selección',
    registered: 'registradas',
    searchStatus: 'Estado de búsqueda',
    activeFilters: 'Filtros activos',
    filterDives: 'Filtrar inmersiones',
    filterDescription: 'Fecha, ubicación, profundidad, gas y valoración',
    active: 'activos',
    year: 'Año',
    allYears: 'Todos los años',
    month: 'Mes',
    allMonths: 'Todos los meses',
    from: 'Desde',
    to: 'Hasta',
    place: 'Lugar',
    searchLocation: 'Buscar ubicación...',
    workType: 'Tipo de trabajo',
    searchWork: 'Buscar trabajo...',
    minDepth: 'Profundidad mínima (m)',
    maxDepth: 'Profundidad máxima (m)',
    example: 'Ej. 10',
    exampleMax: 'Ej. 40',
    gasMix: 'Mezcla de gas',
    allGases: 'Todos los gases',
    minRating: 'Valoración mínima',
    ratingRange: 'De 1 a 10',
    applyFilters: 'Aplicar filtros',
    clearFilters: 'Limpiar filtros',
    history: 'Historial de inmersiones',
    filteredResults: 'Resultados según los filtros seleccionados',
    allRegistered: 'Todas tus inmersiones registradas',
    export: 'Exportar CSV',
    noResults: 'No hay resultados',
    emptyBook: 'Tu libro de inmersiones está vacío',
    noMatches: 'No hemos encontrado inmersiones que coincidan con esos filtros. Prueba a modificarlos.',
    firstDive: 'Cuando registres tu primera inmersión, aparecerá aquí todo tu historial.',
    removeFilters: 'Quitar filtros',
    registerDive: 'Registrar inmersión',
    modified: 'Modificada desde la última revisión',
    showing: 'Mostrando',
    of: 'de',
    dives: 'inmersiones',
    previous: '← Anterior',
    next: 'Siguiente →',
    error: 'No se han podido cargar las inmersiones:',
    months: [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ],
    columns: ['Nº', 'Fecha', 'Lugar', 'Profundidad', 'Duración', 'Trabajo', 'Valoración'],
    dateLocale: 'es-ES',
  },
  en: {
    activity: 'My underwater activity',
    title: 'My dives',
    description: 'View, organise and review your entire diving history.',
    newDive: 'New dive',
    foundDives: 'Dives found',
    totalDives: 'Total dives',
    records: 'Records',
    currentFilters: 'with current filters',
    inBook: 'in your logbook',
    underwaterTime: 'Time underwater',
    accumulatedHours: 'Accumulated hours',
    thisSelection: 'in this selection',
    registered: 'recorded',
    searchStatus: 'Search status',
    activeFilters: 'Active filters',
    filterDives: 'Filter dives',
    filterDescription: 'Date, location, depth, gas and rating',
    active: 'active',
    year: 'Year',
    allYears: 'All years',
    month: 'Month',
    allMonths: 'All months',
    from: 'From',
    to: 'To',
    place: 'Location',
    searchLocation: 'Search location...',
    workType: 'Work type',
    searchWork: 'Search work...',
    minDepth: 'Minimum depth (m)',
    maxDepth: 'Maximum depth (m)',
    example: 'E.g. 10',
    exampleMax: 'E.g. 40',
    gasMix: 'Gas mixture',
    allGases: 'All gases',
    minRating: 'Minimum rating',
    ratingRange: 'From 1 to 10',
    applyFilters: 'Apply filters',
    clearFilters: 'Clear filters',
    history: 'Dive history',
    filteredResults: 'Results based on the selected filters',
    allRegistered: 'All your recorded dives',
    export: 'Export CSV',
    noResults: 'No results',
    emptyBook: 'Your logbook is empty',
    noMatches: 'No dives match these filters. Try changing them.',
    firstDive: 'Once you record your first dive, your history will appear here.',
    removeFilters: 'Remove filters',
    registerDive: 'Register dive',
    modified: 'Modified since the last review',
    showing: 'Showing',
    of: 'of',
    dives: 'dives',
    previous: '← Previous',
    next: 'Next →',
    error: 'Could not load dives:',
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    columns: ['No.', 'Date', 'Location', 'Depth', 'Duration', 'Work', 'Rating'],
    dateLocale: 'en-GB',
  },
}

function formatDate(value: string, locale: string) {
  if (!value) return '—'

  const date = new Date(`${value}T00:00:00`)

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
}

export default async function Dives(props: {
  searchParams: Promise<P & { page?: string; sort?: string; dir?: string }>
}) {
  const sp = await props.searchParams
  const sb = createClient()

  const {
    data: { user },
  } = await sb.auth.getUser()

  const { data: me } = await sb
    .from('profiles')
    .select('language')
    .eq('id', user!.id)
    .maybeSingle()

  const language =
    me?.language === 'es' ? 'es' : me?.language === 'en' ? 'en' : 'ca'

  const t = translations[language]

  const columns = COLS.map(([key], i) => [key, t.columns[i]] as [string, string])

  const page = Math.max(1, Number(sp.page) || 1)
  const sort = COLS.some(([k]) => k === sp.sort) ? sp.sort! : 'dive_date'
  const asc = sp.dir === 'asc'

  const mine = () =>
    sb
      .from('dives')
      .select(
        'id, dive_number, dive_date, site, max_depth_m, duration_min, work_task, rating, modified_since_review',
        { count: 'exact' }
      )
      .eq('user_id', user!.id)

  const { data, count, error } = await applyFilters(mine(), sp)
    .order(sort, { ascending: asc })
    .order('dive_number', { ascending: false })
    .range((page - 1) * PAGE, page * PAGE - 1)

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {t.error} {error.message}
      </div>
    )
  }

  const mins = (
    await fetchAll(() =>
      applyFilters(
        sb.from('dives').select('duration_min').eq('user_id', user!.id),
        sp
      ).order('id')
    )
  ).reduce((s, r) => s + Number(r.duration_min || 0), 0)

  const { data: first } = await sb
    .from('dives')
    .select('dive_date')
    .eq('user_id', user!.id)
    .order('dive_date')
    .limit(1)

  const cy = new Date().getFullYear()
  const y0 = first?.[0] ? Number(first[0].dive_date.slice(0, 4)) : cy

  const years = Array.from(
    { length: Math.max(1, cy - y0 + 1) },
    (_, i) => cy - i
  )

  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE))

  const q = (o: Record<string, string | number>) =>
    '/dives?' +
    new URLSearchParams(
      Object.entries({ ...sp, ...o })
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)])
    )

  const exp = '/export?scope=mine&' + q({}).split('?')[1]

  const filterEntries = Object.entries(sp).filter(
    ([k, v]) => !['page', 'sort', 'dir'].includes(k) && Boolean(v)
  )

  const filtered = filterEntries.length > 0
  const activeFilterCount = filterEntries.length
  const total = count ?? 0

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* CABECERA */}

      <section className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/65 p-4 shadow-xl backdrop-blur-xl dark:bg-slate-950/40 sm:rounded-3xl sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-cyan-300 sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              {t.activity}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-navy dark:text-white sm:text-4xl">
              {t.title}
            </h1>

            <p className="mt-2 max-w-xl text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
              {t.description}
            </p>
          </div>

          <Link
            href="/dives/new"
            className="btn inline-flex shrink-0 items-center justify-center gap-2 self-start text-sm sm:self-auto sm:text-base"
          >
            <span className="text-lg leading-none">+</span>
            {t.newDive}
          </Link>
        </div>
      </section>

      {/* HISTORIAL */}

      <section className="overflow-hidden rounded-2xl border border-white/30 bg-white/70 shadow-sm backdrop-blur-xl dark:bg-slate-950/40 sm:rounded-3xl">

        {/* CABECERA DEL HISTORIAL */}

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 p-4 dark:border-white/10 sm:p-5">
          <div>
            <h2 className="text-lg font-bold text-navy dark:text-white sm:text-xl">
              {t.history}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {filtered ? t.filteredResults : t.allRegistered}
            </p>
          </div>

          <a
            href={exp}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-600/25 bg-teal-500/10 px-3 py-2 text-xs font-semibold text-teal-800 transition hover:bg-teal-500/20 dark:text-teal-300 sm:px-4 sm:text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="m7 10 5 5 5-5" />
              <path d="M12 15V3" />
            </svg>
            {t.export}
          </a>
        </div>

        {/* RESUMEN COMPACTO */}

        <div className="grid grid-cols-3 divide-x divide-slate-200/70 border-b border-slate-200/70 bg-slate-50/50 px-2 py-3 dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.02] sm:px-5 sm:py-4">
          <div className="min-w-0 px-1 text-center sm:px-3">
            <p className="text-lg font-extrabold tracking-tight text-navy dark:text-white sm:text-2xl">
              {total}
            </p>
            <p className="text-[10px] leading-4 text-slate-500 dark:text-slate-400 sm:text-xs">
              {filtered ? t.foundDives : t.totalDives}
            </p>
          </div>

          <div className="min-w-0 px-1 text-center sm:px-3">
            <p className="text-lg font-extrabold tracking-tight text-navy dark:text-white sm:text-2xl">
              {(mins / 60).toFixed(1)}
              <span className="ml-1 text-xs font-semibold text-slate-500">h</span>
            </p>
            <p className="text-[10px] leading-4 text-slate-500 dark:text-slate-400 sm:text-xs">
              {t.underwaterTime}
            </p>
          </div>

          <div className="min-w-0 px-1 text-center sm:px-3">
            <p className="text-lg font-extrabold tracking-tight text-navy dark:text-white sm:text-2xl">
              {activeFilterCount}
            </p>
            <p className="text-[10px] leading-4 text-slate-500 dark:text-slate-400 sm:text-xs">
              {t.activeFilters}
            </p>
          </div>
        </div>

        {/* FILTROS PLEGABLES */}

        <details
          open={filtered}
          className="group border-b border-slate-200/70 dark:border-white/10"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 transition hover:bg-slate-50/70 dark:hover:bg-white/5 [&::-webkit-details-marker]:hidden sm:p-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-cyan-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 7h16" />
                  <path d="M7 12h10" />
                  <path d="M10 17h4" />
                </svg>
              </span>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy dark:text-white">
                  {t.filterDives}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 sm:text-xs">
                  {t.filterDescription}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {filtered && (
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-400/15 dark:text-cyan-300 sm:text-xs">
                  {activeFilterCount} {t.active}
                </span>
              )}

              <span className="text-lg text-slate-500 transition-transform group-open:rotate-180">
                ⌄
              </span>
            </div>
          </summary>

          <div className="border-t border-slate-200/70 p-3 dark:border-white/10 sm:p-5">
            <form
              action="/dives"
              method="GET"
              key={JSON.stringify(sp)}
              className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"
            >
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.year}
                </span>
                <select name="year" defaultValue={sp.year ?? ''} className="input w-full">
                  <option value="">{t.allYears}</option>
                  {years.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.month}
                </span>
                <select name="month" defaultValue={sp.month ?? ''} className="input w-full">
                  <option value="">{t.allMonths}</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>{t.months[i]}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.from}
                </span>
                <input
                  name="from"
                  type="date"
                  defaultValue={sp.from}
                  className="input w-full"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.to}
                </span>
                <input
                  name="to"
                  type="date"
                  defaultValue={sp.to}
                  className="input w-full"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.place}
                </span>
                <input
                  name="site"
                  placeholder={t.searchLocation}
                  defaultValue={sp.site}
                  className="input w-full"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.workType}
                </span>
                <input
                  name="work"
                  placeholder={t.searchWork}
                  defaultValue={sp.work}
                  className="input w-full"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.minDepth}
                </span>
                <input
                  name="min_depth"
                  type="number"
                  min={0}
                  placeholder={t.example}
                  defaultValue={sp.min_depth}
                  className="input w-full"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.maxDepth}
                </span>
                <input
                  name="max_depth"
                  type="number"
                  min={0}
                  placeholder={t.exampleMax}
                  defaultValue={sp.max_depth}
                  className="input w-full"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.gasMix}
                </span>
                <select name="gas_mix" defaultValue={sp.gas_mix ?? ''} className="input w-full">
                  <option value="">{t.allGases}</option>
                  {OPT.gas_mix.map(([a, b]) => (
                    <option key={a} value={a}>{b}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.minRating}
                </span>
                <input
                  name="min_rating"
                  type="number"
                  min={1}
                  max={10}
                  placeholder={t.ratingRange}
                  defaultValue={sp.min_rating}
                  className="input w-full"
                />
              </label>

              <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-4">
                <button type="submit" className="btn">
                  {t.applyFilters}
                </button>

                <Link
                  href="/dives"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300/70 px-4 py-2 font-medium text-slate-600 transition hover:bg-slate-100 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  {t.clearFilters}
                </Link>
              </div>
            </form>
          </div>
        </details>

        {/* RESULTADOS */}

        {!data?.length ? (
          <div className="px-5 py-12 text-center sm:py-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl text-blue-700 dark:bg-blue-400/15 dark:text-cyan-300 sm:h-16 sm:w-16">
              ◉
            </div>

            <h3 className="mt-4 text-lg font-bold text-navy dark:text-white">
              {filtered ? t.noResults : t.emptyBook}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              {filtered ? t.noMatches : t.firstDive}
            </p>

            {filtered ? (
              <Link href="/dives" className="btn mt-5 inline-flex">
                {t.removeFilters}
              </Link>
            ) : (
              <Link href="/dives/new" className="btn mt-5 inline-flex">
                + {t.registerDive}
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* LISTA PARA MÓVIL */}

            <div className="divide-y divide-slate-200/70 dark:divide-white/10 md:hidden">
              {data.map((d: any) => (
                <Link
                  key={d.id}
                  href={`/dives/${d.id}?from=${encodeURIComponent(q({}))}`}
                  className="flex items-center gap-3 px-3 py-3 transition hover:bg-blue-50/60 dark:hover:bg-white/5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-600/15 bg-teal-500/10 text-xs font-extrabold text-teal-800 dark:text-cyan-300">
                    #{d.dive_number}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1">
                      <span className="truncate text-sm font-bold text-navy dark:text-white">
                        {d.site || '—'}
                      </span>
                      {d.modified_since_review && (
                        <span className="shrink-0 text-xs text-amber-600" title={t.modified}>
                          ✎
                        </span>
                      )}
                    </span>

                    <span className="mt-1 block text-[10px] text-slate-500 dark:text-slate-400">
                      {formatDate(d.dive_date, t.dateLocale)}
                      {d.work_task ? ` · ${d.work_task.slice(0, 30)}` : ''}
                    </span>
                  </span>

                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-bold text-navy dark:text-white">
                      {d.max_depth_m != null ? `${d.max_depth_m} m` : '—'}
                    </span>
                    <span className="mt-1 block text-[10px] text-slate-500 dark:text-slate-400">
                      {d.duration_min != null ? `${d.duration_min} min` : '—'}
                      {d.rating != null ? ` · ${d.rating}/10` : ''}
                    </span>
                  </span>

                  <span className="shrink-0 text-sm text-slate-400">›</span>
                </Link>
              ))}
            </div>

            {/* TABLA COMPLETA PARA ESCRITORIO */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200/70 bg-slate-100/70 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    {columns.map(([k, l]) => (
                      <th key={k} className="whitespace-nowrap px-4 py-4 font-semibold">
                        <Link
                          href={q({
                            sort: k,
                            dir: sort === k && !asc ? 'asc' : 'desc',
                            page: 1,
                          })}
                          className="transition hover:text-teal-700 dark:hover:text-cyan-300"
                        >
                          {l}
                          <span className="ml-1 text-teal-600 dark:text-cyan-300">
                            {sort === k ? (asc ? '↑' : '↓') : ''}
                          </span>
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {data.map((d: any) => (
                    <tr
                      key={d.id}
                      className="border-b border-slate-200/50 transition hover:bg-blue-50/60 dark:border-white/5 dark:hover:bg-white/5"
                    >
                      <td className="px-4 py-4">
                        <Link
                          href={`/dives/${d.id}?from=${encodeURIComponent(q({}))}`}
                          className="font-bold text-teal-800 hover:underline dark:text-cyan-300"
                        >
                          #{d.dive_number}
                          {d.modified_since_review && (
                            <span
                              className="ml-1 text-amber-600"
                              title={t.modified}
                            >
                              ✎
                            </span>
                          )}
                        </Link>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-slate-600 dark:text-slate-300">
                        <Link
                          href={`/dives/${d.id}?from=${encodeURIComponent(q({}))}`}
                          className="block hover:text-teal-700 dark:hover:text-cyan-300"
                        >
                          {formatDate(d.dive_date, t.dateLocale)}
                        </Link>
                      </td>

                      <td className="max-w-[220px] px-4 py-4 font-medium text-navy dark:text-white">
                        <Link
                          href={`/dives/${d.id}?from=${encodeURIComponent(q({}))}`}
                          className="block truncate hover:text-teal-700 dark:hover:text-cyan-300"
                        >
                          {d.site || '—'}
                        </Link>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-slate-600 dark:text-slate-300">
                        <Link href={`/dives/${d.id}?from=${encodeURIComponent(q({}))}`}>
                          {d.max_depth_m != null ? `${d.max_depth_m} m` : '—'}
                        </Link>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-slate-600 dark:text-slate-300">
                        <Link href={`/dives/${d.id}?from=${encodeURIComponent(q({}))}`}>
                          {d.duration_min != null ? `${d.duration_min} min` : '—'}
                        </Link>
                      </td>

                      <td className="max-w-[180px] px-4 py-4 text-slate-600 dark:text-slate-300">
                        <Link
                          href={`/dives/${d.id}?from=${encodeURIComponent(q({}))}`}
                          className="block truncate"
                        >
                          {d.work_task?.slice(0, 40) || '—'}
                        </Link>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <Link href={`/dives/${d.id}?from=${encodeURIComponent(q({}))}`}>
                          {d.rating != null ? (
                            <span className="inline-flex rounded-lg bg-amber-100 px-2.5 py-1 font-semibold text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                              {d.rating}/10
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINACIÓN */}

            <div className="flex flex-col gap-3 border-t border-slate-200/70 p-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 sm:text-xs">
                {t.showing} {data.length} {t.of} {total} {t.dives}
              </p>

              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <Link
                    href={q({ page: page - 1 })}
                    className="rounded-xl border border-slate-300/70 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10 sm:text-sm"
                  >
                    {t.previous}
                  </Link>
                ) : (
                  <span className="rounded-xl border border-slate-200/50 px-3 py-2 text-xs text-slate-400 dark:border-white/5 sm:text-sm">
                    {t.previous}
                  </span>
                )}

                <span className="rounded-xl bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-800 dark:bg-blue-400/15 dark:text-cyan-300 sm:px-4 sm:text-sm">
                  {page} / {pages}
                </span>

                {page < pages ? (
                  <Link
                    href={q({ page: page + 1 })}
                    className="rounded-xl border border-slate-300/70 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10 sm:text-sm"
                  >
                    {t.next}
                  </Link>
                ) : (
                  <span className="rounded-xl border border-slate-200/50 px-3 py-2 text-xs text-slate-400 dark:border-white/5 sm:text-sm">
                    {t.next}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
