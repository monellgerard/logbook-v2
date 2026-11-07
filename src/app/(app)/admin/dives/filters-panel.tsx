
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MONTHS } from '@/lib/filters'

const ST: Record<string, string> = {
  pending: 'Pendiente',
  reviewed: 'Revisada',
  needs_correction: 'Necesita corrección',
}

type Props = {
  student?: string
  year?: string
  month?: string
  review?: string
  from?: string
  to?: string
  site?: string
  work?: string
  students: { id: string; full_name: string | null }[]
  years: number[]
  activeFilters: number
  exportUrl: string
}

export default function FiltersPanel({
  student,
  year,
  month,
  review,
  from,
  to,
  site,
  work,
  students,
  years,
  activeFilters,
  exportUrl,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <section className="overflow-hidden rounded-2xl border border-white/40 bg-white/75 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-50 text-lg dark:bg-cyan-400/10">
            ⌕
          </div>
          <div>
            <h2 className="font-semibold text-navy dark:text-white">
              Filtros de búsqueda
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeFilters
                ? `${activeFilters} filtros activos`
                : 'Todos los registros'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={exportUrl}
            className="rounded-lg border border-cyan-200 bg-cyan-50/70 px-3 py-2 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100 dark:border-cyan-400/20 dark:bg-cyan-400/5 dark:text-cyan-300"
          >
            ↓ CSV
          </a>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-700"
          >
            {open ? 'Ocultar filtros ↑' : 'Mostrar filtros ↓'}
          </button>
        </div>
      </div>

      {open && (
        <form
          key={JSON.stringify({
            student, year, month, review, from, to, site, work,
          })}
          className="grid gap-4 border-t border-slate-200/70 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4 dark:border-white/10"
        >
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Alumno
            </span>
            <select name="student" defaultValue={student ?? ''} className="input">
              <option value="">Todos los alumnos</option>
              {students.map((s) => (
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
            <select name="year" defaultValue={year ?? ''} className="input">
              <option value="">Todos los años</option>
              {years.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Mes
            </span>
            <select name="month" defaultValue={month ?? ''} className="input">
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
            <select name="review" defaultValue={review ?? ''} className="input">
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
            <input name="from" type="date" defaultValue={from} className="input" />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Hasta
            </span>
            <input name="to" type="date" defaultValue={to} className="input" />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Lugar de inmersión
            </span>
            <input name="site" placeholder="Buscar lugar..." defaultValue={site} className="input" />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Tipo de trabajo
            </span>
            <input name="work" placeholder="Buscar trabajo..." defaultValue={work} className="input" />
          </label>

          <div className="flex flex-wrap gap-2 border-t border-slate-200/70 pt-4 dark:border-white/10 sm:col-span-2 lg:col-span-4">
            <button className="btn">
              Aplicar filtros
            </button>

            <Link
              href="/admin/dives"
              className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
            >
              Limpiar filtros
            </Link>
          </div>
        </form>
      )}
    </section>
  )
}
