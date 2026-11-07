
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar, { type NavItem } from '@/components/sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sb = createClient()

  const {
    data: { user },
  } = await sb.auth.getUser()

  if (!user) redirect('/login')

  const { data: me } = await sb
    .from('profiles')
    .select('full_name, role, active, avatar_path, language')
    .eq('id', user.id)
    .single()

  if (!me || me.active === false) redirect('/auth/inactive')

  const avatar = me.avatar_path
    ? (
        await sb.storage
          .from('avatars')
          .createSignedUrl(me.avatar_path, 3600)
      ).data?.signedUrl || undefined
    : undefined

  const items: NavItem[] = [
    {
      href: '/',
      label: 'Inicio',
      icon: 'home',
      group: 'Mi libro',
    },
    {
      href: '/dives',
      label: 'Mis inmersiones',
      icon: 'list',
      group: 'Mi libro',
    },
    {
      href: '/profile',
      label: 'Mi perfil',
      icon: 'user',
      group: 'Mi libro',
    },
    ...(me.role === 'admin'
      ? [
          {
            href: '/admin',
            label: 'Mi clase',
            icon: 'users',
            group: 'Profesor',
          },
          {
            href: '/admin/dives',
            label: 'Inmersiones de la clase',
            icon: 'clip',
            group: 'Profesor',
          },
          {
            href: '/admin/invitations',
            label: 'Enlaces de registro',
            icon: 'link',
            group: 'Profesor',
          },
        ]
      : []),
  ]

  return (
    <div className="flex min-h-screen w-full">
     <Sidebar
  items={items}
  name={me.full_name || user.email || 'Usuario'}
  role={me.role === 'admin' ? 'Profesor' : 'Alumno'}
  avatar={avatar}
  language={me.language || 'ca'}
/>

      <main className="app-main min-w-0 flex-1 px-4 pb-12 pt-24 md:px-8 md:pt-8">
        <div
          className="page-enter mx-auto w-full"
          style={{ maxWidth: 1760 }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
