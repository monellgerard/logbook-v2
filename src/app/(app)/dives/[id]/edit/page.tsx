import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DiveForm from '../../dive-form'
export default async function Edit(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { data } = await createClient().from('dives').select('*').eq('id', params.id).maybeSingle()
  if (!data) notFound()
  return <><h1 className="mb-4 text-2xl font-bold text-navy">Editar inmersión nº {data.dive_number}</h1><DiveForm dive={data} /></>
}
