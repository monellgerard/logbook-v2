// Logo: medallón de cobre con el casco de buzo.
export default function Logo({ size = 40 }: { size?: number }) {
  return <img src={size >= 90 ? '/logo-copper.webp' : '/logo-copper-sm.webp'} alt="LogBook" className="shrink-0 object-contain" style={{ height: size, width: size }} />
}
