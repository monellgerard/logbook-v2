export function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-navy to-deep p-4">
    <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
      <h1 className="text-2xl font-bold text-navy">🤿 LogBook</h1><p className="mb-6 text-sm text-slate-500">{title}</p>{children}
    </div></main>
}
export const Msg = ({ error, ok }: { error?: string; ok?: string }) => error ? <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p> : ok ? <p className="mb-3 rounded bg-teal-50 p-2 text-sm text-teal-800">{ok}</p> : null
