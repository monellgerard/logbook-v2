
'use client'

import { useState, useEffect, useActionState } from 'react'
import Link from 'next/link'
import { saveDive } from './actions'
import { OPT, OPT_LABELS } from '@/lib/dive-schema'

type D = Record<string, any>
type Language = 'ca' | 'es' | 'en'

const translations = {
  ca: {
    activity: 'Registre d’activitat',
    title: 'Dades de la immersió',
    description: 'Completa les dades de la teva immersió. Els camps amb * són obligatoris.',
    newRecord: 'Registre nou',
    saveError: 'No s’ha pogut desar la immersió',
    select: 'Selecciona...',
    specify: 'Especificar',
    writeHere: 'Escriu aquí...',
    sections: [
      ['Dades generals', 'Informació principal de la immersió'],
      ['Condicions ambientals', 'Característiques de l’entorn i de l’aigua'],
      ['Equipament', 'Material i configuració utilitzada'],
      ['Control de pressions', 'Pressió de l’ampolla a l’inici i al final'],
      ['Equip i feina', 'Personal, tasques i incidències'],
      ['Valoració personal', 'Puntua l’experiència d’aquesta immersió'],
    ],
    fields: {
      dive_number: 'Núm. d’immersió (buit = automàtic)',
      site: 'Lloc *',
      date: 'Data *',
      start_time: 'Hora d’inici',
      max_depth_m: 'Profunditat màxima (m) *',
      duration_min: 'Temps d’immersió (min) *',
      water_temp_c: 'Temperatura de l’aigua (°C)',
      visibility: 'Visibilitat',
      swell: 'Onatge',
      current: 'Corrent',
      suit_type: 'Vestit',
      weight_kg: 'Llast (kg)',
      tank_material: 'Material de l’ampolla',
      tank_capacity_l: 'Capacitat de l’ampolla',
      gas_mix: 'Barreja / sistema respiratori',
      pressure_start_bar: 'Pressió inicial (bar)',
      pressure_end_bar: 'Pressió final (bar)',
      team_leader: 'Cap d’equip',
      buddy: 'Company/a d’immersió',
      work_task: 'Feina que cal fer',
      incidents: 'Incidències',
      tools: 'Eines utilitzades',
    },
    placeholders: {
      site: 'Ex. Cala Montjoi',
      automatic: 'Automàtic',
      depth: 'Ex. 18.5',
      duration: 'Ex. 45',
      temperature: 'Ex. 16.5',
      weight: 'Ex. 6',
      pressure: 'Ex. 200',
      pressureEnd: 'Ex. 50',
      leader: 'Nom del responsable',
      buddy: 'Nom del company',
      work_task: 'Descriu les tasques realitzades...',
      incidents: 'Registra qualsevol incidència...',
      tools: 'Material i eines utilitzades...',
    },
    pressureWarning: 'La pressió final és superior a la inicial. Revisa les dades. Pots desar-les igualment.',
    pressureConsumption: 'Consum de pressió',
    ratingSelect: 'Selecciona una puntuació de l’1 al 10. És opcional.',
    ratingChosen: 'Valoració seleccionada',
    ratingRemove: 'Prem de nou per eliminar-la.',
    unsaved: 'Hi ha canvis sense desar. Vols sortir sense desar?',
    cancel: 'Cancel·lar',
    saving: 'Desant la immersió...',
    save: 'Desar la immersió',
  },
  es: {
    activity: 'Registro de actividad',
    title: 'Datos de la inmersión',
    description: 'Completa los datos de tu inmersión. Los campos con * son obligatorios.',
    newRecord: 'Nuevo registro',
    saveError: 'No se ha podido guardar la inmersión',
    select: 'Seleccionar...',
    specify: 'Especificar',
    writeHere: 'Escribe aquí...',
    sections: [
      ['Datos generales', 'Información principal de la inmersión'],
      ['Condiciones ambientales', 'Características del entorno y del agua'],
      ['Equipamiento', 'Material y configuración utilizada'],
      ['Control de presiones', 'Presión de botella al inicio y al finalizar'],
      ['Equipo y trabajo', 'Personal, tareas e incidencias'],
      ['Valoración personal', 'Puntúa la experiencia de esta inmersión'],
    ],
    fields: {
      dive_number: 'N.º de inmersión (vacío = automático)',
      site: 'Lugar *',
      date: 'Fecha *',
      start_time: 'Hora de inicio',
      max_depth_m: 'Profundidad máxima (m) *',
      duration_min: 'Tiempo de inmersión (min) *',
      water_temp_c: 'Temperatura del agua (°C)',
      visibility: 'Visibilidad',
      swell: 'Oleaje',
      current: 'Corriente',
      suit_type: 'Traje',
      weight_kg: 'Lastre (kg)',
      tank_material: 'Material de la botella',
      tank_capacity_l: 'Capacidad de la botella',
      gas_mix: 'Mezcla / sistema respiratorio',
      pressure_start_bar: 'Presión inicial (bar)',
      pressure_end_bar: 'Presión final (bar)',
      team_leader: 'Jefe de equipo',
      buddy: 'Pareja de inmersión',
      work_task: 'Trabajo a realizar',
      incidents: 'Incidencias',
      tools: 'Herramientas utilizadas',
    },
    placeholders: {
      site: 'Ej. Cala Montjoi',
      automatic: 'Automático',
      depth: 'Ej. 18.5',
      duration: 'Ej. 45',
      temperature: 'Ej. 16.5',
      weight: 'Ej. 6',
      pressure: 'Ej. 200',
      pressureEnd: 'Ej. 50',
      leader: 'Nombre del responsable',
      buddy: 'Nombre del compañero',
      work_task: 'Describe las tareas realizadas...',
      incidents: 'Registra cualquier incidencia...',
      tools: 'Material y herramientas empleadas...',
    },
    pressureWarning: 'La presión final es mayor que la inicial. Revisa los datos. Puedes guardar igualmente.',
    pressureConsumption: 'Consumo de presión',
    ratingSelect: 'Selecciona una puntuación del 1 al 10. Es opcional.',
    ratingChosen: 'Valoración seleccionada',
    ratingRemove: 'Pulsa de nuevo para quitarla.',
    unsaved: 'Hay cambios sin guardar. ¿Salir sin guardar?',
    cancel: 'Cancelar',
    saving: 'Guardando inmersión...',
    save: 'Guardar inmersión',
  },
  en: {
    activity: 'Activity log',
    title: 'Dive details',
    description: 'Complete your dive details. Fields marked with * are required.',
    newRecord: 'New record',
    saveError: 'The dive could not be saved',
    select: 'Select...',
    specify: 'Specify',
    writeHere: 'Write here...',
    sections: [
      ['General information', 'Main dive information'],
      ['Environmental conditions', 'Water and environmental conditions'],
      ['Equipment', 'Equipment and configuration used'],
      ['Pressure control', 'Tank pressure at the beginning and end'],
      ['Team and work', 'Personnel, tasks and incidents'],
      ['Personal rating', 'Rate your experience on this dive'],
    ],
    fields: {
      dive_number: 'Dive number (blank = automatic)',
      site: 'Location *',
      date: 'Date *',
      start_time: 'Start time',
      max_depth_m: 'Maximum depth (m) *',
      duration_min: 'Dive duration (min) *',
      water_temp_c: 'Water temperature (°C)',
      visibility: 'Visibility',
      swell: 'Waves',
      current: 'Current',
      suit_type: 'Exposure suit',
      weight_kg: 'Weight (kg)',
      tank_material: 'Tank material',
      tank_capacity_l: 'Tank capacity',
      gas_mix: 'Gas mix / breathing system',
      pressure_start_bar: 'Starting pressure (bar)',
      pressure_end_bar: 'Ending pressure (bar)',
      team_leader: 'Team leader',
      buddy: 'Dive buddy',
      work_task: 'Work to be carried out',
      incidents: 'Incidents',
      tools: 'Tools used',
    },
    placeholders: {
      site: 'E.g. Cala Montjoi',
      automatic: 'Automatic',
      depth: 'E.g. 18.5',
      duration: 'E.g. 45',
      temperature: 'E.g. 16.5',
      weight: 'E.g. 6',
      pressure: 'E.g. 200',
      pressureEnd: 'E.g. 50',
      leader: 'Name of the person in charge',
      buddy: 'Buddy’s name',
      work_task: 'Describe the tasks carried out...',
      incidents: 'Record any incidents...',
      tools: 'Equipment and tools used...',
    },
    pressureWarning: 'Ending pressure is higher than starting pressure. Check the data. You can still save it.',
    pressureConsumption: 'Pressure consumption',
    ratingSelect: 'Select a rating from 1 to 10. Optional.',
    ratingChosen: 'Selected rating',
    ratingRemove: 'Click again to remove it.',
    unsaved: 'You have unsaved changes. Leave without saving?',
    cancel: 'Cancel',
    saving: 'Saving dive...',
    save: 'Save dive',
  },
}

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

export default function DiveForm({
  dive,
  language = 'ca',
}: {
  dive?: D
  language?: Language
}) {
  const t = translations[language] || translations.ca

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
      <option value="">{t.select}</option>
   {OPT[k as keyof typeof OPT].map(([a, b]) => (
  <option key={a} value={a}>
    {OPT_LABELS[language][k as keyof typeof OPT][a] ?? b}
  </option>
))}
    </select>
  )

  const otro = (k: string, show: boolean) =>
    show && (
      <F l={t.specify} wide>
        <input
          name={k}
          defaultValue={v(k)}
          placeholder={t.writeHere}
          className="input"
        />
      </F>
    )

  const placeholders: Record<string, string> = {
    site: t.placeholders.site,
    max_depth_m: t.placeholders.depth,
    duration_min: t.placeholders.duration,
    water_temp_c: t.placeholders.temperature,
    weight_kg: t.placeholders.weight,
    pressure_start_bar: t.placeholders.pressure,
    pressure_end_bar: t.placeholders.pressureEnd,
    team_leader: t.placeholders.leader,
    buddy: t.placeholders.buddy,
  }

  const section = (index: number) => t.sections[index]

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
              {t.activity}
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-[var(--title)]">
              {t.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {t.description}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            {t.newRecord}
          </div>
        </div>
      </div>

      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
        >
          <p className="font-semibold">{t.saveError}</p>
          <p className="mt-1">{state.error}</p>
        </div>
      )}

      <Sec number="01" t={section(0)[0]} subtitle={section(0)[1]}>
        <F l={t.fields.dive_number}>
          <input
            name="dive_number"
            type="number"
            min={1}
            placeholder={t.placeholders.automatic}
            defaultValue={v('dive_number')}
            className="input"
          />
        </F>

        <F l={t.fields.site}>
          <input
            name="site"
            required
            placeholder={placeholders.site}
            defaultValue={v('site')}
            className="input"
          />
        </F>

        <F l={t.fields.date}>
          <input
            name="dive_date"
            type="date"
            required
            defaultValue={v('dive_date') || new Date().toISOString().slice(0, 10)}
            className="input"
          />
        </F>

        <F l={t.fields.start_time}>
          <input
            name="start_time"
            type="time"
            defaultValue={String(v('start_time')).slice(0, 5)}
            className="input"
          />
        </F>

        <F l={t.fields.max_depth_m}>
          <input
            name="max_depth_m"
            type="number"
            step="0.1"
            min={0}
            required
            placeholder={placeholders.max_depth_m}
            defaultValue={v('max_depth_m')}
            className="input"
          />
        </F>

        <F l={t.fields.duration_min}>
          <input
            name="duration_min"
            type="number"
            min={1}
            required
            placeholder={placeholders.duration_min}
            defaultValue={v('duration_min')}
            className="input"
          />
        </F>
      </Sec>

      <Sec number="02" t={section(1)[0]} subtitle={section(1)[1]}>
        <F l={t.fields.water_temp_c}>
          <input
            name="water_temp_c"
            type="number"
            step="0.1"
            placeholder={placeholders.water_temp_c}
            defaultValue={v('water_temp_c')}
            className="input"
          />
        </F>

        <F l={t.fields.visibility}>{sel('visibility', v('visibility'))}</F>
        <F l={t.fields.swell}>{sel('swell', v('swell'))}</F>
        <F l={t.fields.current}>{sel('current', v('current'))}</F>
      </Sec>

      <Sec number="03" t={section(2)[0]} subtitle={section(2)[1]}>
        <F l={t.fields.suit_type}>{sel('suit_type', v('suit_type'))}</F>

        <F l={t.fields.weight_kg}>
          <input
            name="weight_kg"
            type="number"
            step="0.5"
            min={0}
            placeholder={placeholders.weight_kg}
            defaultValue={v('weight_kg')}
            className="input"
          />
        </F>

        <F l={t.fields.tank_material}>
          {sel('tank_material', tm, setTm)}
        </F>
        {otro('tank_material_other', tm === 'otros')}

        <F l={t.fields.tank_capacity_l}>
          {sel('tank_capacity_l', tc, setTc)}
        </F>
        {otro('tank_capacity_other', tc === 'otros')}

        <F l={t.fields.gas_mix}>
          {sel('gas_mix', gm, setGm)}
        </F>
        {otro('gas_mix_other', gm === 'otros')}
      </Sec>

      <Sec number="04" t={section(3)[0]} subtitle={section(3)[1]}>
        <F l={t.fields.pressure_start_bar}>
          <input
            name="pressure_start_bar"
            type="number"
            min={0}
            placeholder={placeholders.pressure_start_bar}
            value={p1}
            onChange={(e) => setP1(e.target.value)}
            className="input"
          />
        </F>

        <F l={t.fields.pressure_end_bar}>
          <input
            name="pressure_end_bar"
            type="number"
            min={0}
            placeholder={placeholders.pressure_end_bar}
            value={p2}
            onChange={(e) => setP2(e.target.value)}
            className="input"
          />
        </F>

        {p1 !== '' && p2 !== '' && Number(p2) > Number(p1) && (
          <p className="fit-wide rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200 sm:col-span-2">
            ⚠ {t.pressureWarning}
          </p>
        )}

        {p1 !== '' && p2 !== '' && Number(p1) >= Number(p2) && (
          <div className="fit-wide rounded-xl border border-[var(--line)] bg-[var(--tint)] p-3 sm:col-span-2">
            <p className="text-xs text-[var(--muted)]">{t.pressureConsumption}</p>
            <p className="mt-1 text-lg font-bold text-[var(--title)]">
              {Number(p1) - Number(p2)} bar
            </p>
          </div>
        )}
      </Sec>

      <Sec number="05" t={section(4)[0]} subtitle={section(4)[1]}>
        <F l={t.fields.team_leader}>
          <input
            name="team_leader"
            placeholder={placeholders.team_leader}
            defaultValue={v('team_leader')}
            className="input"
          />
        </F>

        <F l={t.fields.buddy}>
          <input
            name="buddy"
            placeholder={placeholders.buddy}
            defaultValue={v('buddy')}
            className="input"
          />
        </F>

        {([
          ['work_task', t.fields.work_task, t.placeholders.work_task],
          ['incidents', t.fields.incidents, t.placeholders.incidents],
          ['tools', t.fields.tools, t.placeholders.tools],
        ] as const).map(([k, label, placeholder]) => (
          <F key={k} l={label} wide>
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

      <Sec number="06" t={section(5)[0]} subtitle={section(5)[1]}>
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
              ? t.ratingSelect
              : `${t.ratingChosen}: ${rating}/10. ${t.ratingRemove}`}
          </p>
        </div>
      </Sec>

      <div className="sticky bottom-3 z-10 rounded-2xl border border-[var(--line)] bg-[var(--card-solid)]/90 p-3 shadow-xl backdrop-blur-xl sm:p-4">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dives"
            onClick={(e) => {
              if (dirty && !confirm(t.unsaved)) {
                e.preventDefault()
              }
            }}
            className="inline-flex items-center justify-center rounded-xl border border-[var(--line)] px-5 py-3 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--tint)]"
          >
            {t.cancel}
          </Link>

          <button
            type="submit"
            disabled={pending}
            className="btn inline-flex items-center justify-center gap-2 px-6 py-3 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? t.saving : t.save}
            {!pending && <span aria-hidden="true">→</span>}
          </button>
        </div>
      </div>
    </form>
  )
}
