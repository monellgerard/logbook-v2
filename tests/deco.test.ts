import { describe, it, expect } from 'vitest'
import { planDive, ndl } from '../src/lib/deco'
describe('modelo de descompresión (Bühlmann ZH-L16C, GF 30/85)', () => {
  it('el límite sin descompresión baja al aumentar la profundidad', () => { const n = [12, 18, 24, 30, 40].map((d) => ndl(d, 0.21)); for (let i = 1; i < n.length; i++) expect(n[i]).toBeLessThan(n[i - 1]) })
  it('valores en rangos razonables (aire)', () => { expect(ndl(18, 0.21)).toBeGreaterThan(30); expect(ndl(18, 0.21)).toBeLessThan(60); expect(ndl(30, 0.21)).toBeGreaterThan(8); expect(ndl(30, 0.21)).toBeLessThan(25) })
  it('el nitrox alarga el límite', () => { expect(ndl(30, 0.32)).toBeGreaterThan(ndl(30, 0.21)) })
  it('dentro del límite: sin descompresión y parada de seguridad si pasa de 10 m', () => { const p = planDive(18, 25, 0.21); expect(p.deco).toBe(false); expect(p.stops).toEqual([expect.objectContaining({ depth: 5, min: 3 })]) })
  it('someras: sin paradas', () => { const p = planDive(8, 30, 0.21); expect(p.deco).toBe(false); expect(p.stops).toHaveLength(0) })
  it('descompresión: paradas cada 3 m, de más profunda a más somera, la última a 3 m', () => {
    const p = planDive(40, 30, 0.21); expect(p.deco).toBe(true)
    p.stops.forEach((s) => expect(s.depth % 3).toBe(0)); for (let i = 1; i < p.stops.length; i++) expect(p.stops[i].depth).toBeLessThan(p.stops[i - 1].depth)
    expect(p.stops.at(-1)!.depth).toBe(3)
  })
  it('más tiempo de fondo exige más descompresión', () => { const m = (t: number) => planDive(40, t, 0.21).stops.reduce((s, x) => s + x.min, 0); expect(m(40)).toBeGreaterThan(m(30)); expect(m(30)).toBeGreaterThan(m(20)) })
  it('avisa de PO2 excesiva', () => { expect(planDive(45, 20, 0.4).ppo2).toBeGreaterThan(1.4) })
  it('el perfil termina en superficie y su duración total cuadra', () => { const p = planDive(30, 25, 0.21); expect(p.pts.at(-1)![1]).toBe(0); expect(p.pts.at(-1)![0]).toBeCloseTo(p.total, 5) })
  it('los tramos son consecutivos y siempre acaban en superficie', () => { for (const [dp, tm] of [[18, 25], [40, 30], [8, 20]] as const) { const p = planDive(dp, tm, 0.21); for (let i = 1; i < p.segs.length; i++) expect(p.segs[i].t0).toBeCloseTo(p.segs[i - 1].t1, 6); expect(p.segs.at(-1)!.d1).toBe(0) } })
})
