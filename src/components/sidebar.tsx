
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Logo from './logo'
import Icon from './icon'
import ThemeToggle from './theme-toggle'
import { signOut } from '@/app/actions'
import { saveLanguage } from '@/app/(app)/language-actions'

export type NavItem = {
  href: string
  label: string
  icon: string
  group: string
}

const translations = {
  ca: {
    openMenu: 'Obrir menú',
    expand: 'Expandir menú',
    collapse: 'Reduir menú',
    newDive: 'Nova immersió',
    language: 'Idioma',
    signOut: 'Tancar sessió',
    saveError: 'No s’ha pogut desar l’idioma. Torna-ho a provar.',
  },
  es: {
    openMenu: 'Abrir menú',
    expand: 'Expandir menú',
    collapse: 'Contraer menú',
    newDive: 'Nueva inmersión',
    language: 'Idioma',
    signOut: 'Cerrar sesión',
    saveError: 'No se pudo guardar el idioma. Inténtalo de nuevo.',
  },
  en: {
    openMenu: 'Open menu',
    expand: 'Expand menu',
    collapse: 'Collapse menu',
    newDive: 'New dive',
    language: 'Language',
    signOut: 'Sign out',
    saveError: 'Could not save the language. Please try again.',
  },
}

export default function Sidebar({
  items,
  name,
  role,
  avatar,
  language,
}: {
  items: NavItem[]
  name: string
  role: string
  avatar?: string
  language: string
}) {
  const path = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [open, setOpen] = useState(false)

  const t =
    translations[language as keyof typeof translations] || translations.ca

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
          aria-label={t.openMenu}
          className="nav-mini"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>

        <Logo size={34} />
        <span className="text-lg font-bold tracking-tight">LogBook</span>

        <Link
          href="/dives/new"
          className="btn ml-auto !px-4 !py-2 text-sm"
        >
          + {t.newDive}
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
        {/* Logo */}
        <div className="sidebar-header flex items-center gap-3 px-4 pb-2 pt-5">
          <Logo size={46} />

          <span className="sidebar-label text-xl font-extrabold tracking-tight">
            LogBook
          </span>

          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? t.expand : t.collapse}
            title={collapsed ? t.expand : t.collapse}
            className="nav-mini sidebar-toggle ml-auto hidden shrink-0 place-items-center md:grid"
          >
            <Icon
              name={collapsed ? 'right' : 'left'}
              className="h-4 w-4"
            />
          </button>
        </div>

        {/* Nueva inmersión */}
        <div className="sidebar-new px-3 pb-3 pt-2">
          <Link
            href="/dives/new"
            title={t.newDive}
            className="btn w-full"
          >
            <Icon name="plus" className="h-5 w-5 shrink-0" />
            <span className="sidebar-label">{t.newDive}</span>
          </Link>
        </div>

        {/* Navegación */}
        <nav className="sidebar-nav flex-1 overflow-y-auto px-3 pb-2">
          {groups.map((g) => (
            <div key={g} className="mb-3">
              {g !== items[0]?.group && (
                <p className="sidebar-label eyebrow mb-1.5 mt-3 px-3">
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
                    <Icon
                      name={i.icon}
                      className="h-5 w-5 shrink-0"
                    />
                    <span className="sidebar-label truncate">
                      {i.label}
                    </span>
                  </Link>
                ))}
            </div>
          ))}
        </nav>

        {/* Usuario */}
        <div className="sidebar-footer space-y-1 border-t p-3">
          <div className="sidebar-user mb-2 flex items-center gap-3 px-2">
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

            <div className="sidebar-label min-w-0">
              <div className="truncate text-sm font-semibold">
                {name}
              </div>
              <div className="text-xs text-slate-500">{role}</div>
            </div>
          </div>

          {/* Tema */}
          <ThemeToggle
            bare
            className="nav-btn w-full"
            labelClass="sidebar-label"
          />

          {/* Selector de idioma */}
          <div className="px-1 py-2">
            <div className="sidebar-label mb-2 px-1 text-xs font-medium text-slate-500">
              {t.language}
            </div>

            <LanguageSelector
              language={language}
              saveLanguage={saveLanguage}
              errorMessage={t.saveError}
            />
          </div>

          {/* Cerrar sesión */}
          <form action={signOut}>
            <button
              type="submit"
              className="nav-btn w-full"
              title={t.signOut}
            >
              <Icon name="out" className="h-5 w-5 shrink-0" />
              <span className="sidebar-label">{t.signOut}</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}

function LanguageSelector({
  language,
  saveLanguage,
  errorMessage,
}: {
  language: string
  saveLanguage: (formData: FormData) => Promise<void>
  errorMessage: string
}) {
  const [selected, setSelected] = useState(language)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSelected(language)
  }, [language])

  const languages = [
    { code: 'ca', label: 'CAT' },
    { code: 'es', label: 'ESP' },
    { code: 'en', label: 'ENG' },
  ]

  const index = Math.max(
    0,
    languages.findIndex((item) => item.code === selected)
  )

  async function changeLanguage(code: string) {
    if (code === selected || saving) return

    setSelected(code)
    setSaving(true)

    const formData = new FormData()
    formData.set('language', code)

    try {
      await saveLanguage(formData)
    } catch {
      setSelected(language)
      alert(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className={`relative grid grid-cols-3 rounded-full border border-slate-300/20 bg-slate-500/10 p-1 ${
        saving ? 'opacity-70' : ''
      }`}
    >
      <div
        className="absolute bottom-1 left-1 top-1 w-[calc((100%-8px)/3)] rounded-full bg-cyan-400 shadow-md transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(${index * 100}%)` }}
      />

      {languages.map((item) => (
        <button
          key={item.code}
          type="button"
          disabled={saving}
          onClick={() => changeLanguage(item.code)}
          aria-pressed={selected === item.code}
          className={`relative z-10 rounded-full py-2 text-[10px] font-bold tracking-wide transition-colors duration-200 ${
            selected === item.code
              ? 'text-slate-950'
              : 'text-slate-500 hover:text-current'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
