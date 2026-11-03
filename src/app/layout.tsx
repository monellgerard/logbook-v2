
import './globals.css'
import SeaBackground from '@/components/sea-background'

export const metadata = {
  title: 'LogBook · Libro de inmersiones',
}

// Aplica el tema antes de pintar.
const themeScript = `try{if(localStorage.getItem('theme')!=='light')document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}`

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
        <SeaBackground />
        {children}
      </body>
    </html>
  )
}
