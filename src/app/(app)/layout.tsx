import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar, { type NavItem } from '@/components/sidebar'
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')
  const { data: me } = await sb.from('profiles').select('full_name, role, active, avatar_path').eq('id', user.id).single()
  if (!me || me.active === false) redirect('/auth/inactive')
  const avatar = me.avatar_path ? (await sb.storage.from('avatars').createSignedUrl(me.avatar_path, 3600)).data?.signedUrl || undefined : undefined
  const items: NavItem[] = [
    { href: '/', label: 'Panel', icon: 'home', group: 'Mi libro', hint: 'Resumen general' }, { href: '/dives', label: 'Mis inmersiones', icon: 'list', group: 'Mi libro', hint: 'Historial completo' }, { href: '/dives/new', label: 'Nueva inmersión', icon: 'plus', group: 'Mi libro', hint: 'Registrar' },
    { href: '/profile', label: 'Ficha del buceador', icon: 'user', group: 'Mi libro', hint: 'Perfil y titulaciones' }, { href: '/equipment', label: 'Mi material', icon: 'check', group: 'Mi libro', hint: 'Checklist de equipo' },
    ...(me.role === 'admin' ? [{ href: '/admin', label: 'Gestión de la clase', icon: 'users', group: 'Profesor', hint: 'Alumnos y cuentas' }, { href: '/admin/dives', label: 'Inmersiones de la clase', icon: 'clip', group: 'Profesor', hint: 'Registros y revisión' }, { href: '/admin/invitations', label: 'Enlaces de registro', icon: 'link', group: 'Profesor', hint: 'Altas de alumnos' }] : []),
  ]
  return <div className="flex min-h-screen"><Sidebar items={items} name={me.full_name || user.email || 'Usuario'} role={me.role === 'admin' ? 'Profesor' : 'Alumno'} avatar={avatar} />
    <main className="app-main min-w-0 flex-1 px-4 pb-12 pt-20 md:px-8 md:pt-8"><div className="page-enter mx-auto w-full" style={{ maxWidth: 1760 }}>{children}</div></main></div>
}
