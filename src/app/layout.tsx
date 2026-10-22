import './globals.css'
export const metadata = { title: 'LogBook · Libro de inmersiones' }
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}</body></html>
}
