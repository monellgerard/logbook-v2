'use server'
import { createHash } from 'crypto'
import { redirect } from 'next/navigation'
import { adminClient } from '@/lib/supabase/admin'
export async function register(fd: FormData) {
  const token = String(fd.get('token') ?? ''), name = String(fd.get('name') ?? '').trim(), email = String(fd.get('email') ?? '').trim().toLowerCase(), pw = String(fd.get('password') ?? '')
  const back = (m: string): never => redirect(`/register/${encodeURIComponent(token)}?error=${encodeURIComponent(m)}`)
  if (!name || !email) back('Nombre y correo son obligatorios.')
  if (pw.length < 10) back('La contraseña debe tener al menos 10 caracteres.')
  const a = adminClient(), hash = createHash('sha256').update(token).digest('hex')
  const { data: ok } = await a.rpc('use_invitation', { p_hash: hash })
  if (!ok) back('El enlace ya no es válido.')
  const { error } = await a.auth.admin.createUser({ email, password: pw, email_confirm: true, user_metadata: { full_name: name } })
  if (error) { await a.rpc('release_invitation', { p_hash: hash }); back('No se pudo crear la cuenta. Es posible que ese correo ya esté registrado.') }
  redirect('/login?ok=' + encodeURIComponent('Cuenta creada. Ya puedes iniciar sesión.'))
}
