
'use client'

import { useState } from 'react'
import Icon from '@/components/icon'
import PasswordInput from '@/components/password-input'
import { changeOwnPassword } from '@/app/actions'

type Props = {
  title: string
  description: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  placeholder: string
  minLength: string
  buttonText: string
}

export default function PasswordChange({
  title,
  description,
  currentPassword,
  newPassword,
  confirmPassword,
  placeholder,
  minLength,
  buttonText,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--tint)] px-4 py-3 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/10"
      >
        <Icon name="lock" className="h-4 w-4" />
        {buttonText}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-dialog-title"
            className="my-auto w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent-strong)]">
                  <Icon name="lock" className="h-5 w-5" />
                </div>

                <h2
                  id="password-dialog-title"
                  className="text-lg font-bold text-[var(--title)]"
                >
                  {title}
                </h2>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  {description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--tint)] hover:text-[var(--fg)]"
              >
                <Icon name="x" className="h-5 w-5" />
              </button>
            </div>

            <form action={changeOwnPassword} className="space-y-4">
              <label className="block text-sm">
                <span className="mb-2 block font-medium text-[var(--fg)]">
                  {currentPassword}
                </span>
                <PasswordInput
                  id="current_password"
                  name="current_password"
                  autoComplete="current-password"
                  placeholder={placeholder}
                  required
                />
              </label>

              <label className="block text-sm">
                <span className="mb-2 block font-medium text-[var(--fg)]">
                  {newPassword}
                </span>
                <PasswordInput
                  id="new_password"
                  name="new_password"
                  autoComplete="new-password"
                  placeholder={placeholder}
                  required
                />
              </label>

              <label className="block text-sm">
                <span className="mb-2 block font-medium text-[var(--fg)]">
                  {confirmPassword}
                </span>
                <PasswordInput
                  id="confirm_password"
                  name="confirm_password"
                  autoComplete="new-password"
                  placeholder={placeholder}
                  required
                />
              </label>

              <p className="text-xs text-[var(--muted)]">
                {minLength}
              </p>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--tint)]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn inline-flex items-center justify-center gap-2"
                >
                  {buttonText}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
