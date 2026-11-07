
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OPT, OPT_LABELS } from '@/lib/dive-schema'
import DeleteButton from './delete-button'
import DiveProfile from '@/components/dive-profile'
import { reviewDive } from '../../admin/actions'

const translations = {
  ca: {
    status: {
      pending: 'Pendent',
      reviewed: 'Revisada',
      needs_correction: 'Necessita correcció',
      none: 'Sense estat',
    },
    labels: {
      dive_number: 'Nº',
      site: 'Lloc',
      dive_date: 'Data',
      start_time: 'Hora',
      max_depth_m: 'Profunditat (m)',
      duration_min: 'Temps (min)',
      water_temp_c: 'Temp. de l’aigua (°C)',
      visibility: 'Visibilitat',
      swell: 'Onatge',
      current: 'Corrent',
      suit_type: 'Vestit',
      weight_kg: 'Llast (kg)',
      tank_material: 'Material de l’ampolla',
      tank_capacity_l: 'Capacitat de l’ampolla',
      gas_mix: 'Barreja',
      pressure_start_bar: 'Pressió inicial (bar)',
      pressure_end_bar: 'Pressió final (bar)',
      team_leader: 'Cap d’equip',
      buddy: 'Company/a',
      work_task: 'Feina',
      incidents: 'Incidències',
      tools: 'Eines',
      rating: 'Valoració',
    },
    groups: [
      { title: 'Dades de la immersió', subtitle: 'Informació general i localització' },
      { title: 'Condicions de l’entorn', subtitle: 'Característiques del medi submarí' },
      { title: 'Equip i configuració', subtitle: 'Material utilitzat durant la immersió' },
      { title: 'Equip de busseig', subtitle: 'Pressions i configuració del gas' },
      { title: 'Equip humà', subtitle: 'Responsables i companys' },
      { title: 'Activitat i valoració', subtitle: 'Feina realitzada i observacions' },
    ],
    diveRecord: 'Registre d’immersió',
    modified: 'Modificada després de la revisió',
    noStatus: 'Sense estat',
    technicalSheet: 'Fitxa tècnica',
    dive: 'Immersió',
    locationUnknown: 'Ubicació no especificada',
    back: 'Tornar a l’historial',
    edit: 'Editar immersió',
    maxDepth: 'Profunditat màxima',
    duration: 'Durada',
    gasMix: 'Barreja de gas',
    rating: 'Valoració',
    reviews: 'Historial de revisions',
    reviewsDescription: 'Seguiment de les revisions realitzades a aquesta immersió',
    teacherReview: 'Revisió del professor',
    teacherDescription: 'Avalua el registre i comunica si necessita modificacions.',
    reviewComment: 'Comentari de revisió',
    commentPlaceholder: 'Escriu aquí les teves observacions...',
    markReviewed: '✓ Marcar com a revisada',
    needsCorrection: 'Necessita correcció',
    backToPending: 'Tornar a pendent',
    profile: 'Perfil de la immersió',
    profileDescription: 'Representació gràfica de les dades principals',
    completeData: 'Dades completes',
    completeDescription: 'Informació tècnica i operativa del registre.',
    other: 'Altres',
    error: 'Error',
    dateLocale: 'ca-ES',
  },
  es: {
    status: {
      pending: 'Pendiente',
      reviewed: 'Revisada',
      needs_correction: 'Necesita corrección',
      none: 'Sin estado',
    },
    labels: {
      dive_number: 'Nº',
      site: 'Lugar',
      dive_date: 'Fecha',
      start_time: 'Hora',
      max_depth_m: 'Profundidad (m)',
      duration_min: 'Tiempo (min)',
      water_temp_c: 'Temp. agua (°C)',
      visibility: 'Visibilidad',
      swell: 'Oleaje',
      current: 'Corriente',
      suit_type: 'Traje',
      weight_kg: 'Lastre (kg)',
      tank_material: 'Material botella',
      tank_capacity_l: 'Capacidad botella',
      gas_mix: 'Mezcla',
      pressure_start_bar: 'Presión inicial (bar)',
      pressure_end_bar: 'Presión final (bar)',
      team_leader: 'Jefe de equipo',
      buddy: 'Compañero',
      work_task: 'Trabajo',
      incidents: 'Incidencias',
      tools: 'Herramientas',
      rating: 'Valoración',
    },
    groups: [
      { title: 'Datos de la inmersión', subtitle: 'Información general y localización' },
      { title: 'Condiciones del entorno', subtitle: 'Características del medio submarino' },
      { title: 'Equipo y configuración', subtitle: 'Material utilizado durante la inmersión' },
      { title: 'Equipo de buceo', subtitle: 'Presiones y configuración de gas' },
      { title: 'Equipo humano', subtitle: 'Responsables y compañeros' },
      { title: 'Actividad y valoración', subtitle: 'Trabajo realizado y observaciones' },
    ],
    diveRecord: 'Registro de inmersión',
    modified: 'Modificada tras revisión',
    noStatus: 'Sin estado',
    technicalSheet: 'Ficha técnica',
    dive: 'Inmersión',
    locationUnknown: 'Ubicación no especificada',
    back: 'Volver al historial',
    edit: 'Editar inmersión',
    maxDepth: 'Profundidad máxima',
    duration: 'Duración',
    gasMix: 'Mezcla de gas',
    rating: 'Valoración',
    reviews: 'Historial de revisiones',
    reviewsDescription: 'Seguimiento de las revisiones realizadas a esta inmersión',
    teacherReview: 'Revisión del profesor',
    teacherDescription: 'Evalúa el registro y comunica si necesita modificaciones.',
    reviewComment: 'Comentario de revisión',
    commentPlaceholder: 'Escribe aquí tus observaciones...',
    markReviewed: '✓ Marcar revisada',
    needsCorrection: 'Necesita corrección',
    backToPending: 'Volver a pendiente',
    profile: 'Perfil de inmersión',
    profileDescription: 'Representación gráfica de los datos principales',
    completeData: 'Datos completos',
    completeDescription: 'Información técnica y operativa del registro.',
    other: 'Otros',
    error: 'Error',
    dateLocale: 'es-ES',
  },
  en: {
    status: {
      pending: 'Pending',
      reviewed: 'Reviewed',
      needs_correction: 'Needs correction',
      none: 'No status',
    },
    labels: {
      dive_number: 'No.',
      site: 'Location',
      dive_date: 'Date',
      start_time: 'Time',
      max_depth_m: 'Depth (m)',
      duration_min: 'Time (min)',
      water_temp_c: 'Water temp. (°C)',
      visibility: 'Visibility',
      swell: 'Swell',
      current: 'Current',
      suit_type: 'Suit',
      weight_kg: 'Weight (kg)',
      tank_material: 'Tank material',
      tank_capacity_l: 'Tank capacity',
      gas_mix: 'Gas mix',
      pressure_start_bar: 'Starting pressure (bar)',
      pressure_end_bar: 'Ending pressure (bar)',
      team_leader: 'Team leader',
      buddy: 'Buddy',
      work_task: 'Work',
      incidents: 'Incidents',
      tools: 'Tools',
      rating: 'Rating',
    },
    groups: [
      { title: 'Dive details', subtitle: 'General information and location' },
      { title: 'Environmental conditions', subtitle: 'Underwater environment characteristics' },
      { title: 'Equipment and configuration', subtitle: 'Equipment used during the dive' },
      { title: 'Diving equipment', subtitle: 'Pressure and gas configuration' },
      { title: 'Dive team', subtitle: 'Leaders and buddies' },
      { title: 'Activity and rating', subtitle: 'Work performed and observations' },
    ],
    diveRecord: 'Dive record',
    modified: 'Modified after review',
    noStatus: 'No status',
    technicalSheet: 'Technical details',
    dive: 'Dive',
    locationUnknown: 'Location not specified',
    back: 'Back to history',
    edit: 'Edit dive',
    maxDepth: 'Maximum depth',
    duration: 'Duration',
    gasMix: 'Gas mix',
    rating: 'Rating',
    reviews: 'Review history',
    reviewsDescription: 'Track the reviews carried out on this dive',
    teacherReview: 'Instructor review',
    teacherDescription: 'Evaluate the record and indicate whether changes are needed.',
    reviewComment: 'Review comment',
    commentPlaceholder: 'Write your observations here...',
    markReviewed: '✓ Mark as reviewed',
    needsCorrection: 'Needs correction',
    backToPending: 'Return to pending',
    profile: 'Dive profile',
    profileDescription: 'Graphical representation of the main data',
    completeData: 'Complete details',
    completeDescription: 'Technical and operational information for this record.',
    other: 'Other',
    error: 'Error',
    dateLocale: 'en-GB',
  },
}

const ROWS: [string, string, string?][] = [
  ['', 'dive_number'],
  ['', 'site'],
  ['', 'dive_date'],
  ['', 'start_time'],
  ['', 'max_depth_m'],
  ['', 'duration_min'],
  ['', 'water_temp_c'],
  ['', 'visibility'],
  ['', 'swell'],
  ['', 'current'],
  ['', 'suit_type'],
  ['', 'weight_kg'],
  ['', 'tank_material', 'tank_material_other'],
  ['', 'tank_capacity_l', 'tank_capacity_other'],
  ['', 'gas_mix', 'gas_mix_other'],
  ['', 'pressure_start_bar'],
  ['', 'pressure_end_bar'],
  ['', 'team_leader'],
  ['', 'buddy'],
  ['', 'work_task'],
  ['', 'incidents'],
  ['', 'tools'],
  ['', 'rating'],
]

const GROUP_KEYS = [
  {
    icon: '◎',
    keys: ['dive_number', 'site', 'dive_date', 'start_time'],
  },
  {
    icon: '≈',
    keys: ['water_temp_c', 'visibility', 'swell', 'current'],
  },
  {
    icon: '◈',
    keys: ['suit_type', 'weight_kg', 'tank_material', 'tank_capacity_l', 'gas_mix'],
  },
  {
    icon: '◉',
    keys: ['pressure_start_bar', 'pressure_end_bar'],
  },
  {
    icon: '♧',
    keys: ['team_leader', 'buddy'],
  },
  {
    icon: '≡',
    keys: ['work_task', 'incidents', 'tools', 'rating'],
  },
]

function formatDate(value: string, locale: string) {
  if (!value) return '—'

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
}

export default async function Detail(props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; from?: string }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams

  const sb = createClient()

  const {
    data: { user },
  } = await sb.auth.getUser()

  if (!user) notFound()

  const { data: me } = await sb
    .from('profiles')
    .select('role, language')
    .eq('id', user.id)
    .single()

  const language =
    me?.language === 'es' ? 'es' : me?.language === 'en' ? 'en' : 'ca'

  const t = translations[language]

  const { data: d } = await sb
    .from('dives')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (!d) notFound()

  const { data: reviews } = await sb
    .from('dive_reviews')
    .select('status, comment, created_at')
    .eq('dive_id', d.id)
    .order('created_at', { ascending: false })

  const isAdmin = me?.role === 'admin'
  const own = d.user_id === user.id

  const from = searchParams.from ?? ''

  const back =
    from.startsWith('/') && !from.startsWith('//')
      ? from
      : own
        ? '/dives'
        : '/admin/dives'

  const owner = own
    ? ''
    : (
        await sb
          .from('profiles')
          .select('full_name')
          .eq('id', d.user_id)
          .single()
      ).data?.full_name ?? ''

 const lab = (k: string, v: any) => {
  const o = (OPT as any)[k]?.find((x: string[]) => x[0] === v)

  if (!o) return v

  return (OPT_LABELS as any)[language]?.[k]?.[v] ?? o[1]
}

  const renderRows = (keys: string[]) =>
    ROWS.filter(([, k]) => keys.includes(k)).map(([, key, other]) => {
      const value =
        d[key] === 'otros' && other
          ? `${t.other}: ${d[other] ?? ''}`
          : lab(key, d[key])

      return (
        <div
          key={key}
          className="min-w-0 rounded-xl border border-slate-200/60 bg-white/65 p-3 transition hover:bg-white/90 dark:border-white/10 dark:bg-white/[0.035] dark:hover:bg-white/[0.07]"
        >
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.labels[key as keyof typeof t.labels]}
          </dt>
          <dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-navy dark:text-slate-100">
            {value ?? '—'}
          </dd>
        </div>
      )
    })

  const status = t.status[d.review_status as keyof typeof t.status] ?? t.noStatus

  return (
    <div className="space-y-6">

      {/* MENSAJE DE ERROR */}
      {searchParams.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
          {searchParams.error}
        </div>
      )}

      {/* VOLVER */}
      <Link
        href={back}
        className="inline-flex items-center gap-2 text-sm font-medium text-teal-800 transition hover:gap-3 dark:text-cyan-300"
      >
        <span>←</span>
        {t.back}
      </Link>

      {/* CABECERA */}
      <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/65 p-6 shadow-xl backdrop-blur-xl dark:bg-slate-950/40 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800 dark:bg-teal-400/15 dark:text-teal-300">
              {t.diveRecord}
            </span>

            {!(isAdmin && own) && (
              <span className="rounded-full border border-slate-300/60 bg-white/50 px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
                {status}
              </span>
            )}

            {d.modified_since_review && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                {t.modified}
              </span>
            )}
          </div>

          <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t.technicalSheet}
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-navy dark:text-white sm:text-4xl">
                {t.dive} #{d.dive_number}
              </h1>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {d.site || t.locationUnknown}
                {owner ? ` · ${owner}` : ''}
              </p>
            </div>

            {own && (
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/dives/${d.id}/edit`}
                  className="btn inline-flex items-center justify-center gap-2"
                >
                  <span>✎</span>
                  {t.edit}
                </Link>

                <DeleteButton id={d.id} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* INDICADORES PRINCIPALES */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/30 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:bg-slate-950/35">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.maxDepth}
          </p>
          <p className="mt-2 text-2xl font-bold text-navy dark:text-white">
            {d.max_depth_m ?? '—'}
            <span className="ml-1 text-sm font-medium text-slate-500">m</span>
          </p>
        </div>

        <div className="rounded-2xl border border-white/30 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:bg-slate-950/35">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.duration}
          </p>
          <p className="mt-2 text-2xl font-bold text-navy dark:text-white">
            {d.duration_min ?? '—'}
            <span className="ml-1 text-sm font-medium text-slate-500">min</span>
          </p>
        </div>

        <div className="rounded-2xl border border-white/30 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:bg-slate-950/35">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.gasMix}
          </p>
          <p className="mt-2 truncate text-xl font-bold text-navy dark:text-white">
            {lab('gas_mix', d.gas_mix) || '—'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/30 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:bg-slate-950/35">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.rating}
          </p>
          <p className="mt-2 text-2xl font-bold text-navy dark:text-white">
            {d.rating != null ? `${d.rating}/10` : '—'}
          </p>
        </div>
      </section>

      {/* REVISIONES */}
      {reviews?.length ? (
        <section className="overflow-hidden rounded-2xl border border-teal-500/20 bg-white/70 shadow-sm backdrop-blur-xl dark:bg-slate-950/40">
          <div className="border-b border-teal-500/15 bg-teal-500/5 px-5 py-4">
            <h2 className="font-bold text-navy dark:text-white">
              {t.reviews}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t.reviewsDescription}
            </p>
          </div>

          <div className="space-y-3 p-4 sm:p-5">
            {reviews.map((r, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200/60 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.035]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-navy dark:text-white">
                    {t.status[r.status as keyof typeof t.status] ?? r.status}
                  </span>

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(r.created_at, t.dateLocale)}
                  </span>
                </div>

                {r.comment && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                    {r.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* REVISIÓN DEL PROFESOR */}
      {isAdmin && !own && (
        <section className="overflow-hidden rounded-2xl border border-white/30 bg-white/70 shadow-sm backdrop-blur-xl dark:bg-slate-950/40">
          <div className="border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
            <h2 className="font-bold text-navy dark:text-white">
              {t.teacherReview}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t.teacherDescription}
            </p>
          </div>

          <form action={reviewDive} className="p-4 sm:p-5">
            <input type="hidden" name="dive_id" value={d.id} />
            <input type="hidden" name="from" value={back} />

            <label
              htmlFor="review-comment"
              className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              {t.reviewComment}
            </label>

            <textarea
              id="review-comment"
              name="comment"
              rows={3}
              placeholder={t.commentPlaceholder}
              className="input mb-4 w-full"
            />

            <div className="flex flex-wrap gap-2">
              <button
                name="status"
                value="reviewed"
                className="btn"
              >
                {t.markReviewed}
              </button>

              <button
                name="status"
                value="needs_correction"
                className="rounded-xl border border-amber-400/60 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-400/10"
              >
                {t.needsCorrection}
              </button>

              <button
                name="status"
                value="pending"
                className="rounded-xl border border-slate-300/70 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10"
              >
                {t.backToPending}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* PERFIL DE INMERSIÓN */}
      <section className="overflow-hidden rounded-2xl border border-white/30 bg-white/70 shadow-sm backdrop-blur-xl dark:bg-slate-950/40">
        <div className="border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
          <h2 className="font-bold text-navy dark:text-white">
            {t.profile}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t.profileDescription}
          </p>
        </div>

        <div className="p-4 sm:p-5">
          <DiveProfile
            depth={d.max_depth_m}
            minutes={d.duration_min}
            gasMix={d.gas_mix}
            startBar={d.pressure_start_bar}
            endBar={d.pressure_end_bar}
          />
        </div>
      </section>

      {/* DATOS COMPLETOS */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-navy dark:text-white">
            {t.completeData}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t.completeDescription}
          </p>
        </div>

        {GROUP_KEYS.map((group, i) => (
          <section
            key={group.icon}
            className="overflow-hidden rounded-2xl border border-white/30 bg-white/70 shadow-sm backdrop-blur-xl dark:bg-slate-950/40"
          >
            <div className="flex items-center gap-3 border-b border-slate-200/60 px-4 py-4 dark:border-white/10 sm:px-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-700 dark:bg-blue-400/15 dark:text-cyan-300">
                {group.icon}
              </span>

              <div>
                <h3 className="font-semibold text-navy dark:text-white">
                  {t.groups[i].title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.groups[i].subtitle}
                </p>
              </div>
            </div>

            <dl className="grid gap-2 p-3 sm:grid-cols-2 sm:p-4">
              {renderRows(group.keys)}
            </dl>
          </section>
        ))}
      </section>

      {/* VOLVER */}
      <div className="flex justify-start pb-4">
        <Link
          href={back}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300/70 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/70 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10"
        >
          ← {t.back}
        </Link>
      </div>
    </div>
  )
}
