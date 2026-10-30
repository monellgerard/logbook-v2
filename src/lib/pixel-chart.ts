// Gráfico de inmersión en píxeles: se dibuja en un búfer RGBA de baja resolución y el navegador lo amplía sin suavizar.
import type { Plan, Seg } from './deco'
export const PW = 240, PH = 120
type C = [number, number, number]
export type Pal = { grid: C; frame: C; surf: C; fill: C; marker: C; line: Record<Seg['kind'], C> }
export const PAL_DARK: Pal = { grid: [170, 200, 235], frame: [240, 138, 93], surf: [150, 220, 255], fill: [70, 165, 225], marker: [255, 255, 255],
  line: { descent: [96, 205, 255], bottom: [70, 235, 215], ascent: [150, 238, 255], stop: [255, 176, 64], safety: [100, 238, 150] } }
export const PAL_LIGHT: Pal = { grid: [20, 60, 100], frame: [196, 86, 42], surf: [20, 110, 170], fill: [30, 110, 180], marker: [10, 30, 55],
  line: { descent: [20, 120, 190], bottom: [0, 150, 140], ascent: [40, 150, 190], stop: [205, 105, 15], safety: [20, 150, 80] } }
export function geometry(D: number, tot: number) {
  const dStep = D > 40 ? 10 : 5, dMax = Math.ceil((D * 1.12) / dStep) * dStep, top = 9
  const tStep = tot <= 30 ? 5 : tot <= 60 ? 10 : tot <= 120 ? 15 : 30
  return { dStep, dMax, top, tStep, x: (t: number) => Math.round((t / tot) * (PW - 1)), y: (d: number) => Math.round(top + (d / dMax) * (PH - 1 - top)) }
}
class Pix {
  buf = new Uint8ClampedArray(PW * PH * 4)
  over(x: number, y: number, c: C, a = 255) {
    x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= PW || y >= PH) return
    const i = (y * PW + x) * 4, sa = a / 255, da = this.buf[i + 3] / 255, oa = sa + da * (1 - sa); if (oa <= 0) return
    for (let k = 0; k < 3; k++) this.buf[i + k] = (c[k] * sa + this.buf[i + k] * da * (1 - sa)) / oa
    this.buf[i + 3] = oa * 255
  }
  rect(x: number, y: number, w: number, h: number, c: C, a = 255) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.over(x + i, y + j, c, a) }
  line(x0: number, y0: number, x1: number, y1: number, c: C, th = 1, a = 255) {   // Bresenham con grosor
    let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0); const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy
    for (;;) { this.rect(x0, y0 - (th >> 1), 1, th, c, a); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx } if (e2 <= dx) { e += dx; y0 += sy } }
  }
}
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
const depthAt = (plan: Plan, t: number) => { const s = plan.segs.find((q) => t >= q.t0 && t <= q.t1) ?? plan.segs[plan.segs.length - 1]; const d = s.t1 - s.t0; return d > 0 ? s.d0 + (s.d1 - s.d0) * ((t - s.t0) / d) : s.d1 }
export function renderProfile(plan: Plan, D: number, pal: Pal): Uint8ClampedArray {
  const P = new Pix(), g = geometry(D, plan.total), { x, y } = g, tot = plan.total, y0 = y(0)
  // cuadrícula punteada
  for (let d = g.dStep; d <= g.dMax; d += g.dStep) for (let i = 0; i < PW; i += 2) P.over(i, y(d), pal.grid, 46)
  for (let t = g.tStep; t < tot; t += g.tStep) for (let j = y0; j < PH; j += 2) P.over(x(t), j, pal.grid, 36)
  // relleno con tramado ordenado (más denso a más profundidad)
  for (let i = 0; i < PW; i++) {
    const yp = y(depthAt(plan, (i / (PW - 1)) * tot))
    for (let j = y0 + 1; j <= yp; j++) { const dens = Math.min(1, 0.16 + ((j - y0) / (PH - y0)) * 0.7 + (yp - j < 5 ? 0.25 : 0)); if (BAYER[j & 3][i & 3] / 16 < dens) P.over(i, j, pal.fill, 120) }
  }
  // superficie con oleaje en píxeles
  for (let i = 0; i < PW; i++) { const w = Math.round(Math.sin(i * 0.42) * 1.1); P.over(i, y0 - 3 + w, pal.surf, 210); if ((i & 3) === 0) P.over(i, y0 - 5 + w, pal.surf, 110) }
  // profundidad máxima (línea discontinua)
  for (let i = 0; i < PW; i += 6) P.rect(i, y(D), 3, 1, pal.line.bottom, 150)
  // tramos del perfil: línea con brillo superior (efecto relieve en píxeles)
  const hi = (c: C): C => [Math.min(255, c[0] + 70), Math.min(255, c[1] + 70), Math.min(255, c[2] + 70)]
  for (const s of plan.segs) {
    const c = pal.line[s.kind], stop = s.kind === 'stop' || s.kind === 'safety', xa = x(s.t0), xb = x(s.t1), ya = y(s.d0), yb = y(s.d1)
    if (stop) { const w = Math.max(3, xb - xa + 1); P.rect(xa, ya - 2, w, 5, [0, 0, 0], 70); P.rect(xa, ya - 2, w, 4, c); P.rect(xa, ya - 2, w, 1, hi(c)); for (let i = xa + 2; i < xa + w; i += 4) P.over(i, ya + 1, [0, 0, 0], 60) }
    else { P.line(xa, ya + 1, xb, yb + 1, [0, 0, 0], 3, 60); P.line(xa, ya, xb, yb, c, 3); P.line(xa, ya - 1, xb, yb - 1, hi(c), 1, 200) }
  }
  // marcadores en rombo al inicio de cada parada
  for (const s of plan.stops) { const cx = x(s.start), cy = y(s.depth); for (let k = -3; k <= 3; k++) { const w = 3 - Math.abs(k); P.rect(cx - w, cy + k, 2 * w + 1, 1, pal.marker); } P.over(cx, cy, pal.line.stop) }
  // marco HUD: esquinas en L
  const L = 7, f = pal.frame
  for (let k = 0; k < L; k++) { P.over(k, 0, f); P.over(0, k, f); P.over(PW - 1 - k, 0, f); P.over(PW - 1, k, f); P.over(k, PH - 1, f); P.over(0, PH - 1 - k, f); P.over(PW - 1 - k, PH - 1, f); P.over(PW - 1, PH - 1 - k, f) }
  return P.buf
}
const DIVER = ['...##.......', '.######..#..', '##########..', '.######.##..', '...##...##..']   // buceador de 12x5
export function renderCursor(plan: Plan, D: number, tHover: number, pal: Pal): Uint8ClampedArray {
  const P = new Pix(), g = geometry(D, plan.total), cx = g.x(tHover), cy = g.y(depthAt(plan, tHover))
  for (let j = g.y(0); j < PH; j += 2) P.over(cx, j, pal.marker, 150)
  for (let i = 0; i < PW; i += 2) P.over(i, cy, pal.marker, 70)
  P.rect(cx - 7, cy - 6, 14, 12, [0, 0, 0], 90)
  DIVER.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') P.over(cx - 6 + i, cy - 3 + j, pal.marker) }))
  P.over(cx + 7, cy - 6, pal.surf, 200); P.over(cx + 9, cy - 9, pal.surf, 160)   // burbujas
  return P.buf
}
