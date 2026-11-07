'use client'

import { useActionState, useState } from 'react'
import { createInvitation } from './actions'

export default function NewInvite() {
  const [s, action, pending] = useActionState(
    createInvitation,
    {} as { link?: string; error?: string }
  )

  const [copied, setCopied] = useState(false)

  async function copyLink() {
    if (!s.link) return

    try {
      await navigator.clipboard.writeText(s.link)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-white/40 bg-white/75 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
      <div className="border-b border-slate-200/70 p-5 dark:border-white/10">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600 dark:text-cyan-400">
          Nueva invitación
        </p>

        <h2 className="text-lg font-bold text-navy dark:text-white">
          Crear enlace de registro
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Genera un enlace para que tus alumnos puedan crear su cuenta.
        </p>
      </div>

      <form action={action} className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Nota identificativa
          </span>

          <input
            name="note"
            placeholder="Ej. Clase 2026"
            className="input"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Número de usos
          </span>

          <input
            name="max"
            type="number"
            min={1}
            max={500}
            defaultValue={30}
            required
            className="input"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Caducidad (días)
          </span>

          <input
            name="days"
            type="number"
            min={0}
            max={365}
            defaultValue={14}
            required
            className="input"
          />

          <span className="mt-1 block text-[11px] text-slate-400">
            0 significa que no caduca.
          </span>
        </label>

        <button
          className="btn w-full sm:col-span-2 lg:col-span-4 lg:w-48"
          disabled={pending}
        >
          {pending ? 'Creando enlace…' : '+ Crear enlace'}
        </button>
      </form>

      {s.error && (
        <div className="mx-5 mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {s.error}
        </div>
      )}

      {s.link && (
        <div className="mx-5 mb-5 rounded-xl border border-cyan-200 bg-cyan-50/80 p-4 dark:border-cyan-400/20 dark:bg-cyan-400/10">
          <p className="mb-2 font-semibold text-cyan-900 dark:text-cyan-200">
            Enlace creado correctamente
          </p>

          <code className="block break-all rounded-lg bg-white/80 p-3 text-xs text-slate-700 dark:bg-slate-950/50 dark:text-slate-200">
            {s.link}
          </code>

          <button
            type="button"
            onClick={copyLink}
            className="mt-3 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            {copied ? '✓ Enlace copiado' : 'Copiar enlace'}
          </button>

          <p className="mt-2 text-xs text-cyan-800 dark:text-cyan-300">
            También podrás consultar y copiar este enlace desde el listado de invitaciones.
          </p>
        </div>
      )}

      <div className="border-t border-slate-200/70 px-5 py-4 dark:border-white/10">
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Cualquier persona que tenga el enlace podrá crear una cuenta hasta
          agotar los usos disponibles o alcanzar la fecha de caducidad.
          Comparte los enlaces únicamente con tus alumnos.
        </p>
      </div>
    </section>
  )
}
