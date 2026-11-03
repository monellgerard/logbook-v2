'use client'
import { useRef, useState } from 'react'
import { planDive, gasFo2, pamb, GF_LOW, GF_HIGH, type Seg } from '@/lib/deco'
const COLOR: Record<Seg['kind'], string> = { descent: '#38bdf8', bottom: '#14b8c4', ascent: '#5eead4', stop: '#f59e0b', safety: '#34d399' }
const NAME: Record<Seg['kind'], string> = { descent: 'Descenso', bottom: 'Tiempo de fondo', ascent: 'Ascenso', stop: 'Parada de descompresión', safety: 'Parada de seguridad' }
const fmt = (m: number) => { let s = Math.round(m * 60); const mm = Math.floor(s / 60); s -= mm * 60; return `${mm}:${String(s).padStart(2, '0')}` }
const n1 = (v: number) => v.toFixed(1).replace('.', ',')
const n2 = (v: number) => v.toFixed(2).replace('.', ',')
// Perfil calculado con Bühlmann ZH-L16C (GF 30/85). Pasa el cursor (o el dedo) por la gráfica para ver el detalle de cada tramo y parada.
export default function DiveProfile({ depth, minutes, gasMix, startBar, endBar }: { depth: number | string; minutes: number | string; gasMix?: string | null; startBar?: number | null; endBar?: number | null }) {
  const ref = useRef<SVGSVGElement>(null)
  const [h, setH] = useState<number | null>(null)
  const D = Number(depth), T = Number(minutes), fo2 = gasFo2(gasMix)
  if (!(D > 0) || !(T > 0)) return null
  if (fo2 === null) return <section className="mb-4 max-w-4xl rounded-2xl bg-white p-4 shadow-sm"><h2 className="mb-2 font-semibold text-deep">Perfil de la inmersión</h2>
    <p className="text-sm text-slate-500">El cálculo de descompresión solo está disponible para aire y EANx 32/36/40. Con trimix, rebreather u otras mezclas debes usar tu planificador u ordenador de buceo.</p></section>
  const plan = planDive(D, T, fo2), tot = plan.total
  const W = 760, H = 330, ml = 50, mr = 20, mt = 24, mb = 42
  const dStep = D > 40 ? 10 : 5, dMax = Math.ceil((D * 1.12) / dStep) * dStep, tStep = tot <= 30 ? 5 : tot <= 60 ? 10 : tot <= 120 ? 15 : 30
  const x = (m: number) => ml + (m / tot) * (W - ml - mr), y = (d: number) => mt + (d / dMax) * (H - mt - mb)
  const line = plan.pts.map(([m, d], i) => `${i ? 'L' : 'M'}${x(m).toFixed(1)} ${y(d).toFixed(1)}`).join(' ')
  const area = `${line} L${x(tot).toFixed(1)} ${y(0).toFixed(1)} L${x(0).toFixed(1)} ${y(0).toFixed(1)}Z`
  const yt = Array.from({ length: dMax / dStep + 1 }, (_, i) => i * dStep), xt = Array.from({ length: Math.floor(tot / tStep) + 1 }, (_, i) => i * tStep)
  const used = startBar != null && endBar != null && startBar >= endBar ? startBar - endBar : null
  const stopMin = plan.stops.reduce((s, p) => s + p.min, 0)
  const move = (e: React.PointerEvent<SVGSVGElement>) => { const r = ref.current!.getBoundingClientRect(); setH(Math.min(tot, Math.max(0, ((((e.clientX - r.left) / r.width) * W - ml) / (W - ml - mr)) * tot))) }
  // Datos del punto bajo el cursor
  let tip: { left: number; top: number; title: string; color: string; rows: [string, string][]; px: number; py: number } | null = null
  if (h !== null) {
    const seg = plan.segs.find((s) => h >= s.t0 && h <= s.t1) ?? plan.segs[plan.segs.length - 1]
    const dur = seg.t1 - seg.t0, d = dur > 0 ? seg.d0 + (seg.d1 - seg.d0) * ((h - seg.t0) / dur) : seg.d1, rate = dur > 0 ? (seg.d1 - seg.d0) / dur : 0
    const stop = seg.kind === 'stop' || seg.kind === 'safety' ? plan.stops.find((s) => Math.abs(s.start - seg.t0) < 1e-6) : undefined
    const po2 = fo2 * pamb(d)
    const rows: [string, string][] = [['Tiempo', `${fmt(h)} min`], ['Profundidad', `${n1(d)} m`]]
    if (stop) { const i = plan.stops.indexOf(stop), nx = plan.stops[i + 1]; rows.push(['Duración de la parada', `${stop.min} min`], ['Intervalo', `${fmt(stop.start)} – ${fmt(stop.start + stop.min)}`], ['Después', nx ? `sube a ${nx.depth} m` : 'sube a superficie']) }
    else if (seg.kind === 'bottom') rows.push(['Tiempo en el fondo', `${fmt(h - seg.t0)} min`])
    else rows.push(['Velocidad vertical', `${Math.abs(rate).toFixed(0)} m/min ${rate > 0 ? '↓' : '↑'}`])
    rows.push(['Presión ambiente', `${n2(pamb(d))} bar`], ['PO₂ respirada', `${n2(po2)} bar${po2 > 1.4 ? ' ⚠' : ''}`])
    const px = x(h), py = y(d)
    tip = { left: (px / W) * 100, top: (py / H) * 100, title: NAME[seg.kind] + (stop ? ` · ${stop.depth} m` : ''), color: COLOR[seg.kind], rows, px, py }
  }
  const kpis: [string, string][] = [['Tiempo de fondo', `${T} min`], ['Ascenso', `${Math.round(plan.ascentMin)} min`], ['Total', `${Math.round(tot)} min`], ['Límite sin deco', `${plan.ndl} min`], [used !== null ? 'Consumo' : 'Gas', used !== null ? `${used} bar` : fo2 === 0.21 ? 'Aire' : `EANx ${Math.round(fo2 * 100)}`]]
  return <section className="mb-4 max-w-4xl rounded-2xl bg-white p-4 shadow-sm md:p-5"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold text-deep">Perfil de la inmersión y descompresión</h2>
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${plan.deco ? 'bg-amber-100 text-amber-800' : 'bg-teal-50 text-teal-800'}`}>{plan.deco ? 'Descompresión obligatoria' : 'Sin descompresión'}</span></div>
    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">{kpis.map(([k, v]) => <div key={k} className="rounded-xl border px-3 py-2"><div className="text-[11px] uppercase tracking-wide text-slate-500">{k}</div><div className="text-lg font-semibold text-navy">{v}</div></div>)}</div>
    {plan.deco && <p className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Con {D} m y {T} min de fondo se supera el límite sin descompresión de este modelo ({plan.ndl} min a esa profundidad). El ascenso exige <b>{stopMin} min</b> de paradas en {plan.stops.length} niveles.</p>}
    {plan.ppo2 > 1.4 && <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700"><b>PO₂ elevada:</b> {n2(plan.ppo2)} bar a {D} m supera el máximo de 1,4 bar (profundidad máxima operativa de esta mezcla: {Math.floor(plan.mod)} m).</p>}
    <div className="relative">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-pan-y select-none text-slate-500" role="img" aria-label={`Perfil de inmersión a ${D} m con ${plan.stops.length} paradas`} onPointerMove={move} onPointerDown={move} onPointerLeave={() => setH(null)}>
        <defs><linearGradient id="dp-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#14b8c4" stopOpacity=".02" /><stop offset="1" stopColor="#0ea5e9" stopOpacity=".38" /></linearGradient></defs>
        <rect x={ml} y={mt} width={W - ml - mr} height={H - mt - mb} fill="currentColor" opacity=".04" rx="4" />
        {yt.map((d) => <g key={d}><line x1={ml} x2={W - mr} y1={y(d)} y2={y(d)} stroke="currentColor" opacity={d === 0 ? 0.45 : 0.16} strokeDasharray={d === 0 ? undefined : '3 4'} /><text x={ml - 8} y={y(d) + 4} textAnchor="end" fontSize="11" fill="currentColor">{d}</text></g>)}
        {xt.map((m) => <g key={m}><line x1={x(m)} x2={x(m)} y1={mt} y2={H - mb} stroke="currentColor" opacity=".08" /><text x={x(m)} y={H - mb + 17} textAnchor="middle" fontSize="11" fill="currentColor">{m}</text></g>)}
        <text x={ml - 8} y={13} textAnchor="end" fontSize="11" fill="currentColor">m</text><text x={W - mr} y={H - 8} textAnchor="end" fontSize="11" fill="currentColor">tiempo (min)</text>
        <path d={area} fill="url(#dp-grad)" className="fade-in" />
        {plan.segs.map((s, i) => <line key={i} x1={x(s.t0)} y1={y(s.d0)} x2={x(s.t1)} y2={y(s.d1)} stroke={COLOR[s.kind]} strokeWidth={s.kind === 'stop' || s.kind === 'safety' ? 7 : 3} strokeLinecap="round" pathLength={1} className="draw" style={{ animationDelay: `${i * 0.14}s` }} />)}
        <line x1={ml} x2={W - mr} y1={y(D)} y2={y(D)} stroke="#14b8c4" strokeDasharray="5 5" opacity=".55" />
        <g transform={`translate(${ml + 8} ${y(D) - 24})`}><rect width="78" height="20" rx="10" fill="#0e8f99" /><text x="39" y="14" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#fff">máx. {D} m</text></g>
        {plan.stops.length <= 7 && plan.stops.map((s) => <text key={s.depth} x={x(s.start + s.min / 2)} y={y(s.depth) - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill={plan.deco ? '#f59e0b' : '#34d399'}>{s.depth} m · {s.min}′</text>)}
        {tip && <g pointerEvents="none"><line x1={tip.px} x2={tip.px} y1={mt} y2={H - mb} stroke="currentColor" opacity=".45" strokeDasharray="3 3" /><circle cx={tip.px} cy={tip.py} r="7" fill={tip.color} opacity=".25" /><circle cx={tip.px} cy={tip.py} r="4.5" fill={tip.color} stroke="#fff" strokeWidth="2" /></g>}
      </svg>
      {tip && <div className="pointer-events-none absolute z-10 w-56 rounded-xl border bg-[var(--card-solid)] p-3 text-xs shadow-xl" style={{ left: `${tip.left}%`, top: `${tip.top}%`, transform: `translate(${tip.left > 62 ? 'calc(-100% - 14px)' : '14px'}, ${tip.top > 55 ? '-105%' : '12px'})` }}>
        <div className="mb-2 flex items-center gap-2 font-semibold text-navy"><span className="h-2.5 w-2.5 rounded-full" style={{ background: tip.color }} />{tip.title}</div>
        <dl className="space-y-1">{tip.rows.map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-slate-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl></div>}
    </div>
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">{(Object.keys(NAME) as Seg['kind'][]).filter((k) => k !== (plan.deco ? 'safety' : 'stop')).map((k) => <span key={k} className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full" style={{ background: COLOR[k] }} />{NAME[k]}</span>)}</div>
    {plan.stops.length > 0 && <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-100"><tr><th className="p-2">{plan.deco ? 'Parada de descompresión' : 'Parada de seguridad'}</th><th>Duración</th><th>Inicio</th><th>Fin</th></tr></thead>
      <tbody>{plan.stops.map((s) => <tr key={s.depth} className="border-t"><td className="p-2 font-medium">{s.depth} m</td><td>{s.min} min</td><td>{fmt(s.start)}</td><td>{fmt(s.start + s.min)}</td></tr>)}</tbody></table></div>}
    <p className="mt-3 text-xs text-slate-500">Cálculo orientativo con el modelo Bühlmann ZH-L16C (factores de gradiente {GF_LOW * 100}/{GF_HIGH * 100}, más conservador que muchas tablas recreativas): descenso a 18 m/min, ascenso a 9 m/min, paradas cada 3 m, mezcla {fo2 === 0.21 ? 'aire' : `EANx ${Math.round(fo2 * 100)}`}. Considera el tiempo registrado como tiempo de fondo (desde que sales de la superficie hasta que empiezas a subir) y una primera inmersión del día, sin nitrógeno residual. <b>No es el registro de tu ordenador ni sirve para planificar inmersiones</b>: usa siempre tus tablas oficiales o tu ordenador.</p></section>
}
