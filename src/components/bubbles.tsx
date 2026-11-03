// Burbujas translúcidas que suben despacio (decoración de la pantalla de acceso).
const B = Array.from({ length: 16 }, (_, i) => ({ left: (i * 53 + 7) % 96, size: 8 + ((i * 11) % 30), dur: 14 + ((i * 7) % 14), delay: -((i * 3.1) % 24) }))
export default function Bubbles() {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">{B.map((b, i) => <span key={i} className="bubble2" style={{ left: `${b.left}%`, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }} />)}</div>
}
