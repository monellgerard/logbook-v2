import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyFilters, fetchAll, type P } from '@/lib/filters'
import { OPT } from '@/lib/dive-schema'
const lab = (k: keyof typeof OPT, v: string | null) => (OPT[k] as readonly (readonly string[])[]).find((o) => o[0] === v)?.[1] ?? v
const ST: Record<string, string> = { pending: 'Pendiente', reviewed: 'Revisada', needs_correction: 'Necesita corrección' }
const COLS: [string, (r: any) => unknown][] = [['Alumno', (r) => r.profiles?.full_name], ['Nº', (r) => r.dive_number], ['Fecha', (r) => r.dive_date], ['Hora', (r) => r.start_time?.slice(0, 5)], ['Lugar', (r) => r.site],
  ['Profundidad (m)', (r) => r.max_depth_m], ['Tiempo (min)', (r) => r.duration_min], ['Temp. agua (°C)', (r) => r.water_temp_c], ['Visibilidad', (r) => lab('visibility', r.visibility)], ['Oleaje', (r) => lab('swell', r.swell)],
  ['Corriente', (r) => lab('current', r.current)], ['Traje', (r) => lab('suit_type', r.suit_type)], ['Lastre (kg)', (r) => r.weight_kg],
  ['Material botella', (r) => (r.tank_material === 'otros' ? `Otros: ${r.tank_material_other ?? ''}` : lab('tank_material', r.tank_material))],
  ['Capacidad botella', (r) => (r.tank_capacity_l === 'otros' ? `Otros: ${r.tank_capacity_other ?? ''}` : lab('tank_capacity_l', r.tank_capacity_l))],
  ['Mezcla', (r) => (r.gas_mix === 'otros' ? `Otros: ${r.gas_mix_other ?? ''}` : lab('gas_mix', r.gas_mix))], ['Presión inicial (bar)', (r) => r.pressure_start_bar], ['Presión final (bar)', (r) => r.pressure_end_bar],
  ['Jefe de equipo', (r) => r.team_leader], ['Pareja', (r) => r.buddy], ['Trabajo', (r) => r.work_task], ['Incidencias', (r) => r.incidents], ['Herramientas', (r) => r.tools], ['Valoración', (r) => r.rating], ['Revisión', (r) => ST[r.review_status]]]
// Escapa comillas/saltos y neutraliza fórmulas (=, +, -, @) en texto para evitar inyección en Excel
const cell = (v: unknown) => { if (v == null) return ''; let s = String(v); if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
export async function GET(req: NextRequest) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return new NextResponse('No autenticado', { status: 401 })
  const { data: me } = await sb.from('profiles').select('role').eq('id', user.id).single()
  const sp = Object.fromEntries(req.nextUrl.searchParams) as P & { scope?: string; student?: string }
  const cls = sp.scope === 'class'
  if (cls && me?.role !== 'admin') return new NextResponse('No autorizado', { status: 403 })
  const rows = await fetchAll(() => {
    let q = sb.from('dives').select('*, profiles!dives_user_id_fkey!inner(full_name, role)')
    q = cls ? (sp.student ? q.eq('user_id', sp.student) : q).eq('profiles.role', 'student') : q.eq('user_id', user.id)
    return applyFilters(q, sp).order('dive_date').order('id')
  })
  const labels: Record<string, string> = { year: 'Año', month: 'Mes', from: 'Desde', to: 'Hasta', site: 'Lugar', work: 'Trabajo', gas_mix: 'Gas', min_depth: 'Prof. mín', max_depth: 'Prof. máx', min_rating: 'Valoración mín' }
  const period = Object.entries(labels).filter(([k]) => (sp as any)[k]).map(([k, l]) => `${l}: ${(sp as any)[k]}`).join(' | ') || 'Todo el historial'
  const lines = [`LogBook;Exportación ${cls ? 'de la clase' : 'personal'};Generada el ${new Date().toISOString().slice(0, 10)}`, `Periodo consultado;${period}`, `Inmersiones;${rows.length}`, '', COLS.map(([h]) => h).join(';'),
    ...rows.map((r) => COLS.map(([, f]) => cell(f(r))).join(';'))]
  return new NextResponse('\uFEFF' + lines.join('\r\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="logbook-${cls ? 'clase' : 'mis-inmersiones'}-${new Date().toISOString().slice(0, 10)}.csv"` } })
}
