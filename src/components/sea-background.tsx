import PointerGlow from './pointer-glow'
// Fondo fluido: fotografía desenfocada (día o noche) + manchas de color que fluyen + resplandor que sigue al cursor.
export default function SeaBackground() {
  return <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden"><div className="bg-photo" /><div className="blob b1" /><div className="blob b2" /><div className="blob b3" /><PointerGlow /></div>
}
