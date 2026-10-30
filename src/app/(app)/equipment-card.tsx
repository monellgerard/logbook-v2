import Icon from '@/components/icon'
import Link from 'next/link'
import { addItem, toggleItem, deleteItem, addDefaults, resetChecks } from './equipment/actions'
type Item = { id: string; name: string; checked: boolean }
export default function EquipmentCard({ items, error, message, detail, showLink }: { items: Item[]; error?: boolean; message?: string; detail?: string; showLink?: boolean }) {
  const done = items.filter((i) => i.checked).length, pct = items.length ? Math.round((done / items.length) * 100) : 0
  return <section id="material" className="scroll-mt-20 rounded-2xl bg-white p-5 shadow-sm">
    <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-deep">Checklist de material</h2><div className="flex items-center gap-3">{items.length > 0 && <span className="text-sm text-slate-500">{done}/{items.length} listo</span>}{showLink && <Link href="/equipment" className="text-sm text-teal-dark">Abrir →</Link>}</div></div>
    {message && <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{message}</p>}
    {error ? <p className="rounded bg-amber-50 p-2 text-sm text-amber-800">El checklist aún no está activado: falta ejecutar la migración 0004 en Supabase.{detail ? <span className="mt-1 block text-xs">Detalle: {detail}</span> : null}</p> : <>
      {items.length > 0 && <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-teal transition-all" style={{ width: `${pct}%` }} /></div>}
      {items.length === 0 ? <div className="mb-3 text-sm text-slate-500"><p className="mb-2">Aún no tienes material en tu lista. Añade el tuyo o empieza con una lista básica y edítala a tu gusto.</p><form action={addDefaults}><button className="btn">Cargar lista básica</button></form></div> :
        <ul className="mb-3 max-h-72 space-y-1 overflow-y-auto pr-1">{items.map((i) => <li key={i.id} className="flex items-center gap-2">
          <form action={toggleItem} className="flex-1"><input type="hidden" name="id" value={i.id} /><input type="hidden" name="checked" value={String(i.checked)} />
            <button className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm row-hover" aria-pressed={i.checked}><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${i.checked ? 'border-teal bg-teal text-white' : 'border-slate-300'}`}>{i.checked && <Icon name="check" className="h-3.5 w-3.5" />}</span><span className={i.checked ? 'text-slate-500 line-through' : ''}>{i.name}</span></button></form>
          <form action={deleteItem}><input type="hidden" name="id" value={i.id} /><button className="rounded px-2 text-slate-500 hover:text-red-600" aria-label={`Quitar ${i.name}`}>×</button></form></li>)}</ul>}
      <form action={addItem} className="flex gap-2"><input name="name" maxLength={80} required placeholder="Añadir material…" className="input" /><button className="btn">Añadir</button></form>
      {items.length > 0 && <form action={resetChecks} className="mt-2"><button className="text-xs text-teal-dark underline">Desmarcar todo (nueva inmersión)</button></form>}</>}</section>
}
