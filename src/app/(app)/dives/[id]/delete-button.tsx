'use client'
import { deleteDive } from '../actions'
export default function DeleteButton({ id }: { id: string }) {
  return <button onClick={() => { if (confirm('¿Eliminar esta inmersión? No se puede deshacer.')) deleteDive(id) }} className="rounded-lg border border-red-300 px-4 py-2 text-red-700">Eliminar</button>
}
