'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
const site = () => process.env.SITE_URL || 'http://localhost:3000'
const go = (path: string, k: string, m: string) => redirect(`${path}?${k}=${encodeURIComponent(m)}`)

export async function signIn(fd: FormData) {
  const { error } = await createClient().auth.signInWithPassword({ email: String(fd.get('email')).trim(), password: String(fd.get('password')) })
  if (error) go('/login', 'error', 'Correo o contraseña incorrectos.')
  redirect('/')
}
export async function signOut() { await createClient().auth.signOut(); redirect('/login') }
export async function requestReset(fd: FormData) {
  await createClient().auth.resetPasswordForEmail(String(fd.get('email')).trim(), { redirectTo: `${site()}/auth/callback?next=/auth/update-password` })
  go('/forgot', 'ok', 'Si el correo existe, recibirás un enlace para restablecer la contraseña.')
}
export async function updatePassword(fd: FormData) {
  const pw = String(fd.get('password'))
  if (pw.length < 10) go('/auth/update-password', 'error', 'Mínimo 10 caracteres.')
  const { error } = await createClient().auth.updateUser({ password: pw })
  if (error) go('/auth/update-password', 'error', 'No se pudo cambiar la contraseña. Pide un enlace nuevo.')
  redirect('/')
}
export async function inviteStudent(fd: FormData) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  const { data: me } = user ? await sb.from('profiles').select('role').eq('id', user.id).single() : { data: null }
  if (me?.role !== 'admin') redirect('/')               // comprobación en servidor
  const { error } = await adminClient().auth.admin.inviteUserByEmail(String(fd.get('email')).trim(), {
    data: { full_name: String(fd.get('name') || '').trim() }, redirectTo: `${site()}/auth/callback?next=/auth/update-password` })
  if (error) go('/admin', 'error', error.message)
  go('/admin', 'ok', 'Invitación enviada.')
}
