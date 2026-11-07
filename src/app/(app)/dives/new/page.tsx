import { createClient } from '@/lib/supabase/server'
import DiveForm from '../dive-form'

const translations = {
  ca: 'Nova immersió',
  es: 'Nueva inmersión',
  en: 'New dive',
}

export default async function New() {
  const sb = createClient()
  const {
    data: { user },
  } = await sb.auth.getUser()

  let language: 'ca' | 'es' | 'en' = 'ca'

  if (user) {
    const { data: me } = await sb
      .from('profiles')
      .select('language')
      .eq('id', user.id)
      .maybeSingle()

    if (me?.language === 'es' || me?.language === 'en') {
      language = me.language
    }
  }

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold text-navy">
        {translations[language]}
      </h1>
      <DiveForm />
    </>
  )
}
