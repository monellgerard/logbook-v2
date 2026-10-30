'use server'
import { createHash, randomBytes } from 'crypto'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
export async function createInvitation(_prev: { link?: string; error?: string }, fd: FormData) {
  const { sb, user } = await requireAdmin()
  const max = Math.min(500, Math.max(1, Number(fd.get('max')) || 30)), days = Math.min(365, Math.max(0, Number(fd.get('days')) || 0))
  const token = randomBytes(24).toString('base64url')
  const { error } = await sb.from('invitations').insert({ token_hash: createHash('sha256').update(token).digest('hex'), note: String(fd.get('note') ?? '').trim() || null, created_by: user.id, max_uses: max, expires_at: days ? new Date(Date.now() + days * 864e5).toISOString() : null })
  if (error) return { error: error.message }
  return { link: `${process.env.SITE_URL || 'http://localhost:3000'}/register/${token}` }
}
export async function revokeInvitation(fd: FormData) {
  const { sb } = await requireAdmin()
  const { error } = await sb.from('invitations').update({ active: false }).eq('id', String(fd.get('id')))
  redirect('/admin/invitations?' + (error ? 'error=' + encodeURIComponent(error.message) : 'ok=' + encodeURIComponent('Enlace revocado.')))
}
