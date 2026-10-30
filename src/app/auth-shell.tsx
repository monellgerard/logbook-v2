import Logo from '@/components/logo'
import ThemeToggle from '@/components/theme-toggle'
import LoginScene from '@/components/login-scene'
export function Shell({ title, hero = false, children }: { title?: string; hero?: boolean; children: React.ReactNode }) {
  return <main className="relative min-h-screen">
    <LoginScene />
    <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 md:p-6"><div className="flex items-center gap-3"><Logo size={46} /><span className="eyebrow hud-light">LogBook · Acceso</span></div><ThemeToggle bare className="pill" labelClass="hidden sm:inline" /></header>
    {hero
      ? <><h1 className="sr-only">Bienvenido a tu LogBook</h1><div className="absolute inset-x-0 bottom-[5vh] z-10 mx-auto w-[min(94vw,880px)]"><div className="glass hud-in p-4 md:p-5">{children}</div></div></>
      : <div className="grid min-h-screen place-items-center p-6 pt-24"><section className="glass hud-in relative z-10 w-full max-w-md p-6"><h1 className="display mb-5 !text-2xl">{title}</h1>{children}</section></div>}
  </main>
}
export const Msg = ({ error, ok }: { error?: string; ok?: string }) => error ? <p className="mb-3 bg-red-50 p-3 text-sm text-red-700">{error}</p> : ok ? <p className="mb-3 bg-teal-50 p-3 text-sm text-teal-800">{ok}</p> : null
