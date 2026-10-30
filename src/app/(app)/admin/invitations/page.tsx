import { requireAdmin } from '@/lib/admin'
import { Msg } from '../../../auth-shell'
import NewInvite from './new-invite'
import { revokeInvitation } from './actions'
export default async function Invitations(props: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await props.searchParams
  const { sb } = await requireAdmin()
  const { data } = await sb.from('invitations').select('id, note, uses, max_uses, expires_at, active, created_at').order('created_at', { ascending: false })
  const state = (i: any) => !i.active ? 'Revocado' : i.expires_at && new Date(i.expires_at) < new Date() ? 'Caducado' : i.uses >= i.max_uses ? 'Agotado' : 'Activo'
  return <><h1 className="mb-4 text-2xl font-bold text-navy">Enlaces de registro</h1><Msg error={sp.error} ok={sp.ok} /><NewInvite />
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-slate-100"><tr><th className="p-3">Nota</th><th>Usos</th><th>Caduca</th><th>Estado</th><th /></tr></thead>
      <tbody>{data?.map((i) => <tr key={i.id} className="border-t"><td className="p-3">{i.note || '—'}</td><td>{i.uses} / {i.max_uses}</td><td>{i.expires_at ? new Date(i.expires_at).toLocaleDateString('es-ES') : 'Nunca'}</td><td>{state(i)}</td>
        <td>{state(i) === 'Activo' && <form action={revokeInvitation}><input type="hidden" name="id" value={i.id} /><button className="text-red-700">Revocar</button></form>}</td></tr>)}</tbody></table>
      {!data?.length && <p className="p-4 text-slate-500">Aún no has creado ningún enlace.</p>}</div></>
}
