'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { adminClient } from '@/lib/supabase/admin'
const go = (path: string, k: 'ok' | 'error', m: string): never => redirect(`${path}?${k}=${encodeURIComponent(m)}`)
async function studentOnly(id: string) {
  const { sb } = await requireAdmin()
  const { data } = await sb.from('profiles').select('role').eq('id', id).maybeSingle()
  if (data?.role !== 'student') go('/admin', 'error', 'Solo se pueden gestionar cuentas de alumnos.')
  return sb
}
export async function createStudent(fd: FormData) {
  await requireAdmin()
  const email = String(fd.get('email') ?? '').trim(), name = String(fd.get('name') ?? '').trim(), pw = String(fd.get('password') ?? '')
  if (!email || !name) go('/admin', 'error', 'Nombre y correo son obligatorios.')
  if (pw.length < 10) go('/admin', 'error', 'La contraseña provisional debe tener al menos 10 caracteres.')
  const { error } = await adminClient().auth.admin.createUser({ email, password: pw, email_confirm: true, user_metadata: { full_name: name } })
  if (error) go('/admin', 'error', error.message)
  go('/admin', 'ok', `Alumno creado. Entrégale la contraseña provisional por un canal privado.`)
}
export async function setPassword(fd: FormData) {
  const id = String(fd.get('id')), pw = String(fd.get('password') ?? '')
  await studentOnly(id)
  const back = `/admin/students/${id}`
  if (pw.length < 10) go(back, 'error', 'Mínimo 10 caracteres.')
  const { error } = await adminClient().auth.admin.updateUserById(id, { password: pw })
  if (error) go(back, 'error', error.message)
  go(back, 'ok', 'Contraseña cambiada. Comunícasela al alumno por un canal privado.')
}
export async function setActive(fd: FormData) {
  const id = String(fd.get('id')), active = fd.get('active') === 'true'
  const sb = await studentOnly(id), back = `/admin/students/${id}`
  const { error } = await sb.from('profiles').update({ active }).eq('id', id)
  if (error) go(back, 'error', error.message)
  const r = await adminClient().auth.admin.updateUserById(id, { ban_duration: active ? 'none' : '876000h' })  // impide nuevos accesos
  if (r.error) go(back, 'error', r.error.message)
  revalidatePath('/admin'); go(back, 'ok', active ? 'Cuenta reactivada.' : 'Cuenta desactivada. No podrá iniciar sesión.')
}
