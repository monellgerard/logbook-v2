
import { createClient } from '@/lib/supabase/server'
import { fetchAll, summarize } from '@/lib/filters'
import Icon from '@/components/icon'
import { Msg } from '../../auth-shell'
import { saveProfile, addCert, deleteCert } from './actions'
import PhotoUploader from './photo-uploader'

export default async function Profile(props: {
  searchParams: Promise<{ error?: string; ok?: string }>
}) {
  const searchParams = await props.searchParams
  const sb = createClient()

  const {
    data: { user },
  } = await sb.auth.getUser()

  const uid = user!.id

  const { data: p } = await sb
    .from('profiles')
    .select('full_name, specialty, organization, avatar_path, role, language')
    .eq('id', uid)
    .single()

  const { data: certs } = await sb
    .from('certifications')
    .select('*')
    .eq('user_id', uid)
    .order('obtained_on', { ascending: false })

  const all = await fetchAll(() =>
    sb
      .from('dives')
      .select('dive_date, duration_min, max_depth_m')
      .eq('user_id', uid)
      .order('dive_date')
      .order('id')
  )

  const { data: photos } = await sb
    .from('profile_photos')
    .select('path, status, reject_reason')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(1)

  const last = photos?.[0]
  const isAdmin = p?.role === 'admin'

  const url = async (path?: string | null) =>
    path
      ? (await sb.storage.from('avatars').createSignedUrl(path, 3600))
          .data?.signedUrl || undefined
      : undefined

  const photo = await url(p?.avatar_path)
  const pendingUrl =
    last?.status === 'pending' ? await url(last.path) : undefined

  const t = summarize(all)

  const years = [...new Set(all.map((d) => d.dive_date.slice(0, 4)))]
    .sort()
    .reverse()

  const byYear = years.map((y) => ({
    y,
    ...summarize(all.filter((d) => d.dive_date.startsWith(y))),
  }))

  const maxH = Math.max(1, ...byYear.map((r) => r.hours))
  const today = new Date().toISOString().slice(0, 10)

  const tiles: [string, string | number, string][] = [
    ['Inmersiones', t.n, 'Registros realizados'],
    ['Horas bajo el agua', t.hours.toFixed(1), 'Tiempo acumulado'],
    [
      'Profundidad máxima',
      t.maxDepth !== null ? `${t.maxDepth} m` : '—',
      'Mayor profundidad',
    ],
    [
      'Duración media',
      t.avg !== null ? `${t.avg} min` : '—',
      'Por inmersión',
    ],
    ['Primera inmersión', t.first ?? '—', 'Fecha del primer registro'],
    ['Última inmersión', t.last ?? '—', 'Fecha del último registro'],
  ]

  return (
    <div className="w-full space-y-6 pb-8">

      {/* CABECERA */}
      <header className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--accent-strong)]">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            Área personal
          </span>

          <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--title)] sm:text-4xl">
                Mi perfil
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
                Tu ficha personal, experiencia bajo el agua y certificaciones
                profesionales.
              </p>
            </div>

            <span className="self-start rounded-full border border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--muted)] sm:self-auto">
              {isAdmin ? 'Administrador' : 'Buceador'}
            </span>
          </div>
        </div>
      </header>

      {/* MENSAJES */}
      <Msg error={searchParams.error} ok={searchParams.ok} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">

        {/* COLUMNA DE PERFIL */}
        <aside className="space-y-5 lg:sticky lg:top-6">

          <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 text-center shadow-[var(--shadow)] backdrop-blur-xl sm:p-6">
            <div className="relative mx-auto aspect-square w-full max-w-[20rem] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--tint)]">
              {photo ? (
                <img
                  src={photo}
                  alt="Tu fotografía"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-[var(--muted)]">
                  <Icon name="user" className="h-24 w-24 opacity-40" />
                </div>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-tight text-[var(--title)]">
              {p?.full_name || 'Sin nombre'}
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {[p?.specialty, p?.organization].filter(Boolean).join(' · ') ||
                'Completa tus datos para personalizar tu ficha'}
            </p>

            <div className="mt-5">
              <PhotoUploader hasPhoto={!!photo} />
            </div>

            {!isAdmin && last?.status === 'pending' && (
              <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-left text-xs text-amber-800 dark:text-amber-200">
                <p className="font-semibold">
                  ⏳ Foto pendiente de aprobación
                </p>
                <p className="mt-1">
                  El profesor debe aprobar tu fotografía antes de que sea
                  visible.
                </p>
                {pendingUrl && (
                  <img
                    src={pendingUrl}
                    alt="Fotografía pendiente"
                    className="mx-auto mt-3 h-16 w-16 rounded-xl object-cover"
                  />
                )}
              </div>
            )}

            {!isAdmin && last?.status === 'rejected' && (
              <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-left text-xs text-red-700 dark:text-red-300">
                <p className="font-semibold">Fotografía rechazada</p>
                {last.reject_reason && (
                  <p className="mt-1">{last.reject_reason}</p>
                )}
                <p className="mt-1">Puedes subir otra fotografía.</p>
              </div>
            )}

            {!isAdmin && !last && !photo && (
              <p className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--tint)] p-3 text-xs text-[var(--muted)]">
                El profesor debe aprobar tu foto antes de que sea visible.
              </p>
            )}
          </section>

          {/* RESUMEN PERSONAL */}
          <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-[var(--title)]">
              Resumen de actividad
            </h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-[var(--muted)]">Años de actividad</span>
                <span className="font-semibold text-[var(--fg)]">
                  {years.length}
                </span>
              </div>

              <div className="h-px bg-[var(--line)]" />

              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-[var(--muted)]">Certificaciones</span>
                <span className="font-semibold text-[var(--fg)]">
                  {certs?.length ?? 0}
                </span>
              </div>

              <div className="h-px bg-[var(--line)]" />

              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-[var(--muted)]">Perfil</span>
                <span className="font-semibold text-[var(--accent-strong)]">
                  {p?.full_name ? 'Personalizado' : 'Incompleto'}
                </span>
              </div>
            </div>
          </section>
        </aside>

        {/* COLUMNA PRINCIPAL */}
        <div className="min-w-0 space-y-6">

          {/* ESTADÍSTICAS */}
          <section>
            <div className="mb-3">
              <h2 className="text-lg font-bold text-[var(--title)]">
                Mi actividad
              </h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Resumen de toda tu trayectoria registrada.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {tiles.map(([k, v, description], i) => (
                <div
                  key={k}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5"
                >
                  <p className="text-xs font-medium text-[var(--muted)]">
                    {k}
                  </p>

                  <p className="mt-3 break-words text-2xl font-bold tracking-tight text-[var(--title)]">
                    {v}
                  </p>

                  <p className="mt-1 text-[11px] text-[var(--muted)]">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* DATOS PERSONALES */}
          <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] backdrop-blur-xl">
            <div className="border-b border-[var(--line)] px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-lg text-[var(--accent-strong)]">
                  <Icon name="user" className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold text-[var(--title)]">
                    Datos personales
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Información de tu perfil profesional.
                  </p>
                </div>
              </div>
            </div>

            <form action={saveProfile} className="fit-grid items-end p-5 sm:p-6">
              <label className="block text-sm">
                <span className="mb-2 block font-medium text-[var(--fg)]">
                  Nombre y apellidos *
                </span>
                <input
                  name="full_name"
                  required
                  defaultValue={p?.full_name}
                  placeholder="Nombre completo"
                  className="input"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-2 block font-medium text-[var(--fg)]">
                  Especialidad o función
                </span>
                <input
                  name="specialty"
                  defaultValue={p?.specialty ?? ''}
                  placeholder="Ej. Buceador profesional"
                  className="input"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-2 block font-medium text-[var(--fg)]">
                  Centro formativo o empresa
                </span>
                <input
                  name="organization"
                  defaultValue={p?.organization ?? ''}
                  placeholder="Nombre de empresa o centro"
                  className="input"
                />
              </label>

              <div>
                <button className="btn inline-flex items-center justify-center gap-2">
                  Guardar cambios
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          </section>

          {/* EVOLUCIÓN ANUAL */}
          <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] backdrop-blur-xl">
            <div className="border-b border-[var(--line)] px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-lg text-[var(--accent-strong)]">
                  <Icon name="chart-no-axes-combined" className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold text-[var(--title)]">
                    Evolución por años
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Inmersiones y horas acumuladas cada año.
                  </p>
                </div>
              </div>
            </div>

            {!byYear.length ? (
              <div className="p-8 text-center">
                <p className="text-sm text-[var(--muted)]">
                  Cuando registres inmersiones verás aquí tu evolución.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto p-4 sm:p-5">
                <table className="w-full min-w-[540px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--line)] text-xs text-[var(--muted)]">
                      <th className="p-3 font-semibold">Año</th>
                      <th className="p-3 font-semibold">Inmersiones</th>
                      <th className="w-1/2 p-3 font-semibold">Horas</th>
                      <th className="p-3 font-semibold">Prof. máx.</th>
                    </tr>
                  </thead>

                  <tbody>
                    {byYear.map((r) => (
                      <tr
                        key={r.y}
                        className="border-b border-[var(--line)] last:border-0"
                      >
                        <td className="p-3 font-semibold tabular-nums text-[var(--title)]">
                          {r.y}
                        </td>

                        <td className="p-3 font-medium text-[var(--fg)]">
                          {r.n}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--tint)]">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[var(--g1)] to-[var(--g2)]"
                                style={{
                                  width: `${(r.hours / maxH) * 100}%`,
                                  transformOrigin: 'left',
                                }}
                              />
                            </div>

                            <span className="w-14 text-right text-xs font-medium tabular-nums text-[var(--fg)]">
                              {r.hours.toFixed(1)} h
                            </span>
                          </div>
                        </td>

                        <td className="p-3 font-medium text-[var(--fg)]">
                          {r.maxDepth !== null ? `${r.maxDepth} m` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* CERTIFICACIONES */}
          <section
            id="certificaciones"
            className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] backdrop-blur-xl"
          >
            <div className="border-b border-[var(--line)] px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-lg text-[var(--accent-strong)]">
                  <Icon name="award" className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold text-[var(--title)]">
                    Certificaciones y titulaciones
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Tus acreditaciones y cualificaciones profesionales.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {!certs?.length ? (
                <div className="mb-5 rounded-xl border border-dashed border-[var(--line)] bg-[var(--tint)] p-5 text-center">
                  <p className="text-sm font-medium text-[var(--fg)]">
                    Todavía no tienes certificaciones.
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Añade tus titulaciones para tenerlas organizadas en tu ficha.
                  </p>
                </div>
              ) : (
                <ul className="mb-6 grid gap-3 md:grid-cols-2">
                  {certs.map((c) => {
                    const expired = c.expires_on && c.expires_on < today

                    return (
                      <li
                        key={c.id}
                        className="flex min-w-0 items-start justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--tint)]/60 p-4"
                      >
                        <div className="min-w-0">
                          <div className="break-words font-semibold text-[var(--title)]">
                            {c.title}
                          </div>

                          <div className="mt-1 text-sm text-[var(--muted)]">
                            {c.issuer}
                          </div>

                          <div className="mt-2 space-y-1 text-xs text-[var(--muted)]">
                            <p>Obtenida: {c.obtained_on}</p>

                            {c.expires_on && (
                              <p className={expired ? 'font-semibold text-red-600 dark:text-red-300' : ''}>
                                Caducidad: {c.expires_on}
                                {expired ? ' · CADUCADA' : ''}
                              </p>
                            )}

                            {c.cert_number && (
                              <p>Nº {c.cert_number}</p>
                            )}
                          </div>
                        </div>

                        <form action={deleteCert} className="shrink-0">
                          <input
                            type="hidden"
                            name="id"
                            value={c.id}
                          />
                          <button className="rounded-lg border border-red-400/30 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-500/10 dark:text-red-300">
                            Quitar
                          </button>
                        </form>
                      </li>
                    )
                  })}
                </ul>
              )}

              <div className="mb-4 border-t border-[var(--line)] pt-5">
                <h3 className="font-semibold text-[var(--title)]">
                  Añadir certificación
                </h3>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Introduce los datos que aparecen en tu acreditación.
                </p>
              </div>

              <form action={addCert} className="fit-grid items-end">
                <input
                  name="title"
                  required
                  placeholder="Titulación *"
                  className="input"
                />

                <input
                  name="issuer"
                  required
                  placeholder="Organismo emisor *"
                  className="input"
                />

                <label className="block text-xs font-medium text-[var(--muted)]">
                  Fecha de obtención *
                  <input
                    name="obtained_on"
                    type="date"
                    required
                    className="input mt-2"
                  />
                </label>

                <label className="block text-xs font-medium text-[var(--muted)]">
                  Caducidad (si existe)
                  <input
                    name="expires_on"
                    type="date"
                    className="input mt-2"
                  />
                </label>

                <input
                  name="cert_number"
                  placeholder="Nº de certificación (opcional)"
                  className="input"
                />

                <div>
                  <button className="btn inline-flex items-center justify-center gap-2">
                    Añadir certificación
                    <span aria-hidden="true">+</span>
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
