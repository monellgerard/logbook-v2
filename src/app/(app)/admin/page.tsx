
import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { fetchAll, summarize, monthly, MONTHS } from '@/lib/filters'
import { createStudent } from './students/actions'
import { reviewPhoto } from './actions'
import { Msg } from '../../auth-shell'

export default async function Admin(props: {
  searchParams: Promise<{ error?: string; ok?: string; year?: string }>
}) {
  const searchParams = await props.searchParams
  const { sb } = await requireAdmin()

  const { data: people } = await sb
    .from('profiles')
    .select('id, full_name, role, active, avatar_path')
    .order('full_name')

  const { data: pending } = await sb
    .from('profile_photos')
    .select('id, path, profiles!profile_photos_user_id_fkey(full_name)')
    .eq('status', 'pending')
    .order('created_at')

  const all = await fetchAll(() =>
    sb
      .from('dives')
      .select('user_id, dive_date, duration_min, max_depth_m, profiles!dives_user_id_fkey!inner(role)')
      .eq('profiles.role', 'student')
      .order('dive_date')
      .order('id')
  )

  const cur = String(new Date().getFullYear())
  const year = searchParams.year || cur

  const years = [...new Set([
    cur,
    ...all.map((d) => d.dive_date.slice(0, 4)),
  ])].sort().reverse()

  const t = summarize(all)
  const m = monthly(all, year)
  const top = Math.max(1, ...m.map((x) => x.hours))

  const students = (people ?? []).filter((p) => p.role === 'student')

  const paths = [
    ...(pending ?? []).map((p) => p.path),
    ...(people ?? []).map((p) => p.avatar_path).filter(Boolean),
  ] as string[]

  const { data: signed } = paths.length
    ? await sb.storage.from('avatars').createSignedUrls(paths, 3600)
    : { data: [] }

  const u = (p?: string | null) =>
    signed?.find((s) => s.path === p)?.signedUrl || undefined

  const stats = [
    {
      label: 'Alumnos',
      value: students.length,
      detail: 'Cuentas registradas',
      icon: '👥',
    },
    {
      label: 'Inmersiones',
      value: t.n,
      detail: 'Actividad de la clase',
      icon: '🤿',
    },
    {
      label: 'Horas bajo el agua',
      value: t.hours.toFixed(1),
      detail: 'Tiempo acumulado',
      icon: '⏱️',
    },
    {
      label: 'Profundidad máxima',
      value: t.maxDepth !== null ? `${t.maxDepth} m` : '—',
      detail: 'Récord de la clase',
      icon: '🌊',
    },
  ]

  return (
    <div className="space-y-7">

      {/* CABECERA */}
      <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#082b43] via-[#0b3b59] to-[#087e91] p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-52 w-52 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
            Panel de administración
          </p>

          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Gestión de la clase
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100/80">
            Supervisa la actividad de tus alumnos, revisa sus fotografías y
            administra sus cuentas desde un único lugar.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/dives"
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
            >
              Ver todas las inmersiones →
            </Link>

            <a
              href="/export?scope=class"
              className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-[#082b43] transition hover:bg-cyan-200"
            >
              Exportar datos CSV ↓
            </a>
          </div>
        </div>
      </header>

      <Msg error={searchParams.error} ok={searchParams.ok} />

      {/* ESTADÍSTICAS */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="card-lift rounded-2xl border border-white/40 bg-white/75 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {s.label}
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-50 text-lg dark:bg-cyan-400/10">
                {s.icon}
              </span>
            </div>

            <div className="mt-3 text-2xl font-semibold tracking-tight text-navy dark:text-white sm:text-3xl">
              {s.value}
            </div>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {s.detail}
            </p>
          </div>
        ))}
      </section>

      {/* ACTIVIDAD MENSUAL */}
      <section className="overflow-hidden rounded-2xl border border-white/40 bg-white/75 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Seguimiento anual</p>
            <h2 className="mt-1 text-xl font-semibold text-navy dark:text-white">
              Actividad de la clase
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Horas e inmersiones registradas durante el año.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {years.map((a) => (
              <Link
                key={a}
                href={`/admin?year=${a}`}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  a === year
                    ? 'border-cyan-500 bg-cyan-500 text-white'
                    : 'border-slate-200 bg-white/70 text-slate-600 hover:border-cyan-400 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {a}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-7 flex h-48 items-end gap-1.5 sm:gap-3">
          {m.map((x, i) => (
            <div
              key={i}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
              title={`${MONTHS[i]}: ${x.n} inmersiones, ${x.hours.toFixed(1)} h`}
            >
              <span className="mb-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:text-xs">
                {x.n || ''}
              </span>

              <div className="flex h-[78%] w-full items-end overflow-hidden rounded-t-md bg-slate-100/70 dark:bg-slate-800/70">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-[#087e91] to-cyan-400 transition-all duration-500"
                  style={{
                    height: `${(x.hours / top) * 100}%`,
                    minHeight: x.n ? 4 : 0,
                  }}
                />
              </div>

              <span className="mt-2 text-[9px] font-medium uppercase text-slate-500 dark:text-slate-400 sm:text-[11px]">
                {MONTHS[i].slice(0, 3)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-200/70 pt-4 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-cyan-400" />
            Horas de inmersión
          </span>
          <span>Número sobre cada barra = inmersiones</span>
        </div>
      </section>

      {/* FOTOGRAFÍAS PENDIENTES */}
      {!!pending?.length && (
        <section className="overflow-hidden rounded-2xl border border-amber-300/50 bg-white/80 shadow-sm backdrop-blur-xl dark:border-amber-400/20 dark:bg-slate-900/60">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/60 bg-amber-50/70 px-5 py-4 dark:border-amber-400/10 dark:bg-amber-400/5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Revisión necesaria
              </p>
              <h2 className="mt-1 text-lg font-semibold text-navy dark:text-white">
                Fotografías pendientes
              </h2>
            </div>

            <span className="rounded-full bg-amber-200/70 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-400/15 dark:text-amber-200">
              {pending.length} pendientes
            </span>
          </div>

          <div className="divide-y divide-slate-200/70 dark:divide-white/10">
            {pending.map((f: any) => (
              <div
                key={f.id}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5"
              >
                {u(f.path) ? (
                  <img
                    src={u(f.path)}
                    alt=""
                    className="h-24 w-24 shrink-0 rounded-xl border border-slate-200 object-cover shadow-sm dark:border-white/10"
                  />
                ) : (
                  <div className="grid h-24 w-24 shrink-0 place-items-center rounded-xl bg-slate-100 text-2xl dark:bg-slate-800">
                    🤿
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy dark:text-white">
                    {f.profiles?.full_name || '(sin nombre)'}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Solicitud de aprobación de fotografía
                  </p>

                  <form
                    action={reviewPhoto}
                    className="mt-3 flex flex-wrap items-center gap-2"
                  >
                    <input type="hidden" name="id" value={f.id} />

                    <input
                      name="reason"
                      placeholder="Motivo si la rechazas"
                      className="input min-w-0 flex-1 sm:max-w-xs"
                    />

                    <button
                      name="decision"
                      value="approved"
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      ✓ Aprobar
                    </button>

                    <button
                      name="decision"
                      value="rejected"
                      className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300"
                    >
                      Rechazar
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LISTADO DE ALUMNOS */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Gestión de usuarios</p>
            <h2 className="mt-1 text-xl font-semibold text-navy dark:text-white">
              Alumnos
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Consulta el progreso y el estado de cada alumno.
            </p>
          </div>

          <span className="rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
            {students.length} alumnos
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/75 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-100/80 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/80 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-4">Alumno</th>
                  <th className="px-3 py-4">Inmersiones</th>
                  <th className="px-3 py-4">Horas</th>
                  <th className="px-3 py-4">Prof. máx.</th>
                  <th className="px-3 py-4">Última</th>
                  <th className="px-4 py-4 text-center">Estado</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
                {students.map((p) => {
                  const s = summarize(all.filter((d) => d.user_id === p.id))

                  return (
                    <tr
                      key={p.id}
                      className="transition hover:bg-cyan-50/40 dark:hover:bg-cyan-400/5"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/students/${p.id}`}
                          className="group flex items-center gap-3"
                        >
                          {u(p.avatar_path) ? (
                            <img
                              src={u(p.avatar_path)}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover dark:border-white/10"
                            />
                          ) : (
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cyan-50 text-lg dark:bg-cyan-400/10">
                              🤿
                            </div>
                          )}

                          <span className="font-semibold text-navy transition group-hover:text-cyan-700 dark:text-white dark:group-hover:text-cyan-300">
                            {p.full_name || '(sin nombre)'}
                          </span>
                        </Link>
                      </td>

                      <td className="px-3 py-3 font-medium text-navy dark:text-white">
                        {s.n}
                      </td>

                      <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                        {s.hours.toFixed(1)} h
                      </td>

                      <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                        {s.maxDepth !== null ? `${s.maxDepth} m` : '—'}
                      </td>

                      <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                        {s.last ?? '—'}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            p.active
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {p.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {!students.length && (
            <div className="px-5 py-12 text-center">
              <div className="text-3xl">🤿</div>
              <p className="mt-3 font-medium text-navy dark:text-white">
                Todavía no hay alumnos
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Cuando crees una cuenta, aparecerá aquí.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CREAR ALUMNO */}
      <section className="overflow-hidden rounded-2xl border border-white/40 bg-white/75 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
        <div className="border-b border-slate-200/70 px-5 py-4 dark:border-white/10 sm:px-6">
          <p className="eyebrow">Nuevas cuentas</p>
          <h2 className="mt-1 text-xl font-semibold text-navy dark:text-white">
            Crear alumno
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Registra un nuevo alumno y genera sus credenciales de acceso.
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <form
            action={createStudent}
            className="grid gap-4 sm:grid-cols-2"
          >
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-600 dark:text-slate-300">
                Nombre y apellidos *
              </span>
              <input
                name="name"
                required
                placeholder="Nombre completo"
                className="input"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-600 dark:text-slate-300">
                Correo electrónico *
              </span>
              <input
                name="email"
                type="email"
                required
                placeholder="alumno@correo.com"
                className="input"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-600 dark:text-slate-300">
                Contraseña provisional *
              </span>
              <input
                name="password"
                type="password"
                minLength={10}
                required
                placeholder="Mínimo 10 caracteres"
                className="input"
                autoComplete="new-password"
              />
            </label>

            <div className="flex items-end">
              <button className="btn w-full sm:w-auto">
                + Crear alumno
              </button>
            </div>
          </form>

          <div className="mt-5 flex gap-3 rounded-xl border border-cyan-200/70 bg-cyan-50/70 p-3 dark:border-cyan-400/10 dark:bg-cyan-400/5">
            <span className="text-lg">🔒</span>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Entrega la contraseña por un canal privado. El alumno podrá
              cambiarla posteriormente desde su cuenta.
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
