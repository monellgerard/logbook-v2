'use client'

import { useState } from 'react'
import { deleteInvitation, revokeInvitation } from './actions'

type Props = {
  id: string
  note: string | null
  uses: number
  maxUses: number
  expiresAt: string | null
  status: string
  link: string | null
  createdAt: string
}

export default function InvitationRow({
  id,
  note,
  uses,
  maxUses,
  expiresAt,
  status,
  link,
  createdAt,
}: Props) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    if (!link) return

    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const active = status === 'Activo'

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-navy dark:text-white">
            {note || 'Invitación sin nombre'}
          </h3>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Creado el {new Date(createdAt).toLocaleDateString('es-ES')}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            active
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Usos
          </p>
          <p className="mt-1 font-semibold text-navy dark:text-white">
            {uses} / {maxUses}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Caducidad
          </p>
          <p className="mt-1 font-semibold text-navy dark:text-white">
            {expiresAt
              ? new Date(expiresAt).toLocaleDateString('es-ES')
              : 'Nunca'}
          </p>
        </div>

        <div className="col-span-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70 sm:col-span-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Estado
          </p>
          <p className="mt-1 font-semibold text-navy dark:text-white">
            {status}
          </p>
        </div>
      </div>

      {link && active && (
        <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50/70 p-3 dark:border-cyan-400/20 dark:bg-cyan-400/5">
          <p className="mb-2 text-xs font-semibold text-cyan-800 dark:text-cyan-300">
            Enlace de registro vigente
          </p>

          <code className="block break-all text-xs text-slate-700 dark:text-slate-300">
            {link}
          </code>

          <button
            type="button"
            onClick={copyLink}
            className="mt-3 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-700"
          >
            {copied ? '✓ Copiado' : 'Copiar enlace'}
          </button>
        </div>
      )}

      {!link && active && (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
          Este enlace es anterior al nuevo sistema y no se puede recuperar.
          Si necesitas compartirlo, tendrás que crear una nueva invitación.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200/70 pt-4 dark:border-white/10">
        {active && (
          <form
            action={revokeInvitation}
            onSubmit={(event) => {
              if (!window.confirm('¿Quieres revocar este enlace? Dejará de permitir nuevos registros.')) {
                event.preventDefault()
              }
            }}
          >
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="rounded-lg border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 dark:border-amber-400/20 dark:text-amber-300"
            >
              Revocar enlace
            </button>
          </form>
        )}

        <form
          action={deleteInvitation}
          onSubmit={(event) => {
            if (!window.confirm('¿Eliminar definitivamente esta invitación? Esta acción no se puede deshacer.')) {
              event.preventDefault()
            }
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-400/20 dark:text-red-300"
          >
            Eliminar
          </button>
        </form>
      </div>
    </div>
  )
}
