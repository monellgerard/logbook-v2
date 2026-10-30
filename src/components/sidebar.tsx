'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Logo from './logo'
import Icon from './icon'
import ThemeToggle from './theme-toggle'
import { signOut } from '@/app/actions'
export type NavItem = { href: string; label: string; icon: string; group: string; hint?: string }
export default function Sidebar({ items, name, role, avatar }: { items: NavItem[]; name: string; role: string; avatar?: string }) {
  const path = usePathname()
  const [collapsed, setCollapsed] = useState(false), [open, setOpen] = useState(false)
  useEffect(() => { try { setCollapsed(localStorage.getItem('sidebar') === '1') } catch {} }, [])
  useEffect(() => setOpen(false), [path])
  const toggle = () => { const v = !collapsed; setCollapsed(v); try { localStorage.setItem('sidebar', v ? '1' : '0') } catch {} }
  const best = items.filter((i) => path === i.href || (i.href !== '/' && path.startsWith(i.href + '/'))).sort((a, b) => b.href.length - a.href.length)[0]?.href
  const hide = collapsed ? 'md:hidden' : ''
  const groups = [...new Set(items.map((i) => i.group))]
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return <>
    <header className="side fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 px-4 md:hidden">
      <button onClick={() => setOpen(true)} aria-label="Abrir menú" className="nav-mini"><Icon name="menu" className="h-5 w-5" /></button><Logo size={36} /><span className="font-display text-lg uppercase tracking-widest">LogBook</span></header>
    {open && <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setOpen(false)} />}
    <aside data-collapsed={collapsed} className={`side fixed top-0 z-50 flex h-screen w-72 flex-col transition-[width,transform] duration-300 md:sticky ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${collapsed ? 'md:w-[88px]' : 'md:w-72'}`}>
      <div className="px-4 pb-3 pt-5"><div className="flex items-center gap-3"><Logo size={54} /><div className={`min-w-0 ${hide}`}><div className="font-display text-2xl font-bold uppercase leading-none tracking-widest">LogBook</div><div className="eyebrow mt-1">Libro de inmersiones</div></div>
        <button onClick={toggle} className={`nav-mini ml-auto hidden md:grid ${collapsed ? 'md:hidden' : ''}`} aria-label="Contraer menú"><Icon name="left" className="h-4 w-4" /></button></div>
        <div className={`barcode mt-4 ${hide}`} /></div>
      {collapsed && <button onClick={toggle} className="nav-mini mx-auto mb-2 hidden md:grid" aria-label="Expandir menú"><Icon name="right" className="h-4 w-4" /></button>}
      <nav className="flex-1 overflow-y-auto px-3 py-2">{groups.map((g) => <div key={g} className="mb-4"><p className={`eyebrow mb-2 px-1 ${hide}`}>{g}</p>
        {items.filter((i) => i.group === g).map((i) => <Link key={i.href} href={i.href} title={i.label} data-active={i.href === best} className="nav-btn"><Icon name={i.icon} className="h-5 w-5 shrink-0" />
          <span className={`min-w-0 text-left ${hide}`}><span className="block truncate">{i.label}</span>{i.hint && <span className="hint">{i.hint}</span>}</span></Link>)}</div>)}</nav>
      <div className="space-y-2 border-t p-3">
        <div className="mb-2 flex items-center gap-3 px-1">{avatar ? <img src={avatar} alt="" className="chamfer-sm h-10 w-10 shrink-0 object-cover" /> : <span className="chamfer-sm grid h-10 w-10 shrink-0 place-items-center text-xs font-bold" style={{ background: 'var(--accent)', color: 'var(--primary-fg)' }}>{initials || 'U'}</span>}
          <div className={`min-w-0 ${hide}`}><div className="truncate text-sm font-semibold">{name}</div><div className="eyebrow"><span className="blink">●</span> {role}</div></div></div>
        <ThemeToggle bare className="nav-btn !mb-0 w-full" labelClass={hide} />
        <form action={signOut}><button className="nav-btn !mb-0 w-full" title="Cerrar sesión"><Icon name="out" className="h-5 w-5 shrink-0" /><span className={hide}>Cerrar sesión</span></button></form></div>
    </aside></>
}
