'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
const s = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim() || null
const back = (k: string, m: string): never => redirect(`/profile?${k}=${encodeURIComponent(m)}`)
async function me() { const sb = createClient(); const { data: { user } } = await sb.auth.getUser(); if (!user) redirect('/login'); return { sb, id: user.id } }
export async function saveProfile(fd: FormData) {
  const { sb, id } = await me()
  const name = s(fd, 'full_name')
  if (!name) back('error', 'El nombre es obligatorio.')
  const { error } = await sb.from('profiles').update({ full_name: name, specialty: s(fd, 'specialty'), organization: s(fd, 'organization') }).eq('id', id)
  if (error) back('error', error.message)
  revalidatePath('/', 'layout'); back('ok', 'Ficha guardada.')
}
export async function addCert(fd: FormData) {
  const { sb, id } = await me()
  const title = s(fd, 'title'), issuer = s(fd, 'issuer'), o = s(fd, 'obtained_on'), e = s(fd, 'expires_on')
  if (!title || !issuer || !o) back('error', 'Titulación, organismo y fecha de obtención son obligatorios.')
  if (e && o && e < o) back('error', 'La caducidad no puede ser anterior a la obtención.')
  const { error } = await sb.from('certifications').insert({ user_id: id, title, issuer, obtained_on: o, expires_on: e, cert_number: s(fd, 'cert_number') })
  if (error) back('error', error.message)
  back('ok', 'Certificación añadida.')
}
export async function deleteCert(fd: FormData) {
  const { sb } = await me()
  const { error } = await sb.from('certifications').delete().eq('id', String(fd.get('id')))
  if (error) back('error', error.message)
  back('ok', 'Certificación eliminada.')
}

const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
export async function uploadPhoto(fd: FormData) {
  const { sb, id } = await me()
  const f = fd.get('photo')
  if (!(f instanceof File) || f.size === 0) back('error', 'Elige una imagen.')
  const file = f as File
  if (!TYPES[file.type]) back('error', 'Solo se admiten imágenes JPG, PNG o WebP.')
  if (file.size > 2 * 1024 * 1024) back('error', 'La imagen no puede superar 2 MB.')
  const { data: old } = await sb.from('profile_photos').select('id, path').eq('user_id', id).in('status', ['pending', 'rejected'])
  for (const o of old ?? []) { await sb.storage.from('avatars').remove([o.path]); await sb.from('profile_photos').delete().eq('id', o.id) }
  const path = `${id}/${crypto.randomUUID()}.${TYPES[file.type]}`
  const up = await sb.storage.from('avatars').upload(path, file, { contentType: file.type })
  if (up.error) back('error', 'No se pudo subir la imagen: ' + up.error.message)
  const { error } = await sb.from('profile_photos').insert({ user_id: id, path })
  if (error) { await sb.storage.from('avatars').remove([path]); back('error', error.message) }
  const { data: prof } = await sb.from('profiles').select('role').eq('id', id).single()
  if (prof?.role === 'admin') {  // el profesor no necesita aprobación: se publica directamente
    const { error: e2 } = await sb.from('profile_photos').update({ status: 'approved' }).eq('user_id', id).eq('path', path)
    if (e2) back('error', e2.message)
    revalidatePath('/', 'layout'); back('ok', 'Foto actualizada.')
  }
  back('ok', 'Foto enviada. Será visible cuando el profesor la apruebe.')
}
