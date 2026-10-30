import { signIn } from '../actions'
import { Shell, Msg } from '../auth-shell'
export default async function Login(props: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const searchParams = await props.searchParams
  return <Shell hero><Msg error={searchParams.error} ok={searchParams.ok} />
    <form action={signIn} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-center">
      <input name="email" type="email" required placeholder="USUARIO (CORREO ELECTRÓNICO)" className="input" autoComplete="email" />
      <input name="password" type="password" required placeholder="CONTRASEÑA" className="input" autoComplete="current-password" />
      <button className="btn md:min-w-[9rem]">Entrar</button></form></Shell>
}
