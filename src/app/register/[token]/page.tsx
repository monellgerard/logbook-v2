import { createHash } from 'crypto'
import { adminClient } from '@/lib/supabase/admin'
import { Shell, Msg } from '../../auth-shell'
import { register } from '../actions'
export default async function Register(props: { params: Promise<{ token: string }>; searchParams: Promise<{ error?: string }> }) {
  const { token } = await props.params, sp = await props.searchParams
  const { data: inv } = await adminClient().from('invitations').select('uses, max_uses, expires_at, active').eq('token_hash', createHash('sha256').update(token).digest('hex')).maybeSingle()
  const valid = inv && inv.active && inv.uses < inv.max_uses && (!inv.expires_at || new Date(inv.expires_at) > new Date())
  if (!valid) return <Shell title="Enlace no válido"><p className="text-sm text-slate-600">Este enlace de registro no existe, ha caducado o ya no admite más cuentas. Pide uno nuevo a tu profesor.</p></Shell>
  return <Shell title="Crea tu cuenta de LogBook"><Msg error={sp.error} />
    <form action={register} className="space-y-3"><input type="hidden" name="token" value={token} />
      <input name="name" required placeholder="Nombre y apellidos" className="input" autoComplete="name" />
      <input name="email" type="email" required placeholder="Correo" className="input" autoComplete="email" />
      <input name="password" type="password" minLength={10} required placeholder="Contraseña (mín. 10 caracteres)" className="input" autoComplete="new-password" />
      <button className="btn w-full">Crear cuenta</button></form></Shell>
}
