import { requireAdmin } from '@/lib/admin'
import { Msg } from '../../../auth-shell'
import NewInvite from './new-invite'
import InvitationRow from './invitation-row'
import { decryptInvitationToken } from '@/lib/invitation-crypto'

export default async function Invitations(props: {
  searchParams: Promise<{ ok?: string; error?: string }>
}) {
  const sp = await props.searchParams
  const { sb } = await requireAdmin()

  const { data, error } = await sb
    .from('invitations')
    .select(
      'id, note, uses, max_uses, expires_at, active, created_at, token_encrypted'
    )
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        No se pudieron cargar las invitaciones: {error.message}
      </div>
    )
  }

  const siteUrl = (
    process.env.SITE_URL || 'http://localhost:3000'
  ).replace(/\/+$/, '')

  const invitations = (data ?? []).map((i) => {
    let status = 'Activo'

    if (!i.active) {
      status = 'Revocado'
    } else if (
      i.expires_at &&
      new Date(i.expires_at).getTime() < Date.now()
    ) {
      status = 'Caducado'
    } else if (i.uses >= i.max_uses) {
      status = 'Agotado'
    }

    const token = decryptInvitationToken(i.token_encrypted)

    return {
      id: i.id,
      note: i.note,
      uses: i.uses,
      maxUses: i.max_uses,
      expiresAt: i.expires_at,
      status,
      createdAt: i.created_at,
      link: token ? `${siteUrl}/register/${token}` : null,
    }
  })

  const activeInvitations = invitations.filter(
    (i) => i.status === 'Activo'
  )

  const oldInvitations = invitations.filter(
    (i) => i.status !== 'Activo'
  )

  return (
    <>
      {/* CABECERA */}
      <div className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-400">
          Administración
        </p>

        <h1 className="text-2xl font-bold text-navy dark:text-white sm:text-3xl">
          Enlaces de registro
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gestiona las invitaciones para registrar nuevos alumnos.
        </p>
      </div>

      {/* MENSAJES */}
      <Msg error={sp.error} ok={sp.ok} />

      {/* RESUMEN */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/40 bg-white/75 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total de invitaciones
          </p>
          <p className="mt-2 text-2xl font-bold text-navy dark:text-white">
            {invitations.length}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-4 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-400/5">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            Enlaces vigentes
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-800 dark:text-emerald-200">
            {activeInvitations.length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/40 bg-white/75 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Historial
          </p>
          <p className="mt-2 text-2xl font-bold text-navy dark:text-white">
            {oldInvitations.length}
          </p>
        </div>
      </div>

      {/* CREAR INVITACIÓN */}
      <NewInvite />

      {/* ENLACES VIGENTES */}
      <section className="mb-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-navy dark:text-white">
              Enlaces vigentes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Invitaciones que todavía permiten nuevos registros.
            </p>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            {activeInvitations.length} activos
          </span>
        </div>

        {activeInvitations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-7 text-center dark:border-white/10">
            <p className="font-medium text-slate-600 dark:text-slate-300">
              No hay enlaces vigentes.
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Puedes crear una nueva invitación desde el formulario superior.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {activeInvitations.map((i) => (
              <InvitationRow key={i.id} {...i} />
            ))}
          </div>
        )}
      </section>

      {/* HISTORIAL */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-navy dark:text-white">
            Historial de invitaciones
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enlaces revocados, caducados o que han agotado sus usos.
          </p>
        </div>

        {oldInvitations.length === 0 ? (
          <p className="rounded-xl bg-white/60 p-5 text-sm text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
            Todavía no hay invitaciones en el historial.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {oldInvitations.map((i) => (
              <InvitationRow key={i.id} {...i} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
