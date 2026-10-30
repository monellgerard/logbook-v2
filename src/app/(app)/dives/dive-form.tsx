'use client'
import { useState, useEffect, useActionState } from 'react'
import Link from 'next/link'
import { saveDive } from './actions'
import { OPT } from '@/lib/dive-schema'
type D = Record<string, any>
const Sec = ({ t, children }: { t: string; children: React.ReactNode }) => <section className="rounded-xl bg-white p-5"><h2 className="mb-4 border-b pb-2 font-semibold text-deep">{t}</h2><div className="fit-grid">{children}</div></section>
const F = ({ l, children, wide }: { l: string; children: React.ReactNode; wide?: boolean }) => <label className={`block text-sm ${wide ? 'fit-wide' : ''}`}><span className="mb-1 block text-slate-600">{l}</span>{children}</label>
export default function DiveForm({ dive }: { dive?: D }) {
  const [state, action] = useActionState(saveDive.bind(null, dive?.id ?? null), {} as { error?: string })
  const [dirty, setDirty] = useState(false)
  const [tm, setTm] = useState(dive?.tank_material ?? ''), [tc, setTc] = useState(dive?.tank_capacity_l ?? ''), [gm, setGm] = useState(dive?.gas_mix ?? '')
  const [p1, setP1] = useState(dive?.pressure_start_bar ?? ''), [p2, setP2] = useState(dive?.pressure_end_bar ?? '')
  const [rating, setRating] = useState<number | null>(dive?.rating ?? null)
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault() }; window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h) }, [dirty])
  const v = (k: string) => dive?.[k] ?? ''
  const sel = (k: string, val: string, set?: (s: string) => void) => <select name={k} defaultValue={val} onChange={(e) => set?.(e.target.value)} className="input"><option value="">—</option>{OPT[k as keyof typeof OPT].map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select>
  const otro = (k: string, show: boolean) => show && <F l="Especificar"><input name={k} defaultValue={v(k)} className="input" /></F>
  return <form action={action} onChange={() => setDirty(true)} onSubmit={() => setDirty(false)} className="w-full space-y-4">
    {state.error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
    <Sec t="A · Datos generales">
      <F l="Nº de inmersión (vacío = automático)"><input name="dive_number" type="number" min={1} defaultValue={v('dive_number')} className="input" /></F>
      <F l="Lugar *"><input name="site" required defaultValue={v('site')} className="input" /></F>
      <F l="Fecha *"><input name="dive_date" type="date" required defaultValue={v('dive_date') || new Date().toISOString().slice(0, 10)} className="input" /></F>
      <F l="Hora de inicio"><input name="start_time" type="time" defaultValue={String(v('start_time')).slice(0, 5)} className="input" /></F>
      <F l="Profundidad máxima (m) *"><input name="max_depth_m" type="number" step="0.1" min={0} required defaultValue={v('max_depth_m')} className="input" /></F>
      <F l="Tiempo de inmersión (min) *"><input name="duration_min" type="number" min={1} required defaultValue={v('duration_min')} className="input" /></F></Sec>
    <Sec t="B · Condiciones ambientales">
      <F l="Temperatura del agua (°C)"><input name="water_temp_c" type="number" step="0.1" defaultValue={v('water_temp_c')} className="input" /></F>
      <F l="Visibilidad">{sel('visibility', v('visibility'))}</F><F l="Oleaje">{sel('swell', v('swell'))}</F><F l="Corriente">{sel('current', v('current'))}</F></Sec>
    <Sec t="C · Equipamiento">
      <F l="Traje">{sel('suit_type', v('suit_type'))}</F>
      <F l="Lastre (kg)"><input name="weight_kg" type="number" step="0.5" min={0} defaultValue={v('weight_kg')} className="input" /></F>
      <F l="Material de la botella">{sel('tank_material', tm, setTm)}</F>{otro('tank_material_other', tm === 'otros')}
      <F l="Capacidad de la botella">{sel('tank_capacity_l', tc, setTc)}</F>{otro('tank_capacity_other', tc === 'otros')}
      <F l="Mezcla / sistema respiratorio">{sel('gas_mix', gm, setGm)}</F>{otro('gas_mix_other', gm === 'otros')}</Sec>
    <Sec t="D · Presiones">
      <F l="Presión inicial (bar)"><input name="pressure_start_bar" type="number" min={0} value={p1} onChange={(e) => setP1(e.target.value)} className="input" /></F>
      <F l="Presión final (bar)"><input name="pressure_end_bar" type="number" min={0} value={p2} onChange={(e) => setP2(e.target.value)} className="input" /></F>
      {p1 !== '' && p2 !== '' && Number(p2) > Number(p1) && <p className="rounded bg-amber-50 p-2 text-sm text-amber-800 fit-wide">⚠ La presión final es mayor que la inicial. Revisa los datos (puedes guardar igualmente).</p>}</Sec>
    <Sec t="E · Equipo y trabajo">
      <F l="Jefe de equipo"><input name="team_leader" defaultValue={v('team_leader')} className="input" /></F><F l="Pareja de inmersión"><input name="buddy" defaultValue={v('buddy')} className="input" /></F>
      {[['work_task', 'Trabajo a realizar'], ['incidents', 'Incidencias'], ['tools', 'Herramientas utilizadas']].map(([k, l]) => <F key={k} l={l} wide><textarea name={k} rows={3} defaultValue={v(k)} className="input" /></F>)}</Sec>
    <Sec t="F · Valoración"><div className="fit-wide"><input type="hidden" name="rating" value={rating ?? ''} />
      <div className="flex flex-wrap gap-1">{Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <button type="button" key={n} onClick={() => { setRating(rating === n ? null : n); setDirty(true) }} aria-pressed={rating === n} className={`h-10 w-10 rounded-lg border ${rating !== null && n <= rating ? 'border-teal-dark bg-teal text-white' : 'bg-white'}`}>{n}</button>)}</div></div></Sec>
    <div className="flex gap-3"><button className="btn">Guardar inmersión</button><Link href="/dives" onClick={(e) => { if (dirty && !confirm('Hay cambios sin guardar. ¿Salir sin guardar?')) e.preventDefault() }} className="rounded-lg border px-4 py-2">Cancelar</Link></div></form>
}
