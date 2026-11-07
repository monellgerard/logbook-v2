
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

  const language = me.language || 'ca'

  const translations = {
    ca: {
      home: 'Inici',
      dives: 'Les meves immersions',
      profile: 'El meu perfil',
      class: 'La meva classe',
      classDives: 'Immersions de la classe',
      invitations: 'Enllaços de registre',
      myBook: 'El meu llibre',
      teacher: 'Professor',
      roleTeacher: 'Professor',
      roleStudent: 'Alumne',
      user: 'Usuari',
    },
    es: {
      home: 'Inicio',
      dives: 'Mis inmersiones',
      profile: 'Mi perfil',
      class: 'Mi clase',
      classDives: 'Inmersiones de la clase',
      invitations: 'Enlaces de registro',
      myBook: 'Mi libro',
      teacher: 'Profesor',
      roleTeacher: 'Profesor',
      roleStudent: 'Alumno',
      user: 'Usuario',
    },
    en: {
      home: 'Home',
      dives: 'My dives',
      profile: 'My profile',
      class: 'My class',
      classDives: 'Class dives',
      invitations: 'Registration links',
      myBook: 'My logbook',
      teacher: 'Instructor',
      roleTeacher: 'Instructor',
      roleStudent: 'Student',
      user: 'User',
    },
  }

  const t =
    translations[language as keyof typeof translations] || translations.ca

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
      label: t.home,
      icon: 'home',
      group: t.myBook,
    },
    {
      href: '/dives',
      label: t.dives,
      icon: 'list',
      group: t.myBook,
    },
    {
      href: '/profile',
      label: t.profile,
      icon: 'user',
      group: t.myBook,
    },
    ...(me.role === 'admin'
      ? [
          {
            href: '/admin',
            label: t.class,
            icon: 'users',
            group: t.teacher,
          },
          {
            href: '/admin/dives',
            label: t.classDives,
            icon: 'clip',
            group: t.teacher,
          },
          {
            href: '/admin/invitations',
            label: t.invitations,
            icon: 'link',
            group: t.teacher,
          },
        ]
      : []),
  ]

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        items={items}
        name={me.full_name || user.email || t.user}
        role={me.role === 'admin' ? t.roleTeacher : t.roleStudent}
        avatar={avatar}
        language={language}
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
