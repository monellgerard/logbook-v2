'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
export async function reviewPhoto(fd: FormData) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  const { data: me } = user ? await sb.from('profiles').select('role').eq('id', user.id).single() : { data: null }
  if (me?.role !== 'admin') redirect('/')
  const approve = fd.get('decision') === 'approved', reason = String(fd.get('reason') ?? '').trim()
  if (!approve && !reason) redirect('/admin?error=' + encodeURIComponent('Indica el motivo del rechazo.'))
  const { error } = await sb.from('profile_photos').update({ status: approve ? 'approved' : 'rejected', reject_reason: approve ? null : reason }).eq('id', String(fd.get('id'))).eq('status', 'pending')
  redirect('/admin?' + (error ? 'error=' + encodeURIComponent(error.message) : 'ok=' + encodeURIComponent(approve ? 'Foto aprobada.' : 'Foto rechazada.')))
}
export async function reviewDive(fd: FormData) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  const { data: me } = user ? await sb.from('profiles').select('role').eq('id', user.id).single() : { data: null }
  if (me?.role !== 'admin') redirect('/')
  const id = String(fd.get('dive_id')), status = String(fd.get('status')), comment = String(fd.get('comment') ?? '').trim()
  const from = String(fd.get('from') ?? ''), dest = from.startsWith('/') && !from.startsWith('//') ? from : '/admin/dives'
  const back = (e?: string) => redirect(e ? `/dives/${id}?error=${encodeURIComponent(e)}&from=${encodeURIComponent(dest)}` : dest)
  if (!['pending', 'reviewed', 'needs_correction'].includes(status)) back('Estado no válido.')
  if (status === 'needs_correction' && !comment) back('Escribe un comentario explicando qué hay que corregir.')
  const { error } = await sb.from('dive_reviews').insert({ dive_id: id, reviewer_id: user!.id, status, comment: comment || null })
  back(error?.message)
}
