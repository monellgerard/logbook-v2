'use client'

import { deleteAllInactiveInvitations } from './actions'

export default function DeleteHistoryButton({
  count,
}: {
  count: number
}) {
  return (
    <form
      action={deleteAllInactiveInvitations}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `¿Eliminar definitivamente las ${count} invitaciones del historial? Esta acción no se puede deshacer. Las cuentas de alumnos no se verán afectadas.`
          )
        ) {
          event.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-400/20 dark:text-red-300 dark:hover:bg-red-400/10"
      >
        Eliminar todo el historial
      </button>
    </form>
  )
}
