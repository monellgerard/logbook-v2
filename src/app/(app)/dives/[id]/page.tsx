
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OPT } from '@/lib/dive-schema'
import DeleteButton from './delete-button'
import DiveProfile from '@/components/dive-profile'
import { reviewDive } from '../../admin/actions'

const ST: Record<string, string> = {
  pending: 'Pendiente',
  reviewed: 'Revisada',
  needs_correction: 'Necesita corrección',
}

const lab = (k: string, v: any) => {
  const o = (OPT as any)[k]?.find((x: string[]) => x[0] === v)
  return o ? o[1] : v
}

const ROWS: [string, string, string?][] = [
  ['Nº', 'dive_number'],
  ['Lugar', 'site'],
  ['Fecha', 'dive_date'],
  ['Hora', 'start_time'],
  ['Profundidad (m)', 'max_depth_m'],
  ['Tiempo (min)', 'duration_min'],
  ['Temp. agua (°C)', 'water_temp_c'],
  ['Visibilidad', 'visibility'],
  ['Oleaje', 'swell'],
  ['Corriente', 'current'],
  ['Traje', 'suit_type'],
  ['Lastre (kg)', 'weight_kg'],
  ['Material botella', 'tank_material', 'tank_material_other'],
  ['Capacidad botella', 'tank_capacity_l', 'tank_capacity_other'],
  ['Mezcla', 'gas_mix', 'gas_mix_other'],
  ['Presión inicial (bar)', 'pressure_start_bar'],
  ['Presión final (bar)', 'pressure_end_bar'],
  ['Jefe de equipo', 'team_leader'],
  ['Pareja', 'buddy'],
  ['Trabajo', 'work_task'],
  ['Incidencias', 'incidents'],
  ['Herramientas', 'tools'],
  ['Valoración', 'rating'],
]

const GROUPS = [
  {
    title: 'Datos de la inmersión',
    subtitle: 'Información general y localización',
    icon: '◎',
    keys: ['dive_number', 'site', 'dive_date', 'start_time'],
  },
  {
    title: 'Condiciones del entorno',
    subtitle: 'Características del medio submarino',
    icon: '≈',
    keys: ['water_temp_c', 'visibility', 'swell', 'current'],
  },
  {
    title: 'Equipo y configuración',
    subtitle: 'Material utilizado durante la inmersión',
    icon: '◈',
    keys: [
      'suit_type',
      'weight_kg',
      'tank_material',
      'tank_capacity_l',
      'gas_mix',
    ],
  },
  {
    title: 'Equipo de buceo',
    subtitle: 'Presiones y configuración de gas',
    icon: '◉',
    keys: ['pressure_start_bar', 'pressure_end_bar'],
  },
  {
    title: 'Equipo humano',
    subtitle: 'Responsables y compañeros',
    icon: '♧',
    keys: ['team_leader', 'buddy'],
  },
  {
    title: 'Actividad y valoración',
    subtitle: 'Trabajo realizado y observaciones',
    icon: '≡',
    keys: ['work_task', 'incidents', 'tools', 'rating'],
  },
]

export default async function Detail(props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; from?: string }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams

  const sb = createClient()

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

  const {
    data: { user },
  } = await sb.auth.getUser()

  const { data: me } = await sb
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isAdmin = me?.role === 'admin'
  const own = d.user_id === user!.id

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

  const renderRows = (keys: string[]) =>
    ROWS.filter(([, k]) => keys.includes(k)).map(([label, key, other]) => {
      const value =
        d[key] === 'otros' && other
          ? `Otros: ${d[other] ?? ''}`
          : lab(key, d[key])

      return (
        <div
          key={key}
          className="min-w-0 rounded-xl border border-slate-200/60 bg-white/65 p-3 transition hover:bg-white/90 dark:border-white/10 dark:bg-white/[0.035] dark:hover:bg-white/[0.07]"
        >
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {label}
          </dt>
          <dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-navy dark:text-slate-100">
            {value ?? '—'}
          </dd>
        </div>
      )
    })

  const status = ST[d.review_status] ?? 'Sin estado'

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
        Volver al historial
      </Link>

      {/* CABECERA */}
      <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/65 p-6 shadow-xl backdrop-blur-xl dark:bg-slate-950/40 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800 dark:bg-teal-400/15 dark:text-teal-300">
              Registro de inmersión
            </span>

            {!(isAdmin && own) && (
              <span className="rounded-full border border-slate-300/60 bg-white/50 px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
                {status}
              </span>
            )}

            {d.modified_since_review && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                Modificada tras revisión
              </span>
            )}
          </div>

          <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Ficha técnica
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-navy dark:text-white sm:text-4xl">
                Inmersión #{d.dive_number}
              </h1>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {d.site || 'Ubicación no especificada'}
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
                  Editar inmersión
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
            Profundidad máxima
          </p>
          <p className="mt-2 text-2xl font-bold text-navy dark:text-white">
            {d.max_depth_m ?? '—'}
            <span className="ml-1 text-sm font-medium text-slate-500">m</span>
          </p>
        </div>

        <div className="rounded-2xl border border-white/30 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:bg-slate-950/35">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Duración
          </p>
          <p className="mt-2 text-2xl font-bold text-navy dark:text-white">
            {d.duration_min ?? '—'}
            <span className="ml-1 text-sm font-medium text-slate-500">min</span>
          </p>
        </div>

        <div className="rounded-2xl border border-white/30 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:bg-slate-950/35">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Mezcla de gas
          </p>
          <p className="mt-2 truncate text-xl font-bold text-navy dark:text-white">
            {lab('gas_mix', d.gas_mix) || '—'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/30 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:bg-slate-950/35">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Valoración
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
              Historial de revisiones
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Seguimiento de las revisiones realizadas a esta inmersión
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
                    {ST[r.status] ?? r.status}
                  </span>

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(r.created_at).toLocaleDateString('es-ES')}
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
              Revisión del profesor
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Evalúa el registro y comunica si necesita modificaciones.
            </p>
          </div>

          <form action={reviewDive} className="p-4 sm:p-5">
            <input type="hidden" name="dive_id" value={d.id} />
            <input type="hidden" name="from" value={back} />

            <label
              htmlFor="review-comment"
              className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              Comentario de revisión
            </label>

            <textarea
              id="review-comment"
              name="comment"
              rows={3}
              placeholder="Escribe aquí tus observaciones..."
              className="input mb-4 w-full"
            />

            <div className="flex flex-wrap gap-2">
              <button
                name="status"
                value="reviewed"
                className="btn"
              >
                ✓ Marcar revisada
              </button>

              <button
                name="status"
                value="needs_correction"
                className="rounded-xl border border-amber-400/60 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-400/10"
              >
                Necesita corrección
              </button>

              <button
                name="status"
                value="pending"
                className="rounded-xl border border-slate-300/70 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10"
              >
                Volver a pendiente
              </button>
            </div>
          </form>
        </section>
      )}

      {/* PERFIL DE INMERSIÓN */}
      <section className="overflow-hidden rounded-2xl border border-white/30 bg-white/70 shadow-sm backdrop-blur-xl dark:bg-slate-950/40">
        <div className="border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
          <h2 className="font-bold text-navy dark:text-white">
            Perfil de inmersión
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Representación gráfica de los datos principales
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
            Datos de la inmersión
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Información técnica y operativa del registro.
          </p>
        </div>

        {GROUPS.map((group) => (
          <section
            key={group.title}
            className="overflow-hidden rounded-2xl border border-white/30 bg-white/70 shadow-sm backdrop-blur-xl dark:bg-slate-950/40"
          >
            <div className="flex items-center gap-3 border-b border-slate-200/60 px-4 py-4 dark:border-white/10 sm:px-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-700 dark:bg-blue-400/15 dark:text-cyan-300">
                {group.icon}
              </span>

              <div>
                <h3 className="font-semibold text-navy dark:text-white">
                  {group.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {group.subtitle}
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
          ← Volver al historial
        </Link>
      </div>
    </div>
  )
}
