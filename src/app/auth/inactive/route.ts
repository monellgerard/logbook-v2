import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET(req: NextRequest) {
  await createClient().auth.signOut()
  return NextResponse.redirect(new URL('/login?error=' + encodeURIComponent('Tu cuenta está desactivada. Contacta con tu profesor.'), req.url))
}
