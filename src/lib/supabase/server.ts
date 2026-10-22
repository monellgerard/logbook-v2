import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export function createClient() {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: async () => (await cookies()).getAll(),
      setAll: async (l) => { try { const s = await cookies(); l.forEach(({ name, value, options }) => s.set(name, value, options)) } catch {} },
    },
  })
}
