import Logo from '@/components/logo'
import ThemeToggle from '@/components/theme-toggle'
import Bubbles from '@/components/bubbles'
// Pantalla de acceso: fotografía a toda pantalla con degradado, titular grande y formulario en cristal esmerilado.
export function Shell({ title, hero = false, children }: { title?: string; hero?: boolean; children: React.ReactNode }) {
  return <main className="login relative min-h-screen overflow-hidden">
    <div className="login-photo" /><div className="login-shade" /><div className="login-sweep" /><Bubbles />
    <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12"><div className="flex items-center gap-3"><Logo size={46} /><span className="text-xl font-extrabold tracking-tight">LogBook</span></div><ThemeToggle bare className="pill" labelClass="hidden sm:inline" /></header>
    <div className="relative z-10 mx-auto grid min-h-[calc(100vh-92px)] max-w-7xl items-center px-6 pb-14 md:px-12 lg:grid-cols-[minmax(0,32rem)_1fr]">
      <section>
        {hero ? <h1 className="hero-title rise"><span className="block">Bienvenido a tu</span><span className="grad block">LogBook</span></h1> : <h1 className="hero-title rise !text-4xl md:!text-5xl">{title}</h1>}
        <div className="glass-card rise-2 mt-8 p-5 md:p-6">{children}</div></section></div></main>
}
export const Msg = ({ error, ok }: { error?: string; ok?: string }) => error ? <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : ok ? <p className="mb-3 rounded-xl bg-teal-50 p-3 text-sm text-teal-800">{ok}</p> : null
