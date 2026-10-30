import WaterCanvas from './water-canvas'
// Escena animada de la pantalla de acceso: agua interactiva + rayos de luz, reflejos y burbujas que suben.
const BUBBLES = Array.from({ length: 22 }, (_, i) => ({ left: (i * 47 + 9) % 96, size: 8 + ((i * 13) % 34), dur: 12 + ((i * 7) % 14), delay: -((i * 2.9) % 24) }))
const RAYS = [{ l: 6, w: 16, d: 16, s: -2 }, { l: 28, w: 12, d: 21, s: -8 }, { l: 52, w: 17, d: 18, s: -5 }, { l: 76, w: 13, d: 23, s: -11 }]
export default function LoginScene() {
  return <>
    <WaterCanvas src="/login-bg.jpg" />
    <div aria-hidden="true" className="scene-fx">
      {RAYS.map((r, i) => <div key={i} className="ray2" style={{ left: `${r.l}%`, width: `${r.w}vw`, animationDuration: `${r.d}s`, animationDelay: `${r.s}s` }} />)}
      <div className="caus caus-a" /><div className="caus caus-b" />
      {BUBBLES.map((b, i) => <span key={i} className="bubble2" style={{ left: `${b.left}%`, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }} />)}
    </div></>
}
