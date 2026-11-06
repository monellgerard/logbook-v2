
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Logo from './logo'
import Icon from './icon'
import ThemeToggle from './theme-toggle'
import { signOut } from '@/app/actions'

export type NavItem = {
  href: string
  label: string
  icon: string
  group: string
}

export default function Sidebar({
  items,
  name,
  role,
  avatar,
}: {
  items: NavItem[]
  name: string
  role: string
  avatar?: string
}) {
  const path = usePathname()

  const [collapsed, setCollapsed] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem('sidebar') === '1')
    } catch {}
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [path])

  const toggle = () => {
    setCollapsed((current) => {
      const next = !current

      try {
        localStorage.setItem('sidebar', next ? '1' : '0')
      } catch {}

      return next
    })
  }

  const best =
    path === '/dives/new'
      ? undefined
      : items
          .filter(
            (i) =>
              path === i.href ||
              (i.href !== '/' && path.startsWith(i.href + '/'))
          )
          .sort((a, b) => b.href.length - a.href.length)[0]?.href

  const hide = collapsed ? 'md:hidden' : ''
  const groups = [...new Set(items.map((i) => i.group))]

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <>
      <header className="side-mobile fixed inset-x-3 top-3 z-30 flex h-14 items-center gap-3 px-4 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="nav-mini"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>

        <Logo size={34} />
        <span className="text-lg font-bold tracking-tight">LogBook</span>

        <Link
          href="/dives/new"
          className="btn ml-auto !px-4 !py-2 text-sm"
          aria-label="Nueva inmersión"
        >
          + Nueva
        </Link>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        data-collapsed={collapsed}
        style={{
          width: collapsed ? '84px' : '288px',
          flexShrink: 0,
        }}
        className={`side fixed left-0 top-0 z-50 flex h-screen flex-col transition-[width,transform] duration-300 md:sticky md:top-3 md:m-3 md:h-[calc(100vh-1.5rem)] ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex items-center gap-3 px-4 pb-2 pt-5">
          <Logo size={46} />

          <span className={`text-xl font-extrabold tracking-tight ${hide}`}>
            LogBook
          </span>

          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
            title={collapsed ? 'Expandir menú' : 'Contraer menú'}
            aria-expanded={!collapsed}
            className="nav-mini ml-auto hidden shrink-0 place-items-center md:grid"
          >
            <Icon
              name={collapsed ? 'right' : 'left'}
              className="h-4 w-4"
            />
          </button>
        </div>

        <div className="px-3 pb-3 pt-2">
          <Link
            href="/dives/new"
            title="Nueva inmersión"
            className={`btn w-full ${collapsed ? 'md:!px-0' : ''}`}
          >
            <Icon name="plus" className="h-5 w-5 shrink-0" />
            <span className={hide}>Nueva inmersión</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-2">
          {groups.map((g) => (
            <div key={g} className="mb-3">
              {g !== 'Mi libro' && (
                <p className={`eyebrow mb-1.5 mt-3 px-3 ${hide}`}>
                  {g}
                </p>
              )}

              {items
                .filter((i) => i.group === g)
                .map((i) => (
                  <Link
                    key={i.href}
                    href={i.href}
                    title={i.label}
                    data-active={i.href === best}
                    className="nav-btn"
                  >
                    <Icon name={i.icon} className="h-5 w-5 shrink-0" />
                    <span className={`truncate ${hide}`}>{i.label}</span>
                  </Link>
                ))}
            </div>
          ))}
        </nav>

        <div className="space-y-1 border-t p-3">
          <div className="mb-2 flex items-center gap-3 px-2">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="avatar grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold">
                {initials || 'U'}
              </span>
            )}

            <div className={`min-w-0 ${hide}`}>
              <div className="truncate text-sm font-semibold">{name}</div>
              <div className="text-xs text-slate-500">{role}</div>
            </div>
          </div>

          <ThemeToggle
            bare
            className="nav-btn w-full"
            labelClass={hide}
          />

          <form action={signOut}>
            <button
              type="submit"
              className="nav-btn w-full"
              title="Cerrar sesión"
            >
              <Icon name="out" className="h-5 w-5 shrink-0" />
              <span className={hide}>Cerrar sesión</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
