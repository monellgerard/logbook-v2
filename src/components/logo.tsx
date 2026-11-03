// Logo: medallón de cobre con el casco de buzo. Versión oscura (interior negro) y versión clara (interior crema) según el tema.
export default function Logo({ size = 40 }: { size?: number }) {
  const s = size >= 90 ? '' : '-sm', st = { height: size, width: size }
  return <span className="logo inline-flex shrink-0"><img src={`/logo-copper${s}.webp`} alt="LogBook" className="logo-dark" style={st} /><img src={`/logo-light${s}.webp`} alt="" aria-hidden="true" className="logo-light" style={st} /></span>
}
