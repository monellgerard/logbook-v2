'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
async function me() { const sb = createClient(); const { data: { user } } = await sb.auth.getUser(); if (!user) redirect('/login'); return { sb, id: user.id } }
const DEFAULTS = ['Traje', 'Chaleco (BCD)', 'Regulador', 'Fuente alterna (octopus)', 'Manómetro', 'Ordenador de buceo', 'Máscara', 'Aletas', 'Botas', 'Guantes', 'Lastre / cinturón', 'Linterna', 'Boya de señalización (SMB)', 'Cortador / cuchillo']
export async function addItem(fd: FormData) {
  const { sb, id } = await me(), name = String(fd.get('name') ?? '').trim().slice(0, 80)
  if (name) { const { error } = await sb.from('equipment_items').insert({ user_id: id, name }); if (error) redirect('/equipment?error=' + encodeURIComponent('No se pudo añadir: ' + error.message)) }
  revalidatePath('/', 'layout')
}
export async function toggleItem(fd: FormData) {
  const { sb, id } = await me()
  await sb.from('equipment_items').update({ checked: fd.get('checked') !== 'true' }).eq('id', String(fd.get('id'))).eq('user_id', id)
  revalidatePath('/', 'layout')
}
export async function deleteItem(fd: FormData) {
  const { sb, id } = await me()
  await sb.from('equipment_items').delete().eq('id', String(fd.get('id'))).eq('user_id', id)
  revalidatePath('/', 'layout')
}
export async function addDefaults() {
  const { sb, id } = await me()
  const { data } = await sb.from('equipment_items').select('name').eq('user_id', id)
  const have = new Set((data ?? []).map((d) => d.name.toLowerCase()))
  const rows = DEFAULTS.filter((n) => !have.has(n.toLowerCase())).map((name) => ({ user_id: id, name }))
  if (rows.length) { const { error } = await sb.from('equipment_items').insert(rows); if (error) redirect('/equipment?error=' + encodeURIComponent('No se pudo cargar la lista: ' + error.message)) }
  revalidatePath('/', 'layout')
}
export async function resetChecks() {
  const { sb, id } = await me()
  await sb.from('equipment_items').update({ checked: false }).eq('user_id', id)
  revalidatePath('/', 'layout')
}
