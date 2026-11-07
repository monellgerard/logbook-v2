'use server'

import { createHash, randomBytes } from 'crypto'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { encryptInvitationToken } from './invitation-crypto'

export async function createInvitation(
  _prev: { link?: string; error?: string },
  fd: FormData
) {
  const { sb, user } = await requireAdmin()

  const max = Math.min(
    500,
    Math.max(1, Number(fd.get('max')) || 30)
  )

  const days = Math.min(
    365,
    Math.max(0, Number(fd.get('days')) || 0)
  )

  const token = randomBytes(24).toString('base64url')

  const tokenHash = createHash('sha256')
    .update(token)
    .digest('hex')

  const tokenEncrypted = encryptInvitationToken(token)

  const { error } = await sb.from('invitations').insert({
    token_hash: tokenHash,
    token_encrypted: tokenEncrypted,
    note: String(fd.get('note') ?? '').trim() || null,
    created_by: user.id,
    max_uses: max,
    expires_at: days
      ? new Date(Date.now() + days * 864e5).toISOString()
      : null,
  })

  if (error) {
    return { error: error.message }
  }

  const siteUrl = (
    process.env.SITE_URL || 'http://localhost:3000'
  ).replace(/\/+$/, '')

  return {
    link: `${siteUrl}/register/${token}`,
  }
}

export async function revokeInvitation(fd: FormData) {
  const { sb } = await requireAdmin()

  const id = String(fd.get('id') ?? '')

  if (!id) {
    redirect(
      '/admin/invitations?error=' +
        encodeURIComponent('Identificador de invitación no válido.')
    )
  }

  const { error } = await sb
    .from('invitations')
    .update({ active: false })
    .eq('id', id)

  redirect(
    '/admin/invitations?' +
      (error
        ? 'error=' + encodeURIComponent(error.message)
        : 'ok=' + encodeURIComponent('Enlace revocado correctamente.'))
  )
}

export async function deleteInvitation(fd: FormData) {
  const { sb } = await requireAdmin()

  const id = String(fd.get('id') ?? '')

  if (!id) {
    redirect(
      '/admin/invitations?error=' +
        encodeURIComponent('Identificador de invitación no válido.')
    )
  }

  const { error } = await sb
    .from('invitations')
    .delete()
    .eq('id', id)

  redirect(
    '/admin/invitations?' +
      (error
        ? 'error=' + encodeURIComponent(error.message)
        : 'ok=' + encodeURIComponent('Invitación eliminada correctamente.'))
  )
}
export async function deleteAllInactiveInvitations() {
  const { sb } = await requireAdmin()

  const { data, error } = await sb
    .from('invitations')
    .select('id, active, uses, max_uses, expires_at')

  if (error) {
    redirect(
      '/admin/invitations?error=' +
        encodeURIComponent(error.message)
    )
  }

  const now = Date.now()

  const inactiveIds = (data ?? [])
    .filter((i) =>
      !i.active ||
      (i.expires_at && new Date(i.expires_at).getTime() < now) ||
      i.uses >= i.max_uses
    )
    .map((i) => i.id)

  if (inactiveIds.length === 0) {
    redirect(
      '/admin/invitations?ok=' +
        encodeURIComponent('No hay invitaciones antiguas que eliminar.')
    )
  }

  const { error: deleteError } = await sb
    .from('invitations')
    .delete()
    .in('id', inactiveIds)

  redirect(
    '/admin/invitations?' +
      (deleteError
        ? 'error=' + encodeURIComponent(deleteError.message)
        : 'ok=' + encodeURIComponent(
            `Se han eliminado ${inactiveIds.length} invitaciones del historial.`
          ))
  )
}
