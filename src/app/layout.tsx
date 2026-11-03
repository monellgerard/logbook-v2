import './globals.css'
import { Plus_Jakarta_Sans } from 'next/font/google'
import SeaBackground from '@/components/sea-background'
const sans = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], display: 'swap' })
export const metadata = { title: 'LogBook · Libro de inmersiones' }
// Aplica el tema antes de pintar (evita parpadeos). Por defecto: oscuro (noche).
const themeScript = `try{if(localStorage.getItem('theme')!=='light')document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}`
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="es" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body className={sans.className}><SeaBackground />{children}</body></html>
}
