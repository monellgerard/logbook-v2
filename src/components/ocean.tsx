// Fondo «señal»: resplandor tenue, grano de película, líneas de onda que fluyen y etiquetas de profundidad flotantes.
const TAGS: [string, number, number, number][] = [['10 m', 8, 22, 11], ['18 m', 74, 14, 13], ['30 m · 12 min', 82, 50, 15], ['5 m · parada', 10, 60, 12], ['EAN 32', 44, 34, 14], ['40 m', 58, 72, 10]]
const wave = (y: number, a: number) => `M0 ${y}Q200 ${y - a} 400 ${y}` + [800, 1200, 1600, 2000, 2400, 2800, 3200].map((x) => `T${x} ${y}`).join('')
export function OceanScene() {
  return <div aria-hidden="true" className="backdrop pointer-events-none absolute inset-0 overflow-hidden">
    <div className="bd-glow" /><div className="bd-grain" />
    {TAGS.map(([t, l, tp, d], i) => <span key={t} className={`bd-tag ${i > 2 ? 'bd-tag-lg' : ''}`} style={{ left: `${l}%`, top: `${tp}%`, animationDuration: `${d}s`, animationDelay: `${-i * 2.3}s` }}>{t}</span>)}
    {[[110, 46, 52, 30, .5], [120, 30, 70, 44, .35], [100, 62, 90, 62, .25]].map(([y, a, b, dur, op], i) => <svg key={i} className="bd-wave" viewBox="0 0 3200 220" preserveAspectRatio="none" style={{ bottom: -b + 30, animationDuration: `${dur}s`, opacity: op, animationDirection: i === 1 ? 'reverse' : 'normal' }}><path d={wave(y, a)} fill="none" stroke="currentColor" strokeWidth="1.1" vectorEffect="non-scaling-stroke" /></svg>)}
  </div>
}
