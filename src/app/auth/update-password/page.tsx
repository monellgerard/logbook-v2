import { updatePassword } from '../../actions'
import { Shell, Msg } from '../../auth-shell'
export default async function Update(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  return <Shell title="Elige tu contraseña"><Msg error={searchParams.error} />
    <form action={updatePassword} className="space-y-3">
      <input name="password" type="password" minLength={10} required placeholder="Nueva contraseña (mín. 10)" className="input" autoComplete="new-password" />
      <button className="btn w-full">Guardar</button></form></Shell>
}
