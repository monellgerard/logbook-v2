import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '../actions'
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')
  const { data: me } = await sb.from('profiles').select('full_name, role, active').eq('id', user.id).single()
  if (me && me.active === false) redirect('/auth/inactive')
  const links = [{ href: '/', label: 'Panel' }, { href: '/dives', label: 'Mis inmersiones' }, { href: '/dives/new', label: 'Nueva inmersión' }, { href: '/profile', label: 'Mi ficha' }, ...(me?.role === 'admin' ? [{ href: '/admin', label: 'Gestión de la clase' }, { href: '/admin/dives', label: 'Inmersiones de la clase' }] : [])]
  return <div className="min-h-screen md:flex">
    <aside className="bg-navy p-4 text-white md:min-h-screen md:w-60">
      <div className="mb-4 text-xl font-bold">🤿 LogBook</div>
      <nav className="flex gap-2 md:flex-col">{links.map((l) => <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 hover:bg-deep">{l.label}</Link>)}</nav>
      <form action={signOut} className="mt-4"><button className="rounded-lg px-3 py-2 text-sm text-teal hover:bg-deep">Cerrar sesión</button></form>
    </aside>
    <main className="flex-1 p-4 md:p-8"><p className="mb-4 text-sm text-slate-500">{me?.full_name || user.email} · {me?.role === 'admin' ? 'Profesor' : 'Alumno'}</p>{children}</main></div>
}
