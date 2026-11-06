
import Link from 'next/link'
import { signIn } from '@/app/actions'
import { Shell, Msg } from '../auth-shell'

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await props.searchParams

  return (
    <Shell title="Bienvenido de nuevo">
      <div className="mb-6">
        <p className="text-sm text-slate-500">
          Accede a tu cuenta para consultar y gestionar tus inmersiones.
        </p>
      </div>

      <Msg error={sp.error} />

      <form action={signIn} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-[var(--fg)]"
          >
            Correo electrónico
          </label>

          <input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            className="input"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-[var(--fg)]"
            >
              Contraseña
            </label>

            <Link
              href="/forgot"
              className="text-xs font-semibold text-[var(--accent)] transition hover:opacity-75"
            >
              ¿Has olvidado tu contraseña?
            </Link>
          </div>

          <input
            id="password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="Introduce tu contraseña"
            className="input"
          />
        </div>

        <button
          type="submit"
          className="btn mt-3 w-full"
        >
          Iniciar sesión
        </button>
      </form>

      <div className="mt-6 border-t border-[var(--line)] pt-5 text-center">
        <p className="text-xs leading-5 text-[var(--muted)]">
          ¿No tienes una cuenta?
          <br />
          Solicita un enlace de registro a tu profesor.
        </p>
      </div>
    </Shell>
  )
}
