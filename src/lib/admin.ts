import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
export async function requireAdmin() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  const { data: me } = user ? await sb.from('profiles').select('role').eq('id', user.id).single() : { data: null }
  if (me?.role !== 'admin') redirect('/')
  return { sb, user: user! }
}
