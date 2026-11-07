export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <span className="logo inline-flex shrink-0">
      <img
        src="/logo.webp"
        alt="LogBook"
        className="logo-mark"
        style={{
          height: size,
          width: size,
          objectFit: 'contain',
        }}
      />
    </span>
  )
}
