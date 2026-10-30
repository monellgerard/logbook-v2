'use client'
import { useEffect, useState } from 'react'
import Icon from './icon'
export default function ThemeToggle({ labelClass = '', className = '', bare = false }: { labelClass?: string; className?: string; bare?: boolean }) {
  const [dark, setDark] = useState(true)
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), [])
  function toggle() {
    const d = !dark, root = document.documentElement
    setDark(d); root.classList.add('theme-anim'); root.classList.toggle('dark', d); setTimeout(() => root.classList.remove('theme-anim'), 500)
    try { localStorage.setItem('theme', d ? 'dark' : 'light') } catch {}
  }
  return <button type="button" onClick={toggle} title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} className={`${bare ? '' : 'flex items-center gap-3 rounded-lg px-3 py-2'} ${className}`}>
    <Icon name={dark ? 'sun' : 'moon'} className="h-4 w-4" /><span className={labelClass}>{dark ? 'Modo claro' : 'Modo oscuro'}</span></button>
}
