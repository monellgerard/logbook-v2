import 'server-only'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

function getEncryptionKey(): Buffer {
  const secret = process.env.INVITATION_ENCRYPTION_KEY

  if (!secret || !/^[0-9a-fA-F]{64}$/.test(secret)) {
    throw new Error('La clave de cifrado de invitaciones no está configurada correctamente.')
  }

  return Buffer.from(secret, 'hex')
}

export function encryptInvitationToken(token: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(12)

  const cipher = createCipheriv('aes-256-gcm', key, iv)

  const encrypted = Buffer.concat([
    cipher.update(token, 'utf8'),
    cipher.final(),
  ])

  const authTag = cipher.getAuthTag()

  return [
    'v1',
    iv.toString('base64url'),
    authTag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join(':')
}

export function decryptInvitationToken(value: string | null): string | null {
  if (!value) return null

  try {
    const [version, ivText, tagText, encryptedText] = value.split(':')

    if (
      version !== 'v1' ||
      !ivText ||
      !tagText ||
      !encryptedText
    ) {
      return null
    }

    const key = getEncryptionKey()
    const iv = Buffer.from(ivText, 'base64url')
    const authTag = Buffer.from(tagText, 'base64url')
    const encrypted = Buffer.from(encryptedText, 'base64url')

    if (iv.length !== 12 || authTag.length !== 16) {
      return null
    }

    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ])

    return decrypted.toString('utf8')
  } catch {
    return null
  }
}
