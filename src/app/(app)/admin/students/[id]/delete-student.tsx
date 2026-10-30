'use client'
import { deleteStudent } from '../actions'
export default function DeleteStudent({ id }: { id: string }) {
  return <button type="button" onClick={() => { if (prompt('Se borrará la cuenta y TODAS sus inmersiones, certificaciones y fotos. No se puede deshacer.\n\nEscribe ELIMINAR para confirmar') === 'ELIMINAR') deleteStudent(id) }} className="rounded-lg border border-red-300 px-4 py-2 text-red-700">Eliminar cuenta definitivamente</button>
}
