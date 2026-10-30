// Curvas de nivel batimétricas (estilo carta náutica): fondo marino sobrio generado con trigonometría, sin imágenes.
export default function Contours({ cx, cy, rings = 14, step = 38, base = 30, seed = 1 }: { cx: number; cy: number; rings?: number; step?: number; base?: number; seed?: number }) {
  return <>{Array.from({ length: rings }, (_, k) => {
    const R = base + k * step, pts: string[] = []
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * Math.PI * 2
      const r = R * (1 + 0.12 * Math.sin(2 * a + seed) + 0.07 * Math.sin(3 * a + seed * 2.1 + k * 0.15) + 0.04 * Math.sin(5 * a + seed * 3.3))
      pts.push(`${i ? 'L' : 'M'}${(cx + r * Math.cos(a) * 1.25).toFixed(1)} ${(cy + r * Math.sin(a) * 0.85).toFixed(1)}`)
    }
    return <path key={k} d={pts.join('') + 'Z'} strokeWidth={k % 5 === 0 ? 1.8 : 1} />
  })}</>
}
