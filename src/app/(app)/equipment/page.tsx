import { createClient } from '@/lib/supabase/server'
import EquipmentCard from '../equipment-card'
export default async function EquipmentPage(props: { searchParams: Promise<{ error?: string }> }) {
  const sp = await props.searchParams
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  const eq = await sb.from('equipment_items').select('id, name, checked').eq('user_id', user!.id).order('created_at')
  return <div className="mx-auto max-w-2xl"><h1 className="mb-1 text-2xl font-bold text-navy">Mi material</h1>
    <p className="mb-4 text-sm text-slate-500">Prepara tu equipo antes de cada inmersión. Esta lista es privada: solo la ves tú.</p>
    <EquipmentCard items={eq.data ?? []} error={!!eq.error} message={sp.error} detail={eq.error?.message} /></div>
}
