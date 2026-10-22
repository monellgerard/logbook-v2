'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { diveSchema, toRow, LABEL } from '@/lib/dive-schema'
export async function saveDive(id: string | null, _prev: { error?: string }, fd: FormData) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')
  const r = diveSchema.safeParse(Object.fromEntries(fd))
  if (!r.success) return { error: r.error.issues.map((i) => `${LABEL[String(i.path[0])] ?? i.path[0]}: ${i.message}`).join(' · ') }
  const row = toRow(r.data)
  if (id && row.dive_number == null) delete row.dive_number
  const { data: saved, error } = id ? await sb.from('dives').update(row).eq('id', id).select('id') : await sb.from('dives').insert({ ...row, user_id: user.id }).select('id')
  if (error) return { error: 'No se pudo guardar: ' + error.message }
  if (!saved?.length) return { error: 'No tienes permiso para modificar esta inmersión.' }
  revalidatePath('/', 'layout')
  redirect('/dives')
}
export async function deleteDive(id: string) {
  const { error } = await createClient().from('dives').delete().eq('id', id)  // RLS: solo las propias
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
  redirect('/dives')
}
