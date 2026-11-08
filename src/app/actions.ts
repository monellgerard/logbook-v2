
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { adminClient } from '@/lib/supabase/admin'

const site = () => process.env.SITE_URL || 'http://localhost:3000'

const go = (path: string, k: string, m: string) =>
  redirect(`${path}?${k}=${encodeURIComponent(m)}`)

export async function signIn(fd: FormData) {
  const { error } = await createClient().auth.signInWithPassword({
    email: String(fd.get('email')).trim(),
    password: String(fd.get('password')),
  })

  if (error) go('/login', 'error', 'Correo o contraseña incorrectos.')
  redirect('/')
}

export async function signOut() {
  await createClient().auth.signOut()
  redirect('/login')
}

export async function requestReset(fd: FormData) {
  await createClient().auth.resetPasswordForEmail(
    String(fd.get('email')).trim(),
    {
      redirectTo: `${site()}/auth/callback?next=/auth/update-password`,
    }
  )

  go(
    '/forgot',
    'ok',
    'Si el correo existe, recibirás un enlace para restablecer la contraseña.'
  )
}

export async function updatePassword(fd: FormData) {
  const pw = String(fd.get('password'))

  if (pw.length < 10) {
    go('/auth/update-password', 'error', 'Mínimo 10 caracteres.')
  }

  const { error } = await createClient().auth.updateUser({
    password: pw,
  })

  if (error) {
    go(
      '/auth/update-password',
      'error',
      'No se pudo cambiar la contraseña. Pide un enlace nuevo.'
    )
  }

  redirect('/')
}

export async function changeOwnPassword(fd: FormData) {
  const sb = createClient()

  const {
    data: { user },
  } = await sb.auth.getUser()

  if (!user?.email) redirect('/login')

  const currentPassword = String(fd.get('current_password') || '')
  const newPassword = String(fd.get('new_password') || '')
  const confirmPassword = String(fd.get('confirm_password') || '')

  if (!currentPassword || !newPassword || !confirmPassword) {
    go('/profile', 'error', 'Completa todos los campos de contraseña.')
  }

  if (newPassword.length < 10) {
    go('/profile', 'error', 'La nueva contraseña debe tener al menos 10 caracteres.')
  }

  if (newPassword !== confirmPassword) {
    go('/profile', 'error', 'Las nuevas contraseñas no coinciden.')
  }

  if (currentPassword === newPassword) {
    go('/profile', 'error', 'La nueva contraseña debe ser diferente de la actual.')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    go('/profile', 'error', 'No se pudo verificar la contraseña actual.')
  }

  // Cliente independiente: verifica la contraseña sin modificar
  // la sesión activa del alumno.
  const verifier = createSupabaseClient(supabaseUrl!, supabaseKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })

  const { error: verifyError } = await verifier.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (verifyError) {
    go('/profile', 'error', 'La contraseña actual no es correcta.')
  }

  // Actualiza la contraseña usando la sesión original.
  const { error } = await sb.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    go('/profile', 'error', 'No se pudo actualizar la contraseña. Inténtalo de nuevo.')
  }

  go('/profile', 'ok', 'Tu contraseña se ha actualizado correctamente.')
}

export async function inviteStudent(fd: FormData) {
  const sb = createClient()

  const {
    data: { user },
  } = await sb.auth.getUser()

  const { data: me } = user
    ? await sb.from('profiles').select('role').eq('id', user.id).single()
    : { data: null }

  if (me?.role !== 'admin') redirect('/')

  const { error } = await adminClient().auth.admin.inviteUserByEmail(
    String(fd.get('email')).trim(),
    {
      data: { full_name: String(fd.get('name') || '').trim() },
      redirectTo: `${site()}/auth/callback?next=/auth/update-password`,
    }
  )

  if (error) go('/admin', 'error', error.message)

  go('/admin', 'ok', 'Invitación enviada.')
}
