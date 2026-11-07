
import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { applyFilters, MONTHS, type P } from '@/lib/filters'

const PAGE = 25

const ST: Record<string, string> = {
  pending: 'Pendiente',
  reviewed: 'Revisada',
  needs_correction: 'Necesita corrección',
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300',
  reviewed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300',
  needs_correction: 'bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-300',
}

export default async function ClassDives(props: {
  searchParams: Promise<P & {
    page?: string
    student?: string
    review?: string
  }>
}) {
  const sp = await props.searchParams
  const { sb } = await requireAdmin()

  const page = Math.max(1, Number(sp.page) || 1)

  const { data: students } = await sb
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'student')
    .order('full_name')

  let q = sb
    .from('dives')
    .select(
      'id, dive_number, dive_date, site, max_depth_m, duration_min, work_task, review_status, modified_since_review, profiles!dives_user_id_fkey!inner(full_name, role)',
      { count: 'exact' }
    )

  q = q.eq('profiles.role', 'student')

  if (sp.student) q = q.eq('user_id', sp.student)
  if (sp.review) q = q.eq('review_status', sp.review)

  const {
    data,
    count,
    error,
  } = await applyFilters(q, sp)
    .order('dive_date', { ascending: false })
    .order('id')
    .range((page - 1) * PAGE, page * PAGE - 1)

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/5 dark:text-red-300">
        <p className="font-semibold">No se han podido cargar las inmersiones.</p>
        <p className="mt-1">{error.message}</p>
      </div>
    )
  }

  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE))

  const qs = (o: Record<string, string | number>) =>
    new URLSearchParams(
      Object.entries({ ...sp, ...o })
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)])
    ).toString()

  const yr = new Date().getFullYear()

  const activeFilters = [
    sp.student,
    sp.year,
    sp.month,
    sp.review,
    sp.from,
    sp.to,
    sp.site,
    sp.work,
  ].filter(Boolean).length

  return (
    <div className="space-y-6">

      {/* CABECERA */}
      <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#082b43] via-[#0b3b59] to-[#087e91] p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-52 w-52 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative z-10">
          <Link
            href="/admin"
            className="text-xs font-medium text-cyan-200 transition hover:text-white"
          >
            ← Volver a administración
          </Link>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
            Seguimiento y evaluación
          </p>

          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Inmersiones de la clase
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100/80">
            Consulta las inmersiones registradas por tus alumnos y supervisa
            su estado de revisión.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur">
              <span className="text-xs text-blue-100/70">Registros encontrados</span>
              <p className="mt-0.5 text-xl font-semibold">{count ?? 0}</p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur">
              <span className="text-xs text-blue-100/70">Página actual</span>
              <p className="mt-0.5 text-xl font-semibold">
                {page} <span className="text-sm font-normal text-blue-100/70">/ {pages}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* FILTROS */}
      <section className="overflow-hidden rounded-2xl border border-white/40 bg-white/75 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-5 py-4 dark:border-white/10 sm:px-6">
          <div>
            <p className="eyebrow">Búsqueda avanzada</p>
            <h2 className="mt-1 text-lg font-semibold text-navy dark:text-white">
              Filtrar inmersiones
            </h2>
          </div>

          {activeFilters > 0 && (
            <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800 dark:bg-cyan-400/10 dark:text-cyan-300">
              {activeFilters} filtros activos
            </span>
          )}
        </div>

        <form
          key={JSON.stringify(sp)}
          className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6"
        >
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Alumno
            </span>
            <select
              name="student"
              defaultValue={sp.student ?? ''}
              className="input"
            >
              <option value="">Todos los alumnos</option>
              {students?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name || s.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Año
            </span>
            <select
              name="year"
              defaultValue={sp.year ?? ''}
              className="input"
            >
              <option value="">Todos los años</option>
              {Array.from({ length: 12 }, (_, i) => yr - i).map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Mes
            </span>
            <select
              name="month"
              defaultValue={sp.month ?? ''}
              className="input"
            >
              <option value="">Todos los meses</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Estado de revisión
            </span>
            <select
              name="review"
              defaultValue={sp.review ?? ''}
              className="input"
            >
              <option value="">Todos los estados</option>
              {Object.entries(ST).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Desde
            </span>
            <input
              name="from"
              type="date"
              defaultValue={sp.from}
              className="input"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Hasta
            </span>
            <input
              name="to"
              type="date"
              defaultValue={sp.to}
              className="input"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Lugar de inmersión
            </span>
            <input
              name="site"
              placeholder="Buscar lugar..."
              defaultValue={sp.site}
              className="input"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Tipo de trabajo
            </span>
            <input
              name="work"
              placeholder="Buscar trabajo..."
              defaultValue={sp.work}
              className="input"
            />
          </label>

          <div className="flex flex-wrap gap-2 border-t border-slate-200/70 pt-4 dark:border-white/10 sm:col-span-2 lg:col-span-4">
            <button className="btn">
              <span className="mr-1">⌕</span> Aplicar filtros
            </button>

            <Link
              href="/admin/dives"
              className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
            >
              Limpiar filtros
            </Link>

            <a
              href={`/export?scope=class&${qs({})}`}
              className="rounded-xl border border-cyan-200 bg-cyan-50/70 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100 dark:border-cyan-400/20 dark:bg-cyan-400/5 dark:text-cyan-300"
            >
              ↓ Exportar CSV
            </a>
          </div>
        </form>
      </section>

      {/* RESULTADOS */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Registro de actividad</p>
            <h2 className="mt-1 text-xl font-semibold text-navy dark:text-white">
              Resultados
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {count ?? 0} inmersiones encontradas
            </p>
          </div>

          <span className="rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-xs font-medium text-slate-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400">
            Mostrando {data?.length ?? 0} de {count ?? 0}
          </span>
        </div>

        {!data?.length ? (
          <div className="rounded-2xl border border-white/40 bg-white/75 px-5 py-14 text-center shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
            <div className="text-4xl">🤿</div>
            <h3 className="mt-3 font-semibold text-navy dark:text-white">
              No hay inmersiones
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              No se han encontrado registros con los filtros seleccionados.
            </p>
            <Link
              href="/admin/dives"
              className="mt-5 inline-flex rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Quitar filtros
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/75 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-slate-100/80 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/80 dark:text-slate-400">
                  <tr>
                    {[
                      'Alumno',
                      'Nº',
                      'Fecha',
                      'Lugar',
                      'Prof.',
                      'Min',
                      'Trabajo',
                      'Revisión',
                    ].map((h) => (
                      <th key={h} className="px-4 py-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
                  {data.map((d: any) => {
                    const status = d.review_status
                    const statusLabel = ST[status] || 'Sin estado'
                    const detailUrl = `/dives/${d.id}?from=${encodeURIComponent(`/admin/dives?${qs({})}`)}`

                    return (
                      <tr
                        key={d.id}
                        className="transition hover:bg-cyan-50/40 dark:hover:bg-cyan-400/5"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={detailUrl}
                            className="font-semibold text-navy hover:text-cyan-700 dark:text-white dark:hover:text-cyan-300"
                          >
                            {d.profiles?.full_name || '—'}
                          </Link>
                        </td>

                        <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                          {d.dive_number ?? '—'}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                          {d.dive_date}
                        </td>

                        <td className="max-w-[180px] px-4 py-3 font-medium text-navy dark:text-white">
                          <Link href={detailUrl} className="block truncate hover:text-cyan-700 dark:hover:text-cyan-300">
                            {d.site || '—'}
                          </Link>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                          {d.max_depth_m != null ? `${d.max_depth_m} m` : '—'}
                        </td>

                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {d.duration_min ?? '—'}
                        </td>

                        <td className="max-w-[180px] px-4 py-3 text-slate-600 dark:text-slate-300">
                          <Link href={detailUrl} className="block truncate">
                            {d.work_task?.slice(0, 35) || '—'}
                          </Link>
                        </td>

                        <td className="px-4 py-3">
                          <Link href={detailUrl} className="inline-flex flex-col items-start gap-1">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                              {statusLabel}
                            </span>

                            {d.modified_since_review && (
                              <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300">
                                ✎ Modificada
                              </span>
                            )}
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* PAGINACIÓN */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/40 bg-white/75 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Página <strong className="text-navy dark:text-white">{page}</strong> de{' '}
          <strong className="text-navy dark:text-white">{pages}</strong>
          <span className="hidden sm:inline"> · {PAGE} registros por página</span>
        </p>

        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link
              href={`/admin/dives?${qs({ page: page - 1 })}`}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
            >
              ← Anterior
            </Link>
          ) : (
            <span className="rounded-xl border border-slate-200/50 px-4 py-2 text-sm text-slate-300 dark:border-white/5 dark:text-slate-600">
              ← Anterior
            </span>
          )}

          {page < pages ? (
            <Link
              href={`/admin/dives?${qs({ page: page + 1 })}`}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Siguiente →
            </Link>
          ) : (
            <span className="rounded-xl border border-slate-200/50 px-4 py-2 text-sm text-slate-300 dark:border-white/5 dark:text-slate-600">
              Siguiente →
            </span>
          )}
        </div>
      </div>

    </div>
  )
}
