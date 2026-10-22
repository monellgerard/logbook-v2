import Link from 'next/link'
import { signIn } from '../actions'
import { Shell, Msg } from '../auth-shell'
export default async function Login(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  return <Shell title="Inicia sesión en tu libro de inmersiones"><Msg error={searchParams.error} />
    <form action={signIn} className="space-y-3">
      <input name="email" type="email" required placeholder="Correo" className="input" autoComplete="email" />
      <input name="password" type="password" required placeholder="Contraseña" className="input" autoComplete="current-password" />
      <button className="btn w-full">Entrar</button></form>
    <Link href="/forgot" className="mt-4 block text-center text-sm text-teal-dark">¿Olvidaste la contraseña?</Link></Shell>
}
