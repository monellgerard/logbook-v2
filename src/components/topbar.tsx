'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Logo from './logo'
import Icon from './icon'
import ThemeToggle from './theme-toggle'
import { signOut } from '@/app/actions'
export type NavItem = { href: string; label: string; icon: string; group: string }
const L = 'ABCDEFGHIJKL'
// Navegación por «capítulos» (A, B, C…) con menú de pantalla completa.
export default function Topbar({ items, name, role, avatar }: { items: NavItem[]; name: string; role: string; avatar?: string }) {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [path])
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.body.style.overflow = 'hidden'; window.addEventListener('keydown', k)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', k) }
  }, [open])
  const best = items.filter((i) => !i.href.includes('#') && (path === i.href || (i.href !== '/' && path.startsWith(i.href + '/')))).sort((a, b) => b.href.length - a.href.length)[0]?.href
  const idx = items.findIndex((i) => i.href === best), cur = idx >= 0 ? items[idx] : null
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return <>
    <header className="topbar sticky top-0 z-40"><div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 md:px-8">
      <Link href="/" className="flex items-center gap-2.5" aria-label="LogBook, inicio"><Logo size={42} /><span className="hidden text-[15px] tracking-tight sm:block">Logbook</span></Link>
      <ol className="mx-auto hidden items-center gap-0.5 md:flex">{items.map((i, n) => <li key={i.href}><Link href={i.href} title={i.label} data-active={i.href === best} className="chapter"><span>{L[n]}</span></Link></li>)}</ol>
      <div className="ml-auto flex items-center gap-3 md:ml-0">
        {cur && <span className="eyebrow hidden lg:block">{L[idx]} · {cur.label}</span>}
        <button onClick={() => setOpen(true)} className="pill" aria-haspopup="dialog">Menú<span className="mono" style={{ color: 'var(--accent)' }}>{idx >= 0 ? L[idx] : '·'}</span></button></div></div></header>
    {open && <div role="dialog" aria-modal="true" aria-label="Menú" className="menu-screen fixed inset-0 z-50 overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-6xl flex-col px-4 py-5 md:px-8">
        <div className="flex items-center justify-between"><span className="eyebrow">Capítulos</span><button onClick={() => setOpen(false)} className="pill">Cerrar<Icon name="x" className="h-4 w-4" /></button></div>
        <nav className="my-8 flex-1"><ol className="max-w-3xl">{items.map((i, n) => <li key={i.href}><Link href={i.href} data-active={i.href === best} className="chapter-row"><span className="mono">{L[n]}</span><span>{i.label}</span></Link></li>)}</ol></nav>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
          <div className="flex items-center gap-3">{avatar ? <img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-full text-xs font-medium" style={{ background: 'var(--primary)', color: 'var(--primary-fg)' }}>{initials || 'U'}</span>}
            <div><div className="text-sm">{name}</div><div className="eyebrow">{role}</div></div></div>
          <div className="flex gap-2"><ThemeToggle bare className="pill" /><form action={signOut}><button className="pill"><Icon name="out" className="h-4 w-4" />Cerrar sesión</button></form></div></div>
      </div></div>}
  </>
}
