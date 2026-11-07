
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DiveForm from '../../dive-form'

export default async function Edit(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params

  const { data } = await createClient()
    .from('dives')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (!data) notFound()

  return (
    <div className="w-full space-y-5">
      <Link
        href={`/dives/${data.id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent-strong)] transition hover:gap-3"
      >
        <span>←</span>
        Volver al detalle de la inmersión
      </Link>

      <section className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--accent-strong)]">
            <span>✎</span>
            Modificar registro
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--title)] sm:text-4xl">
            Editar inmersión #{data.dive_number}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            Actualiza los datos técnicos, las condiciones ambientales y la
            información operativa de esta inmersión.
          </p>
        </div>
      </section>

      <DiveForm dive={data} />
    </div>
  )
}
