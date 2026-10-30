'use client'
import { useActionState, useState } from 'react'
import { createInvitation } from './actions'
export default function NewInvite() {
  const [s, action, pending] = useActionState(createInvitation, {} as { link?: string; error?: string })
  const [copied, setCopied] = useState(false)
  return <section className="mb-6 max-w-2xl rounded-xl bg-white p-4 shadow-sm"><h2 className="mb-2 font-semibold">Crear enlace de registro</h2>
    <form action={action} className="grid gap-2 sm:grid-cols-4"><input name="note" placeholder="Nota (p. ej. Clase 2026)" className="input sm:col-span-2" />
      <label className="text-xs text-slate-500">Plazas<input name="max" type="number" min={1} max={500} defaultValue={30} className="input" /></label>
      <label className="text-xs text-slate-500">Caduca en (días, 0 = nunca)<input name="days" type="number" min={0} max={365} defaultValue={14} className="input" /></label>
      <button className="btn sm:col-span-4 sm:w-48" disabled={pending}>{pending ? 'Creando…' : 'Crear enlace'}</button></form>
    {s.error && <p className="mt-3 rounded bg-red-50 p-2 text-sm text-red-700">{s.error}</p>}
    {s.link && <div className="mt-3 rounded bg-teal-50 p-3 text-sm"><p className="mb-1 font-medium">Enlace creado. Cópialo ahora: no se vuelve a mostrar.</p><code className="block break-all">{s.link}</code>
      <button type="button" className="mt-2 rounded-lg border px-3 py-1" onClick={() => { navigator.clipboard.writeText(s.link!); setCopied(true) }}>{copied ? '¡Copiado!' : 'Copiar enlace'}</button></div>}
    <p className="mt-3 text-xs text-slate-500">Quien tenga el enlace puede crear una cuenta hasta agotar las plazas o la fecha. Compártelo solo con tu clase y revócalo cuando ya no haga falta.</p></section>
}
