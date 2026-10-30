import './globals.css'
import { Inter, Chakra_Petch, Share_Tech_Mono, Silkscreen } from 'next/font/google'
import SeaBackground from '@/components/sea-background'
const inter = Inter({ subsets: ['latin'], display: 'swap' })
const chakra = Chakra_Petch({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-chakra', display: 'swap' })
const mono = Share_Tech_Mono({ subsets: ['latin'], weight: '400', variable: '--font-mono', display: 'swap' })
const pixel = Silkscreen({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-pixel', display: 'swap' })
export const metadata = { title: 'LogBook · Libro de inmersiones' }
// Aplica el tema antes de pintar (evita parpadeos). Por defecto: oscuro (noche).
const themeScript = `try{if(localStorage.getItem('theme')!=='light')document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}`
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="es" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
    <body className={`${inter.className} ${chakra.variable} ${mono.variable} ${pixel.variable}`}><SeaBackground />{children}</body></html>
}
