// Pruebas contra la base de datos REAL (usa .env.local). Crean usuarios temporales y los borran al terminar.
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { applyFilters } from '../src/lib/filters'
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!, ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, SECRET = process.env.SUPABASE_SECRET_KEY!
const svc = createClient(URL, SECRET, { auth: { persistSession: false } })
const tag = Date.now(), PW = `Test-${tag}-xK9!`
const U: Record<string, { id: string; db: SupabaseClient }> = {}
async function make(name: string, role: 'student' | 'admin') {
  const email = `logbook-test-${name}-${tag}@example.com`
  const { data, error } = await svc.auth.admin.createUser({ email, password: PW, email_confirm: true, user_metadata: { full_name: `Test ${name}` } })
  if (error) throw error
  const id = data.user!.id
  if (role === 'admin') await svc.from('profiles').update({ role: 'admin' }).eq('id', id)
  const db = createClient(URL, ANON, { auth: { persistSession: false } })
  const s = await db.auth.signInWithPassword({ email, password: PW })
  if (s.error) throw s.error
  U[name] = { id, db }
}
const dive = (o = {}) => ({ site: 'Test', dive_date: '2025-06-10', max_depth_m: 10, duration_min: 30, ...o })
let a1: any, a2: any, a3: any, b1: any
beforeAll(async () => {
  await make('alice', 'student'); await make('bob', 'student'); await make('teacher', 'admin')
  const ins = async (n: string, o = {}) => { const { data, error } = await U[n].db.from('dives').insert({ ...dive(o), user_id: U[n].id }).select().single(); if (error) throw error; return data }
  a1 = await ins('alice'); a2 = await ins('alice', { dive_date: '2025-07-05' }); a3 = await ins('alice', { dive_date: '2024-06-20' }); b1 = await ins('bob')
})
afterAll(async () => { for (const u of Object.values(U)) await svc.auth.admin.deleteUser(u.id) })

describe('inmersiones', () => {
  it('numera automáticamente por alumno', () => { expect([a1.dive_number, a2.dive_number, a3.dive_number]).toEqual([1, 2, 3]); expect(b1.dive_number).toBe(1) })
  it('un alumno solo ve las suyas', async () => {
    const { data } = await U.bob.db.from('dives').select('id'); expect(data!.map((d) => d.id)).toEqual([b1.id])
    expect((await U.bob.db.from('dives').select('id').eq('id', a1.id)).data).toHaveLength(0)
  })
  it('no puede crear inmersiones a nombre de otro', async () => { expect((await U.bob.db.from('dives').insert({ ...dive(), user_id: U.alice.id })).error).not.toBeNull() })
  it('no puede modificar ni borrar las de otro', async () => {
    expect((await U.bob.db.from('dives').update({ site: 'hack' }).eq('id', a1.id).select()).data).toHaveLength(0)
    expect((await U.bob.db.from('dives').delete().eq('id', a1.id).select()).data).toHaveLength(0)
    expect((await svc.from('dives').select('site').eq('id', a1.id).single()).data!.site).toBe('Test')
  })
  it('sin sesión no se lee nada', async () => { const { data } = await createClient(URL, ANON).from('dives').select('id'); expect(data ?? []).toHaveLength(0) })
})
describe('perfiles y roles', () => {
  it('un alumno no ve el perfil de otro', async () => { expect((await U.alice.db.from('profiles').select('id').eq('id', U.bob.id)).data).toHaveLength(0) })
  it('no puede convertirse en administrador', async () => {
    expect((await U.alice.db.from('profiles').update({ role: 'admin' }).eq('id', U.alice.id)).error).not.toBeNull()
    expect((await svc.from('profiles').select('role').eq('id', U.alice.id).single()).data!.role).toBe('student')
  })
  it('no puede asignarse una foto aprobada', async () => { expect((await U.alice.db.from('profiles').update({ avatar_path: 'x/y.jpg' }).eq('id', U.alice.id)).error).not.toBeNull() })
})
describe('profesor y revisión', () => {
  it('el profesor lee las inmersiones de todos', async () => {
    const ids = (await U.teacher.db.from('dives').select('user_id').in('user_id', [U.alice.id, U.bob.id])).data!.map((d) => d.user_id)
    expect(ids).toContain(U.alice.id); expect(ids).toContain(U.bob.id)
  })
  it('el profesor no puede modificar datos del alumno', async () => {
    expect((await U.teacher.db.from('dives').update({ site: 'cambiado' }).eq('id', a1.id).select()).data).toHaveLength(0)
    expect((await svc.from('dives').select('site').eq('id', a1.id).single()).data!.site).toBe('Test')
  })
  it('un alumno no puede revisarse a sí mismo', async () => { expect((await U.alice.db.from('dive_reviews').insert({ dive_id: a1.id, reviewer_id: U.alice.id, status: 'reviewed' })).error).not.toBeNull() })
  it('flujo completo: comentario → edición del alumno → vuelve a pendiente y marcada', async () => {
    expect((await U.teacher.db.from('dive_reviews').insert({ dive_id: a1.id, reviewer_id: U.teacher.id, status: 'needs_correction', comment: 'Revisa la profundidad' })).error).toBeNull()
    expect((await svc.from('dives').select('review_status').eq('id', a1.id).single()).data!.review_status).toBe('needs_correction')
    expect((await U.alice.db.from('dive_reviews').select('comment').eq('dive_id', a1.id)).data![0].comment).toBe('Revisa la profundidad')
    expect((await U.bob.db.from('dive_reviews').select('id').eq('dive_id', a1.id)).data).toHaveLength(0)
    await U.alice.db.from('dives').update({ max_depth_m: 12 }).eq('id', a1.id)
    const d = (await svc.from('dives').select('review_status, modified_since_review').eq('id', a1.id).single()).data!
    expect(d).toEqual({ review_status: 'pending', modified_since_review: true })
  })
  it('un alumno no puede falsear el estado de revisión', async () => {
    await U.alice.db.from('dives').update({ review_status: 'reviewed' }).eq('id', a2.id)
    expect((await svc.from('dives').select('review_status').eq('id', a2.id).single()).data!.review_status).toBe('pending')
  })
})
describe('filtros por año y mes', () => {
  const run = async (p: Record<string, string>) => (await applyFilters(U.alice.db.from('dives').select('id').eq('user_id', U.alice.id), p)).data!.map((d: any) => d.id)
  it('año + mes: solo junio de 2025', async () => { expect(await run({ year: '2025', month: '6' })).toEqual([a1.id]) })
  it('solo año: todo 2025', async () => { expect((await run({ year: '2025' })).sort()).toEqual([a1.id, a2.id].sort()) })
  it('intervalo de fechas', async () => { expect(await run({ from: '2024-01-01', to: '2024-12-31' })).toEqual([a3.id]) })
})
