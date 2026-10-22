import Link from 'next/link'
import { requestReset } from '../actions'
import { Shell, Msg } from '../auth-shell'
export default async function Forgot(props: { searchParams: Promise<{ ok?: string }> }) {
  const searchParams = await props.searchParams
  return <Shell title="Recuperar contraseña"><Msg ok={searchParams.ok} />
    <form action={requestReset} className="space-y-3"><input name="email" type="email" required placeholder="Correo" className="input" />
      <button className="btn w-full">Enviar enlace</button></form>
    <Link href="/login" className="mt-4 block text-center text-sm text-teal-dark">Volver</Link></Shell>
}
