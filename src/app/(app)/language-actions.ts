'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function saveLanguage(formData: FormData) {
  const language = String(formData.get('language') ?? '')

  if (!['ca', 'es', 'en'].includes(language)) {
    throw new Error('El idioma seleccionado no es válido.')
  }

  const sb = createClient()

  const {
    data: { user },
  } = await sb.auth.getUser()

  if (!user) {
    throw new Error('No hay una sesión activa.')
  }

  const { error } = await sb
    .from('profiles')
    .update({ language })
    .eq('id', user.id)

  if (error) {
    throw new Error('No se pudo guardar el idioma.')
  }

  revalidatePath('/', 'layout')
}
