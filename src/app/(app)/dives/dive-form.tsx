
'use client'

import { useState, useEffect, useActionState } from 'react'
import Link from 'next/link'
import { saveDive } from './actions'
import { OPT } from '@/lib/dive-schema'

type D = Record<string, any>

const Sec = ({
  t,
  subtitle,
  number,
  children,
}: {
  t: string
  subtitle: string
  number: string
  children: React.ReactNode
}) => (
  <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] backdrop-blur-xl">
    <div className="flex items-start gap-4 border-b border-[var(--line)] px-5 py-5 sm:px-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-sm font-bold text-[var(--accent-strong)]">
        {number}
      </div>
      <div className="min-w-0">
        <h2 className="font-semibold tracking-tight text-[var(--title)]">
          {t}
        </h2>
        <p className="mt-1 text-xs text-[var(--muted)]">{subtitle}</p>
      </div>
    </div>
    <div className="fit-grid grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
      {children}
    </div>
  </section>
)

const F = ({
  l,
  children,
  wide,
}: {
  l: string
  children: React.ReactNode
  wide?: boolean
}) => (
  <label className={`block min-w-0 text-sm ${wide ? 'fit-wide sm:col-span-2' : ''}`}>
    <span className="mb-2 block font-medium text-[var(--fg)]">{l}</span>
    {children}
  </label>
)

export default function DiveForm({ dive }: { dive?: D }) {
  const [state, action, pending] = useActionState(
    saveDive.bind(null, dive?.id ?? null),
    {} as { error?: string }
  )

  const [dirty, setDirty] = useState(false)

  const [tm, setTm] = useState(dive?.tank_material ?? '')
  const [tc, setTc] = useState(dive?.tank_capacity_l ?? '')
  const [gm, setGm] = useState(dive?.gas_mix ?? '')

  const [p1, setP1] = useState(dive?.pressure_start_bar ?? '')
  const [p2, setP2] = useState(dive?.pressure_end_bar ?? '')
  const [rating, setRating] = useState<number | null>(dive?.rating ?? null)

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault()
    }

    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  const v = (k: string) => dive?.[k] ?? ''

  const sel = (
    k: string,
    val: string,
    set?: (s: string) => void
  ) => (
    <select
      name={k}
      defaultValue={val}
      onChange={(e) => set?.(e.target.value)}
      className="input"
    >
      <option value="">Seleccionar...</option>
      {OPT[k as keyof typeof OPT].map(([a, b]) => (
        <option key={a} value={a}>{b}</option>
      ))}
    </select>
  )

  const otro = (k: string, show: boolean) =>
    show && (
      <F l="Especificar" wide>
        <input
          name={k}
          defaultValue={v(k)}
          placeholder="Escribe aquí..."
          className="input"
        />
      </F>
    )

  return (
    <form
      action={action}
      onChange={() => setDirty(true)}
      onSubmit={() => setDirty(false)}
      className="w-full space-y-5 pb-8"
    >
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              Registro de actividad
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-[var(--title)]">
              Datos de la inmersión
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Completa los datos de tu inmersión. Los campos con * son obligatorios.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            Nuevo registro
          </div>
        </div>
      </div>

      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
        >
          <p className="font-semibold">No se ha podido guardar la inmersión</p>
          <p className="mt-1">{state.error}</p>
        </div>
      )}

      <Sec
        number="01"
        t="Datos generales"
        subtitle="Información principal de la inmersión"
      >
        <F l="Nº de inmersión (vacío = automático)">
          <input
            name="dive_number"
            type="number"
            min={1}
            placeholder="Automático"
            defaultValue={v('dive_number')}
            className="input"
          />
        </F>

        <F l="Lugar *">
          <input
            name="site"
            required
            placeholder="Ej. Cala Montjoi"
            defaultValue={v('site')}
            className="input"
          />
        </F>

        <F l="Fecha *">
          <input
            name="dive_date"
            type="date"
            required
            defaultValue={v('dive_date') || new Date().toISOString().slice(0, 10)}
            className="input"
          />
        </F>

        <F l="Hora de inicio">
          <input
            name="start_time"
            type="time"
            defaultValue={String(v('start_time')).slice(0, 5)}
            className="input"
          />
        </F>

        <F l="Profundidad máxima (m) *">
          <input
            name="max_depth_m"
            type="number"
            step="0.1"
            min={0}
            required
            placeholder="Ej. 18.5"
            defaultValue={v('max_depth_m')}
            className="input"
          />
        </F>

        <F l="Tiempo de inmersión (min) *">
          <input
            name="duration_min"
            type="number"
            min={1}
            required
            placeholder="Ej. 45"
            defaultValue={v('duration_min')}
            className="input"
          />
        </F>
      </Sec>

      <Sec
        number="02"
        t="Condiciones ambientales"
        subtitle="Características del entorno y del agua"
      >
        <F l="Temperatura del agua (°C)">
          <input
            name="water_temp_c"
            type="number"
            step="0.1"
            placeholder="Ej. 16.5"
            defaultValue={v('water_temp_c')}
            className="input"
          />
        </F>

        <F l="Visibilidad">{sel('visibility', v('visibility'))}</F>
        <F l="Oleaje">{sel('swell', v('swell'))}</F>
        <F l="Corriente">{sel('current', v('current'))}</F>
      </Sec>

      <Sec
        number="03"
        t="Equipamiento"
        subtitle="Material y configuración utilizada"
      >
        <F l="Traje">{sel('suit_type', v('suit_type'))}</F>

        <F l="Lastre (kg)">
          <input
            name="weight_kg"
            type="number"
            step="0.5"
            min={0}
            placeholder="Ej. 6"
            defaultValue={v('weight_kg')}
            className="input"
          />
        </F>

        <F l="Material de la botella">
          {sel('tank_material', tm, setTm)}
        </F>
        {otro('tank_material_other', tm === 'otros')}

        <F l="Capacidad de la botella">
          {sel('tank_capacity_l', tc, setTc)}
        </F>
        {otro('tank_capacity_other', tc === 'otros')}

        <F l="Mezcla / sistema respiratorio">
          {sel('gas_mix', gm, setGm)}
        </F>
        {otro('gas_mix_other', gm === 'otros')}
      </Sec>

      <Sec
        number="04"
        t="Control de presiones"
        subtitle="Presión de botella al inicio y al finalizar"
      >
        <F l="Presión inicial (bar)">
          <input
            name="pressure_start_bar"
            type="number"
            min={0}
            placeholder="Ej. 200"
            value={p1}
            onChange={(e) => setP1(e.target.value)}
            className="input"
          />
        </F>

        <F l="Presión final (bar)">
          <input
            name="pressure_end_bar"
            type="number"
            min={0}
            placeholder="Ej. 50"
            value={p2}
            onChange={(e) => setP2(e.target.value)}
            className="input"
          />
        </F>

        {p1 !== '' && p2 !== '' && Number(p2) > Number(p1) && (
          <p className="fit-wide rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200 sm:col-span-2">
            ⚠ La presión final es mayor que la inicial. Revisa los datos. Puedes guardar igualmente.
          </p>
        )}

        {p1 !== '' && p2 !== '' && Number(p1) >= Number(p2) && (
          <div className="fit-wide rounded-xl border border-[var(--line)] bg-[var(--tint)] p-3 sm:col-span-2">
            <p className="text-xs text-[var(--muted)]">Consumo de presión</p>
            <p className="mt-1 text-lg font-bold text-[var(--title)]">
              {Number(p1) - Number(p2)} bar
            </p>
          </div>
        )}
      </Sec>

      <Sec
        number="05"
        t="Equipo y trabajo"
        subtitle="Personal, tareas e incidencias"
      >
        <F l="Jefe de equipo">
          <input
            name="team_leader"
            placeholder="Nombre del responsable"
            defaultValue={v('team_leader')}
            className="input"
          />
        </F>

        <F l="Pareja de inmersión">
          <input
            name="buddy"
            placeholder="Nombre del compañero"
            defaultValue={v('buddy')}
            className="input"
          />
        </F>

        {[
          ['work_task', 'Trabajo a realizar', 'Describe las tareas realizadas...'],
          ['incidents', 'Incidencias', 'Registra cualquier incidencia...'],
          ['tools', 'Herramientas utilizadas', 'Material y herramientas empleadas...'],
        ].map(([k, l, placeholder]) => (
          <F key={k} l={l} wide>
            <textarea
              name={k}
              rows={3}
              placeholder={placeholder}
              defaultValue={v(k)}
              className="input min-h-24 resize-y"
            />
          </F>
        ))}
      </Sec>

      <Sec
        number="06"
        t="Valoración personal"
        subtitle="Puntúa la experiencia de esta inmersión"
      >
        <div className="fit-wide sm:col-span-2">
          <input type="hidden" name="rating" value={rating ?? ''} />

          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => {
                  setRating(rating === n ? null : n)
                  setDirty(true)
                }}
                aria-pressed={rating === n}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-semibold transition-all ${
                  rating !== null && n <= rating
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--primary-fg)] shadow-md'
                    : 'border-[var(--line)] bg-[var(--input)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--title)]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs text-[var(--muted)]">
            {rating === null
              ? 'Selecciona una puntuación del 1 al 10. Es opcional.'
              : `Valoración seleccionada: ${rating}/10. Pulsa de nuevo para quitarla.`}
          </p>
        </div>
      </Sec>

      <div className="sticky bottom-3 z-10 rounded-2xl border border-[var(--line)] bg-[var(--card-solid)]/90 p-3 shadow-xl backdrop-blur-xl sm:p-4">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dives"
            onClick={(e) => {
              if (dirty && !confirm('Hay cambios sin guardar. ¿Salir sin guardar?')) {
                e.preventDefault()
              }
            }}
            className="inline-flex items-center justify-center rounded-xl border border-[var(--line)] px-5 py-3 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--tint)]"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={pending}
            className="btn inline-flex items-center justify-center gap-2 px-6 py-3 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Guardando inmersión...' : 'Guardar inmersión'}
            {!pending && <span aria-hidden="true">→</span>}
          </button>
        </div>
      </div>
    </form>
  )
}
