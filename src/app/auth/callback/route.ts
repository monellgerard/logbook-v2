import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET(req: NextRequest) {
  const u = req.nextUrl, sb = createClient()
  const next = u.searchParams.get('next')?.startsWith('/') ? u.searchParams.get('next')! : '/'
  const code = u.searchParams.get('code'), th = u.searchParams.get('token_hash'), type = u.searchParams.get('type')
  let err = true
  if (code) err = !!(await sb.auth.exchangeCodeForSession(code)).error
  else if (th && type) err = !!(await sb.auth.verifyOtp({ token_hash: th, type: type as 'invite' | 'recovery' })).error
  return NextResponse.redirect(new URL(err ? '/login?error=Enlace%20no%20v%C3%A1lido%20o%20caducado' : next, req.url))
}
