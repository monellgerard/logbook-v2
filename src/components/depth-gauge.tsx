'use client'
import { useEffect, useState } from 'react'
// Indicador fijo (como el de frecuencia de la página de referencia): la profundidad aumenta al bajar por la página.
export default function DepthGauge() {
  const [d, setD] = useState(0)
  useEffect(() => {
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const max = document.documentElement.scrollHeight - window.innerHeight; setD(max > 0 ? Math.min(1, window.scrollY / max) * 40 : 0) }) }
    on(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [])
  return <div aria-hidden="true" className="eyebrow pointer-events-none fixed bottom-4 left-4 z-30 hidden items-center gap-2 sm:flex md:left-8"><span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />Profundidad · {d.toFixed(1).replace('.', ',')} m</div>
}
