
import { z } from 'zod'

export type Language = 'ca' | 'es' | 'en'

export const OPT = {
  visibility: [['alta', 'Alta'], ['media', 'Media'], ['baja', 'Baja']],
  swell: [['ligero', 'Ligero'], ['medio', 'Medio'], ['fuerte', 'Fuerte']],
  current: [['sin_corriente', 'Sin corriente'], ['ligera', 'Ligera'], ['media', 'Media'], ['fuerte', 'Fuerte']],
  suit_type: [['largo_3', 'Largo 3 mm'], ['largo_5', 'Largo 5 mm'], ['largo_7', 'Largo 7 mm'], ['semiseco', 'Semiseco'], ['seco', 'Seco']],
  tank_material: [['acero', 'Acero'], ['aluminio', 'Aluminio'], ['otros', 'Otros']],
  tank_capacity_l: [['12', '12 L'], ['15', '15 L'], ['18', '18 L'], ['otros', 'Otros']],
  gas_mix: [['aire', 'Aire'], ['eanx32', 'EANx 32'], ['eanx36', 'EANx 36'], ['eanx40', 'EANx 40'], ['enriquecido', 'Enriquecido'], ['trimix', 'Trimix'], ['rebreather', 'Rebreather'], ['otros', 'Otros']],
} as const

export const OPT_LABELS: Record<Language, Record<keyof typeof OPT, Record<string, string>>> = {
  ca: {
    visibility: { alta: 'Alta', media: 'Mitjana', baja: 'Baixa' },
    swell: { ligero: 'Lleuger', medio: 'Moderat', fuerte: 'Fort' },
    current: { sin_corriente: 'Sense corrent', ligera: 'Lleuger', media: 'Moderat', fuerte: 'Fort' },
    suit_type: { largo_3: 'Llarg 3 mm', largo_5: 'Llarg 5 mm', largo_7: 'Llarg 7 mm', semiseco: 'Semisec', seco: 'Sec' },
    tank_material: { acero: 'Acer', aluminio: 'Alumini', otros: 'Altres' },
    tank_capacity_l: { '12': '12 L', '15': '15 L', '18': '18 L', otros: 'Altres' },
    gas_mix: { aire: 'Aire', eanx32: 'EANx 32', eanx36: 'EANx 36', eanx40: 'EANx 40', enriquecido: 'Enriquit', trimix: 'Trimix', rebreather: 'Rebreather', otros: 'Altres' },
  },
  es: {
    visibility: { alta: 'Alta', media: 'Media', baja: 'Baja' },
    swell: { ligero: 'Ligero', medio: 'Medio', fuerte: 'Fuerte' },
    current: { sin_corriente: 'Sin corriente', ligera: 'Ligera', media: 'Media', fuerte: 'Fuerte' },
    suit_type: { largo_3: 'Largo 3 mm', largo_5: 'Largo 5 mm', largo_7: 'Largo 7 mm', semiseco: 'Semiseco', seco: 'Seco' },
    tank_material: { acero: 'Acero', aluminio: 'Aluminio', otros: 'Otros' },
    tank_capacity_l: { '12': '12 L', '15': '15 L', '18': '18 L', otros: 'Otros' },
    gas_mix: { aire: 'Aire', eanx32: 'EANx 32', eanx36: 'EANx 36', eanx40: 'EANx 40', enriquecido: 'Enriquecido', trimix: 'Trimix', rebreather: 'Rebreather', otros: 'Otros' },
  },
  en: {
    visibility: { alta: 'High', media: 'Medium', baja: 'Low' },
    swell: { ligero: 'Light', medio: 'Moderate', fuerte: 'Strong' },
    current: { sin_corriente: 'No current', ligera: 'Light', media: 'Moderate', fuerte: 'Strong' },
    suit_type: { largo_3: 'Full suit 3 mm', largo_5: 'Full suit 5 mm', largo_7: 'Full suit 7 mm', semiseco: 'Semi-dry', seco: 'Dry suit' },
    tank_material: { acero: 'Steel', aluminio: 'Aluminium', otros: 'Other' },
    tank_capacity_l: { '12': '12 L', '15': '15 L', '18': '18 L', otros: 'Other' },
    gas_mix: { aire: 'Air', eanx32: 'EANx 32', eanx36: 'EANx 36', eanx40: 'EANx 40', enriquecido: 'Enriched air', trimix: 'Trimix', rebreather: 'Rebreather', otros: 'Other' },
  },
}

export const LABEL: Record<string, string> = {
  site: 'Lugar',
  dive_date: 'Fecha',
  max_depth_m: 'Profundidad',
  duration_min: 'Tiempo',
  water_temp_c: 'Temperatura',
  weight_kg: 'Lastre',
  pressure_start_bar: 'Presión inicial',
  pressure_end_bar: 'Presión final',
  dive_number: 'Nº de inmersión',
  rating: 'Valoración',
  tank_material_other: 'Material (otros)',
  tank_capacity_other: 'Capacidad (otros)',
  gas_mix_other: 'Mezcla (otros)',
}

const empty = (v: unknown) => (v === '' || v == null ? undefined : v)
const opt = (s: z.ZodTypeAny) => z.preprocess(empty, s.optional())
const en = (k: keyof typeof OPT) => z.enum(OPT[k].map((o) => o[0]) as [string, ...string[]], { errorMap: () => ({ message: 'valor no válido' }) })
const nonNeg = z.coerce.number({ invalid_type_error: 'debe ser un número' }).min(0, 'no puede ser negativo')
const txt = opt(z.string().trim().max(2000, 'demasiado largo'))

export const diveSchema = z.object({
  dive_number: opt(z.coerce.number({ invalid_type_error: 'debe ser un número' }).int().min(1, 'mínimo 1')),
  site: z.string().trim().min(1, 'obligatorio').max(200),
  dive_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'obligatoria'),
  start_time: opt(z.string()),
  max_depth_m: z.preprocess(empty, nonNeg.max(300, 'máximo 300 m')),
  duration_min: z.preprocess(empty, nonNeg.int('entero').min(1, 'mínimo 1')),
  water_temp_c: opt(z.coerce.number({ invalid_type_error: 'debe ser un número' }).min(-5).max(45)),
  visibility: opt(en('visibility')), swell: opt(en('swell')), current: opt(en('current')),
  suit_type: opt(en('suit_type')), weight_kg: opt(nonNeg),
  tank_material: opt(en('tank_material')), tank_material_other: txt,
  tank_capacity_l: opt(en('tank_capacity_l')), tank_capacity_other: txt,
  gas_mix: opt(en('gas_mix')), gas_mix_other: txt,
  pressure_start_bar: opt(nonNeg.int('entero')), pressure_end_bar: opt(nonNeg.int('entero')),
  team_leader: txt, buddy: txt, work_task: txt, incidents: txt, tools: txt,
  rating: opt(z.coerce.number().int().min(1).max(10)),
}).superRefine((d, c) => {
  for (const [m, o] of [['tank_material', 'tank_material_other'], ['tank_capacity_l', 'tank_capacity_other'], ['gas_mix', 'gas_mix_other']] as const)
    if (d[m] === 'otros' && !d[o]) c.addIssue({ code: 'custom', path: [o], message: 'especifica el valor' })
})

export function toRow(d: z.infer<typeof diveSchema>) {
  const r: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(d)) r[k] = v === undefined ? null : v
  if (r.tank_material !== 'otros') r.tank_material_other = null
  if (r.tank_capacity_l !== 'otros') r.tank_capacity_other = null
  if (r.gas_mix !== 'otros') r.gas_mix_other = null
  return r
}
