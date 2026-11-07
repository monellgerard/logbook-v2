import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { applyFilters, type P } from '@/lib/filters'
import FiltersPanel from './filters-panel'

const PAGE = 25

const ST: Record<string, string> = {
  pending: 'Pendiente',
  reviewed: 'Revisada',
  needs_correction: 'Necesita corrección',
}

export default async function ClassDives(props: {
  searchParams: Promise<
    P & {
      page?: string
      student?: string
      review?: string
    }
  >
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

  const { data, count, error } = await applyFilters(q, sp)
    .order('dive_date', { ascending: false })
    .order('id')
    .range((page - 1) * PAGE, page * PAGE - 1)

  if (error) {
    return <p className="text-red-700">Error: {error.message}</p>
  }

  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE))

  const qs = (o: Record<string, string | number>) =>
    new URLSearchParams(
      Object.entries({ ...sp, ...o })
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)])
    ).toString()

  const yr = new Date().getFullYear()
  const years = Array.from({ length: 12 }, (_, i) => yr - i)

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
    <>
      {/* CABECERA */}
      <div className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-400">
          Administración
        </p>

        <h1 className="text-2xl font-bold text-navy dark:text-white sm:text-3xl">
          Inmersiones de la clase
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Consulta y revisa las inmersiones registradas por tus alumnos.
        </p>

        <div className="mt-4 inline-flex items-center rounded-xl border border-cyan-200/70 bg-cyan-50/70 px-4 py-2 text-sm font-semibold text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300">
          {count ?? 0} inmersiones registradas
        </div>
      </div>

      {/* FILTROS */}
      <FiltersPanel
        student={sp.student}
        year={sp.year}
        month={sp.month}
        review={sp.review}
        from={sp.from}
        to={sp.to}
        site={sp.site}
        work={sp.work}
        students={students ?? []}
        years={years}
        activeFilters={activeFilters}
        exportUrl={`/export?scope=class&${qs({})}`}
      />

      {/* RESULTADOS */}
      {!data?.length ? (
        <div className="mt-5 rounded-2xl border border-white/40 bg-white/75 p-8 text-center shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <div className="mb-3 text-3xl">⌕</div>
          <p className="font-semibold text-navy dark:text-white">
            No hay inmersiones
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            No se han encontrado inmersiones con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/40 bg-white/80 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
            <div>
              <h2 className="font-semibold text-navy dark:text-white">
                Registro de inmersiones
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Listado de inmersiones de todos los alumnos
              </p>
            </div>

            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {data.length} resultados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
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
                    <th key={h} className="whitespace-nowrap p-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.map((d: any) => (
                  <tr
                    key={d.id}
                    className="border-t border-slate-100 transition hover:bg-cyan-50/40 dark:border-white/5 dark:hover:bg-cyan-400/5"
                  >
                    {[
                      d.profiles?.full_name || '—',
                      d.dive_number,
                      d.dive_date,
                      d.site,
                      d.max_depth_m,
                      d.duration_min,
                      d.work_task?.slice(0, 35) ?? '—',
                      (ST[d.review_status] ?? 'Sin estado') +
                        (d.modified_since_review ? ' ✎ modificada' : ''),
                    ].map((c, i) => (
                      <td key={i} className="whitespace-nowrap p-3">
                        <Link
                          href={`/dives/${d.id}?from=${encodeURIComponent(
                            `/admin/dives?${qs({})}`
                          )}`}
                          className="block text-slate-700 transition hover:text-cyan-700 dark:text-slate-300 dark:hover:text-cyan-300"
                        >
                          {c}
                        </Link>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGINACIÓN */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="text-slate-500 dark:text-slate-400">
          Página {page} de {pages}
        </span>

        <div className="flex items-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/dives?${qs({ page: page - 1 })}`}
              className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 font-medium text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
            >
              ← Anterior
            </Link>
          )}

          {page < pages && (
            <Link
              href={`/admin/dives?${qs({ page: page + 1 })}`}
              className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 font-medium text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
            >
              Siguiente →
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
