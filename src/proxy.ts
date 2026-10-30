import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
const OPEN = ['/login', '/forgot', '/auth', '/register']
export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req })
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: { getAll: () => req.cookies.getAll(), setAll: (l) => {
      l.forEach(({ name, value }) => req.cookies.set(name, value)); res = NextResponse.next({ request: req })
      l.forEach(({ name, value, options }) => res.cookies.set(name, value, options)) } },
  })
  const { data: { user } } = await sb.auth.getUser()
  const p = req.nextUrl.pathname
  const code = req.nextUrl.searchParams.get('code')
  if (code && p === '/') return NextResponse.redirect(new URL(`/auth/callback?code=${code}&next=/auth/update-password`, req.url))
  if (!user && !OPEN.some((o) => p.startsWith(o))) return NextResponse.redirect(new URL('/login', req.url))
  if (user && p === '/login') return NextResponse.redirect(new URL('/', req.url))
  return res
}
// Los archivos estáticos (imágenes, iconos) son públicos: sin esto, el login no podría cargar su logo ni su fondo.
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'] }
