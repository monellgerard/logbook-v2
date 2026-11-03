'use client'
import { useEffect } from 'react'
// Un resplandor suave sigue al cursor por toda la pantalla (solo actualiza una variable CSS, muy ligero).
export default function PointerGlow() {
  useEffect(() => {
    let raf = 0
    const on = (e: PointerEvent) => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const s = document.documentElement.style; s.setProperty('--mx', e.clientX + 'px'); s.setProperty('--my', e.clientY + 'px') }) }
    addEventListener('pointermove', on); return () => { cancelAnimationFrame(raf); removeEventListener('pointermove', on) }
  }, [])
  return <div className="pglow" />
}
