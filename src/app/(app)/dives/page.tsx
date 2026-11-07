
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

function formatDate(value: string) {
  if (!value) return '—'

  const date = new Date(`${value}T00:00:00`)

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('es-ES', {
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
        No se han podido cargar las inmersiones: {error.message}
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
    <div className="space-y-6">

      {/* CABECERA */}
      <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/65 p-6 shadow-xl backdrop-blur-xl dark:bg-slate-950/40 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              Mi actividad submarina
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-navy dark:text-white sm:text-4xl">
              Mis inmersiones
            </h1>

            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
              Consulta, organiza y revisa todo tu historial de buceo.
            </p>
          </div>

          <Link
            href="/dives/new"
            className="btn inline-flex shrink-0 items-center justify-center gap-2 self-start sm:self-auto"
          >
            <span className="text-lg leading-none">+</span>
            Nueva inmersión
          </Link>
        </div>
      </section>

      {/* RESUMEN */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <div className="rounded-2xl border border-white/30 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:bg-slate-950/35">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {filtered ? 'Inmersiones encontradas' : 'Total de inmersiones'}
            </p>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-700 dark:bg-blue-400/15 dark:text-cyan-300">
              ◉
            </span>
          </div>

          <p className="mt-3 text-3xl font-bold tracking-tight text-navy dark:text-white">
            {total}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Registros {filtered ? 'con los filtros actuales' : 'en tu libro'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/30 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:bg-slate-950/35">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Tiempo bajo el agua
            </p>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-xl text-teal-700 dark:bg-teal-400/15 dark:text-teal-300">
              ◷
            </span>
          </div>

          <p className="mt-3 text-3xl font-bold tracking-tight text-navy dark:text-white">
            {(mins / 60).toFixed(1)}
            <span className="ml-1 text-base font-semibold text-slate-500">h</span>
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Horas acumuladas {filtered ? 'en esta selección' : 'registradas'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/30 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:bg-slate-950/35">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Estado de búsqueda
            </p>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-xl text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300">
              ⌕
            </span>
          </div>

          <p className="mt-3 text-3xl font-bold tracking-tight text-navy dark:text-white">
            {activeFilterCount}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Filtros activos
          </p>
        </div>
      </section>

      {/* FILTROS */}
      <details
        open={filtered}
        className="group overflow-hidden rounded-2xl border border-white/30 bg-white/70 shadow-sm backdrop-blur-xl dark:bg-slate-950/40"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 transition hover:bg-white/40 dark:hover:bg-white/5 [&::-webkit-details-marker]:hidden sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-cyan-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="21"
                height="21"
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
              <p className="font-semibold text-navy dark:text-white">
                Filtrar inmersiones
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fecha, ubicación, profundidad, gas y valoración
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {filtered && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-400/15 dark:text-cyan-300">
                {activeFilterCount} activos
              </span>
            )}

            <span className="text-xl text-slate-500 transition-transform group-open:rotate-180">
              ⌄
            </span>
          </div>
        </summary>

        <div className="border-t border-slate-200/70 p-4 dark:border-white/10 sm:p-5">
          <form
            action="/dives"
            method="GET"
            key={JSON.stringify(sp)}
            className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"
          >
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Año
              </span>
              <select name="year" defaultValue={sp.year ?? ''} className="input w-full">
                <option value="">Todos los años</option>
                {years.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Mes
              </span>
              <select name="month" defaultValue={sp.month ?? ''} className="input w-full">
                <option value="">Todos los meses</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Desde
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
                Hasta
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
                Lugar
              </span>
              <input
                name="site"
                placeholder="Buscar ubicación..."
                defaultValue={sp.site}
                className="input w-full"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Tipo de trabajo
              </span>
              <input
                name="work"
                placeholder="Buscar trabajo..."
                defaultValue={sp.work}
                className="input w-full"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Profundidad mínima (m)
              </span>
              <input
                name="min_depth"
                type="number"
                min={0}
                placeholder="Ej. 10"
                defaultValue={sp.min_depth}
                className="input w-full"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Profundidad máxima (m)
              </span>
              <input
                name="max_depth"
                type="number"
                min={0}
                placeholder="Ej. 40"
                defaultValue={sp.max_depth}
                className="input w-full"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Mezcla de gas
              </span>
              <select name="gas_mix" defaultValue={sp.gas_mix ?? ''} className="input w-full">
                <option value="">Todos los gases</option>
                {OPT.gas_mix.map(([a, b]) => (
                  <option key={a} value={a}>{b}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Valoración mínima
              </span>
              <input
                name="min_rating"
                type="number"
                min={1}
                max={10}
                placeholder="De 1 a 10"
                defaultValue={sp.min_rating}
                className="input w-full"
              />
            </label>

            <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-4">
              <button type="submit" className="btn">
                Aplicar filtros
              </button>

              <Link
                href="/dives"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300/70 px-4 py-2 font-medium text-slate-600 transition hover:bg-slate-100 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10"
              >
                Limpiar filtros
              </Link>
            </div>
          </form>
        </div>
      </details>

      {/* TABLA E HISTORIAL */}
      <section className="overflow-hidden rounded-2xl border border-white/30 bg-white/70 shadow-sm backdrop-blur-xl dark:bg-slate-950/40">

        <div className="flex flex-col justify-between gap-3 border-b border-slate-200/70 p-4 dark:border-white/10 sm:flex-row sm:items-center sm:p-5">
          <div>
            <h2 className="font-bold text-navy dark:text-white">
              Historial de inmersiones
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {filtered
                ? 'Resultados según los filtros seleccionados'
                : 'Todas tus inmersiones registradas'}
            </p>
          </div>

          <a
            href={exp}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-teal-600/25 bg-teal-500/10 px-4 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-500/20 dark:text-teal-300"
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
            Exportar CSV
          </a>
        </div>

        {!data?.length ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl text-blue-700 dark:bg-blue-400/15 dark:text-cyan-300">
              ◉
            </div>

            <h3 className="mt-5 text-lg font-bold text-navy dark:text-white">
              {filtered
                ? 'No hay resultados'
                : 'Tu libro de inmersiones está vacío'}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              {filtered
                ? 'No hemos encontrado inmersiones que coincidan con esos filtros. Prueba a modificarlos.'
                : 'Cuando registres tu primera inmersión, aparecerá aquí todo su historial.'}
            </p>

            {filtered ? (
              <Link href="/dives" className="btn mt-5 inline-flex">
                Quitar filtros
              </Link>
            ) : (
              <Link href="/dives/new" className="btn mt-5 inline-flex">
                + Registrar inmersión
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200/70 bg-slate-100/70 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    {COLS.map(([k, l]) => (
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
                              title="Modificada desde la última revisión"
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
                          {formatDate(d.dive_date)}
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
            <div className="flex flex-col gap-3 border-t border-slate-200/70 p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mostrando {data.length} de {total} inmersiones
              </p>

              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <Link
                    href={q({ page: page - 1 })}
                    className="rounded-xl border border-slate-300/70 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    ← Anterior
                  </Link>
                ) : (
                  <span className="rounded-xl border border-slate-200/50 px-3 py-2 text-sm text-slate-400 dark:border-white/5">
                    ← Anterior
                  </span>
                )}

                <span className="rounded-xl bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800 dark:bg-blue-400/15 dark:text-cyan-300">
                  {page} / {pages}
                </span>

                {page < pages ? (
                  <Link
                    href={q({ page: page + 1 })}
                    className="rounded-xl border border-slate-300/70 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    Siguiente →
                  </Link>
                ) : (
                  <span className="rounded-xl border border-slate-200/50 px-3 py-2 text-sm text-slate-400 dark:border-white/5">
                    Siguiente →
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
