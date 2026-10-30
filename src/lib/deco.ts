// Modelo de descompresión Bühlmann ZH-L16C (nitrógeno) con factores de gradiente.
// MATERIAL DIDÁCTICO: no sustituye a las tablas oficiales, a un planificador ni a un ordenador de buceo.
const HT = [5.0, 8.0, 12.5, 18.5, 27.0, 38.3, 54.3, 77.0, 109.0, 146.0, 187.0, 239.0, 305.0, 390.0, 498.0, 635.0]
const A = [1.1696, 1.0, 0.8618, 0.7562, 0.62, 0.5043, 0.441, 0.4, 0.375, 0.35, 0.3295, 0.3065, 0.2835, 0.261, 0.248, 0.2327]
const B = [0.5578, 0.6514, 0.7222, 0.7825, 0.8126, 0.8434, 0.8693, 0.891, 0.9092, 0.9222, 0.9319, 0.9403, 0.9477, 0.9544, 0.9602, 0.9653]
const K = HT.map((h) => Math.LN2 / h)
const PSURF = 1.01325, PWV = 0.0627, BAR_PER_M = 0.1
export const GF_LOW = 0.3, GF_HIGH = 0.85   // conservador
export const DESCENT = 18, ASCENT = 9, STEP = 3   // m/min, m/min, m entre paradas
export const pamb = (d: number) => PSURF + d * BAR_PER_M
function schreiner(p: number[], d0: number, d1: number, min: number, fn2: number): number[] {
  const pi0 = (pamb(d0) - PWV) * fn2, R = (fn2 * (pamb(d1) - pamb(d0))) / min
  return p.map((pt, i) => pi0 + R * (min - 1 / K[i]) - (pi0 - pt - R / K[i]) * Math.exp(-K[i] * min))
}
const ceilingM = (p: number[], gf: number) => (Math.max(...p.map((pt, i) => (pt - A[i] * gf) / (gf / B[i] - gf + 1))) - PSURF) / BAR_PER_M
export const FO2: Record<string, number> = { aire: 0.21, eanx32: 0.32, eanx36: 0.36, eanx40: 0.4 }
export const gasFo2 = (mix: string | null | undefined) => (!mix ? 0.21 : FO2[mix] ?? null)   // null = mezcla no soportada
export type Stop = { depth: number; min: number; start: number }
export type Seg = { t0: number; d0: number; t1: number; d1: number; kind: 'descent' | 'bottom' | 'ascent' | 'stop' | 'safety' }
export type Plan = { segs: Seg[]; pts: [number, number][]; stops: Stop[]; total: number; ascentMin: number; deco: boolean; safetyStop: boolean; ndl: number; ppo2: number; mod: number; fo2: number }
const initial = (fn2: number) => Array(16).fill((PSURF - PWV) * fn2) as number[]
export function ndl(depth: number, fo2: number) {
  const fn2 = 1 - fo2, down = depth / DESCENT
  let p = schreiner(initial(fn2), 0, depth, down, fn2), t = down
  if (ceilingM(p, GF_HIGH) > 0.01) return Math.floor(down)
  for (let i = 0; i < 600; i++) { const q = schreiner(p, depth, depth, 1, fn2); if (ceilingM(q, GF_HIGH) > 0.01) break; p = q; t += 1 }
  return Math.floor(t)
}
// «bottomMin» = tiempo de fondo de las tablas: desde que sales de la superficie hasta que empiezas a subir.
export function planDive(depth: number, bottomMin: number, fo2: number): Plan {
  const fn2 = 1 - fo2, down = depth / DESCENT
  let p = schreiner(initial(fn2), 0, depth, down, fn2), t = down
  const pts: [number, number][] = [[0, 0], [down, depth]]
  const segs: Seg[] = [{ t0: 0, d0: 0, t1: down, d1: depth, kind: 'descent' }]
  if (bottomMin > down) { p = schreiner(p, depth, depth, bottomMin - down, fn2); segs.push({ t0: down, d0: depth, t1: bottomMin, d1: depth, kind: 'bottom' }); t = bottomMin; pts.push([t, depth]) }
  const leave = t, stops: Stop[] = []
  const deco = ceilingM(p, GF_HIGH) > 0.01
  let safetyStop = false, cur = depth
  const go = (to: number) => { const t0 = t, d0 = cur, m = Math.abs(cur - to) / ASCENT; p = schreiner(p, cur, to, m, fn2); t += m; cur = to; pts.push([t, cur]); segs.push({ t0, d0, t1: t, d1: to, kind: 'ascent' }) }
  if (deco) {
    const fs = Math.min(depth, Math.ceil(ceilingM(p, GF_LOW) / STEP) * STEP)
    if (fs < cur) go(fs)
    const gfAt = (d: number) => GF_HIGH + (GF_LOW - GF_HIGH) * (d / fs)
    while (cur > 0) {
      const next = Math.max(0, cur - STEP), start = t
      let stay = 0
      while (ceilingM(p, gfAt(next)) > next + 1e-6 && stay < 999) { p = schreiner(p, cur, cur, 1, fn2); stay++; t += 1 }
      if (stay) { stops.push({ depth: cur, min: stay, start }); segs.push({ t0: start, d0: cur, t1: t, d1: cur, kind: 'stop' }); pts.push([t, cur]) }
      go(next)
    }
  } else if (depth > 10) {   // parada de seguridad recomendada
    safetyStop = true; go(5); const start = t; p = schreiner(p, 5, 5, 3, fn2); t += 3; stops.push({ depth: 5, min: 3, start }); segs.push({ t0: start, d0: 5, t1: t, d1: 5, kind: 'safety' }); pts.push([t, 5]); go(0)
  } else go(0)
  const ppo2 = fo2 * pamb(depth)
  return { segs, pts, stops, total: t, ascentMin: t - leave, deco, safetyStop, ndl: ndl(depth, fo2), ppo2, mod: (1.4 / fo2 - PSURF) / BAR_PER_M, fo2 }
}
