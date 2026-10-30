'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { planDive, gasFo2, pamb, GF_LOW, GF_HIGH, type Seg } from '@/lib/deco'
import { PW, PH, PAL_DARK, PAL_LIGHT, geometry, renderProfile, renderCursor } from '@/lib/pixel-chart'
const NAME: Record<Seg['kind'], string> = { descent: 'Descenso', bottom: 'Tiempo de fondo', ascent: 'Ascenso', stop: 'Parada de descompresión', safety: 'Parada de seguridad' }
const fmt = (m: number) => { let s = Math.round(m * 60); const mm = Math.floor(s / 60); s -= mm * 60; return `${mm}:${String(s).padStart(2, '0')}` }
const n1 = (v: number) => v.toFixed(1).replace('.', ','), n2 = (v: number) => v.toFixed(2).replace('.', ',')
const rgb = (c: number[]) => `rgb(${c[0]},${c[1]},${c[2]})`
// Perfil calculado con Bühlmann ZH-L16C (GF 30/85) y dibujado en píxeles. Pasa el cursor (o el dedo) para ver el detalle de cada tramo.
export default function DiveProfile({ depth, minutes, gasMix, startBar, endBar }: { depth: number | string; minutes: number | string; gasMix?: string | null; startBar?: number | null; endBar?: number | null }) {
  const main = useRef<HTMLCanvasElement>(null), cur = useRef<HTMLCanvasElement>(null)
  const [h, setH] = useState<number | null>(null), [dark, setDark] = useState(true)
  const D = Number(depth), T = Number(minutes), fo2 = gasFo2(gasMix), ok = D > 0 && T > 0 && fo2 !== null
  const plan = useMemo(() => (ok ? planDive(D, T, fo2 as number) : null), [ok, D, T, fo2])
  const pal = dark ? PAL_DARK : PAL_LIGHT
  useEffect(() => { const el = document.documentElement, f = () => setDark(el.classList.contains('dark')); f(); const mo = new MutationObserver(f); mo.observe(el, { attributes: true, attributeFilter: ['class'] }); return () => mo.disconnect() }, [])
  useEffect(() => { if (!plan || !main.current) return; main.current.getContext('2d')!.putImageData(new ImageData(renderProfile(plan, D, pal) as any, PW, PH), 0, 0) }, [plan, D, pal])
  useEffect(() => { if (!plan || !cur.current) return; const c = cur.current.getContext('2d')!; c.clearRect(0, 0, PW, PH); if (h !== null) c.putImageData(new ImageData(renderCursor(plan, D, h, pal) as any, PW, PH), 0, 0) }, [plan, D, pal, h])
  if (!D || !T) return null
  if (fo2 === null || !plan) return <section className="mb-4 rounded-xl bg-white p-4"><h2 className="text-deep mb-2">Perfil de la inmersión</h2>
    <p className="text-sm text-slate-500">El cálculo de descompresión solo está disponible para aire y EANx 32/36/40. Con trimix, rebreather u otras mezclas debes usar tu planificador u ordenador de buceo.</p></section>
  const tot = plan.total, g = geometry(D, tot), used = startBar != null && endBar != null && startBar >= endBar ? startBar - endBar : null, stopMin = plan.stops.reduce((s, p) => s + p.min, 0)
  const yt = Array.from({ length: g.dMax / g.dStep + 1 }, (_, i) => i * g.dStep), xt = Array.from({ length: Math.floor(tot / g.tStep) + 1 }, (_, i) => i * g.tStep)
  const move = (e: React.PointerEvent) => { const r = main.current!.getBoundingClientRect(); setH(Math.min(tot, Math.max(0, ((e.clientX - r.left) / r.width) * tot))) }
  let tip: { l: number; t: number; title: string; color: string; rows: [string, string][] } | null = null
  if (h !== null) {
    const seg = plan.segs.find((s) => h >= s.t0 && h <= s.t1) ?? plan.segs[plan.segs.length - 1]
    const dur = seg.t1 - seg.t0, d = dur > 0 ? seg.d0 + (seg.d1 - seg.d0) * ((h - seg.t0) / dur) : seg.d1, rate = dur > 0 ? (seg.d1 - seg.d0) / dur : 0
    const stop = seg.kind === 'stop' || seg.kind === 'safety' ? plan.stops.find((s) => Math.abs(s.start - seg.t0) < 1e-6) : undefined, po2 = fo2 * pamb(d)
    const rows: [string, string][] = [['Tiempo', `${fmt(h)} min`], ['Profundidad', `${n1(d)} m`]]
    if (stop) { const i = plan.stops.indexOf(stop), nx = plan.stops[i + 1]; rows.push(['Duración parada', `${stop.min} min`], ['Intervalo', `${fmt(stop.start)} – ${fmt(stop.start + stop.min)}`], ['Después', nx ? `sube a ${nx.depth} m` : 'sube a superficie']) }
    else if (seg.kind === 'bottom') rows.push(['Tiempo en el fondo', `${fmt(h - seg.t0)} min`])
    else rows.push(['Velocidad vertical', `${Math.abs(rate).toFixed(0)} m/min ${rate > 0 ? '↓' : '↑'}`])
    rows.push(['Presión ambiente', `${n2(pamb(d))} bar`], ['PO₂ respirada', `${n2(po2)} bar${po2 > 1.4 ? ' ⚠' : ''}`])
    tip = { l: (g.x(h) / (PW - 1)) * 100, t: (g.y(d) / PH) * 100, title: NAME[seg.kind] + (stop ? ` · ${stop.depth} m` : ''), color: rgb(pal.line[seg.kind]), rows }
  }
  const kpis: [string, string][] = [['Tiempo de fondo', `${T} min`], ['Ascenso', `${Math.round(plan.ascentMin)} min`], ['Total', `${Math.round(tot)} min`], ['Límite sin deco', `${plan.ndl} min`], [used !== null ? 'Consumo' : 'Gas', used !== null ? `${used} bar` : fo2 === 0.21 ? 'Aire' : `EANx ${Math.round(fo2 * 100)}`]]
  return <section className="mb-4 rounded-xl bg-white p-4 md:p-5"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-deep">Perfil de la inmersión y descompresión</h2>
    <span className={`eyebrow px-3 py-1 ${plan.deco ? 'bg-amber-100 text-amber-800' : 'bg-teal-50 text-teal-800'}`}>{plan.deco ? 'Descompresión obligatoria' : 'Sin descompresión'}</span></div>
    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">{kpis.map(([k, v]) => <div key={k} className="border-l-2 px-3 py-1" style={{ borderColor: 'var(--accent)' }}><div className="eyebrow">{k}</div><div className="font-display text-xl font-semibold text-navy">{v}</div></div>)}</div>
    {plan.deco && <p className="mb-3 bg-amber-50 p-3 text-sm text-amber-800">Con {D} m y {T} min de fondo se supera el límite sin descompresión de este modelo ({plan.ndl} min a esa profundidad). El ascenso exige <b>{stopMin} min</b> de paradas en {plan.stops.length} niveles.</p>}
    {plan.ppo2 > 1.4 && <p className="mb-3 bg-red-50 p-3 text-sm text-red-700"><b>PO₂ elevada:</b> {n2(plan.ppo2)} bar a {D} m supera el máximo de 1,4 bar (profundidad máxima operativa de esta mezcla: {Math.floor(plan.mod)} m).</p>}
    <div className="relative mb-8 ml-9 mt-6" onPointerMove={move} onPointerDown={move} onPointerLeave={() => setH(null)} style={{ touchAction: 'pan-y' }}>
      <canvas ref={main} width={PW} height={PH} className="pixel-canvas block w-full" style={{ aspectRatio: `${PW} / ${PH}` }} role="img" aria-label={`Perfil de inmersión a ${D} m con ${plan.stops.length} paradas`} />
      <canvas ref={cur} width={PW} height={PH} className="pixel-canvas pointer-events-none absolute inset-0 h-full w-full" />
      <span className="pixel-font absolute -left-9 -top-5 text-[10px] text-slate-500">M</span><span className="pixel-font absolute -bottom-7 right-0 text-[10px] text-slate-500">MIN</span>
      {yt.map((d) => <span key={d} className="pixel-font absolute -left-9 w-7 -translate-y-1/2 text-right text-[10px] text-slate-500" style={{ top: `${(g.y(d) / PH) * 100}%` }}>{d}</span>)}
      {xt.map((t) => <span key={t} className="pixel-font absolute top-full mt-1.5 -translate-x-1/2 text-[10px] text-slate-500" style={{ left: `${(g.x(t) / (PW - 1)) * 100}%` }}>{t}</span>)}
      <span className="pixel-font absolute right-2 px-1.5 text-[10px]" style={{ top: `calc(${(g.y(D) / PH) * 100}% - 1.3rem)`, background: 'var(--accent)', color: 'var(--primary-fg)' }}>MÁX {D} M</span>
      {tip && <div className="pointer-events-none absolute z-10 w-56 border bg-[var(--card-solid)] p-3 text-xs" style={{ left: `${tip.l}%`, top: `${tip.t}%`, borderColor: tip.color, transform: `translate(${tip.l > 62 ? 'calc(-100% - 18px)' : '18px'}, ${tip.t > 55 ? '-105%' : '12px'})` }}>
        <div className="font-display mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-navy"><span className="h-2.5 w-2.5" style={{ background: tip.color }} />{tip.title}</div>
        <dl className="space-y-1">{tip.rows.map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-slate-500">{k}</dt><dd className="mono">{v}</dd></div>)}</dl></div>}
    </div>
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">{(Object.keys(NAME) as Seg['kind'][]).filter((k) => k !== (plan.deco ? 'safety' : 'stop')).map((k) => <span key={k} className="flex items-center gap-1.5"><span className="h-2.5 w-4" style={{ background: rgb(pal.line[k]) }} />{NAME[k]}</span>)}</div>
    {plan.stops.length > 0 && <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-100"><tr><th className="p-2">{plan.deco ? 'Parada de descompresión' : 'Parada de seguridad'}</th><th>Duración</th><th>Inicio</th><th>Fin</th></tr></thead>
      <tbody>{plan.stops.map((s) => <tr key={s.depth} className="border-t"><td className="p-2 font-medium">{s.depth} m</td><td>{s.min} min</td><td className="mono">{fmt(s.start)}</td><td className="mono">{fmt(s.start + s.min)}</td></tr>)}</tbody></table></div>}
    <p className="mt-3 text-xs text-slate-500">Cálculo orientativo con el modelo Bühlmann ZH-L16C (factores de gradiente {GF_LOW * 100}/{GF_HIGH * 100}, más conservador que muchas tablas recreativas): descenso a 18 m/min, ascenso a 9 m/min, paradas cada 3 m, mezcla {fo2 === 0.21 ? 'aire' : `EANx ${Math.round(fo2 * 100)}`}. Considera el tiempo registrado como tiempo de fondo (desde que sales de la superficie hasta que empiezas a subir) y una primera inmersión del día, sin nitrógeno residual. <b>No es el registro de tu ordenador ni sirve para planificar inmersiones</b>: usa siempre tus tablas oficiales o tu ordenador.</p></section>
}
