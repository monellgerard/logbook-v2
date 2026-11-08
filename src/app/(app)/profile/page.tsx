
import { createClient } from '@/lib/supabase/server'
import { fetchAll, summarize } from '@/lib/filters'
import Icon from '@/components/icon'
import PasswordInput from '@/components/password-input'
import { Msg } from '../../auth-shell'
import { saveProfile, addCert, deleteCert } from './actions'
import { changeOwnPassword } from '@/app/actions'
import PhotoUploader from './photo-uploader'

const translations = {
  ca: {
    personalArea: 'Àrea personal',
    profile: 'El meu perfil',
    description: 'La teva fitxa personal, experiència sota l’aigua i certificacions professionals.',
    admin: 'Administrador',
    diver: 'Bussejador',
    noName: 'Sense nom',
    completeData: 'Completa les teves dades per personalitzar la teva fitxa',
    pendingPhoto: 'Foto pendent d’aprovació',
    pendingDescription: 'El professor ha d’aprovar la teva fotografia abans que sigui visible.',
    rejectedPhoto: 'Fotografia rebutjada',
    uploadAnother: 'Pots pujar una altra fotografia.',
    photoApproval: 'El professor ha d’aprovar la teva foto abans que sigui visible.',
    activitySummary: 'Resum d’activitat',
    activeYears: 'Anys d’activitat',
    certifications: 'Certificacions',
    profileStatus: 'Perfil',
    customized: 'Personalitzat',
    incomplete: 'Incomplet',
    activity: 'La meva activitat',
    activityDescription: 'Resum de tota la teva trajectòria registrada.',
    dives: 'Immersions',
    diveRecords: 'Registres realitzats',
    underwaterHours: 'Hores sota l’aigua',
    accumulatedTime: 'Temps acumulat',
    maxDepth: 'Profunditat màxima',
    greatestDepth: 'Profunditat més gran',
    averageDuration: 'Durada mitjana',
    perDive: 'Per immersió',
    firstDive: 'Primera immersió',
    firstRecord: 'Data del primer registre',
    lastDive: 'Última immersió',
    lastRecord: 'Data de l’últim registre',
    personalData: 'Dades personals',
    personalDescription: 'Informació del teu perfil professional.',
    fullName: 'Nom i cognoms *',
    fullNamePlaceholder: 'Nom complet',
    specialty: 'Especialitat o funció',
    specialtyPlaceholder: 'Ex. Bussejador professional',
    organization: 'Centre formatiu o empresa',
    organizationPlaceholder: 'Nom de l’empresa o centre',
    save: 'Desar els canvis',
    passwordSection: 'Seguretat i contrasenya',
    passwordDescription: 'Actualitza la contrasenya del teu compte.',
    currentPassword: 'Contrasenya actual',
    newPassword: 'Contrasenya nova',
    confirmPassword: 'Confirma la contrasenya nova',
    passwordPlaceholder: 'Introdueix la contrasenya',
    passwordMinLength: 'La contrasenya nova ha de tenir almenys 10 caràcters.',
    changePassword: 'Canviar la contrasenya',
    yearlyEvolution: 'Evolució per anys',
    yearlyDescription: 'Immersions i hores acumulades cada any.',
    year: 'Any',
    noDives: 'Quan registris immersions, aquí veuràs la teva evolució.',
    hours: 'Hores',
    maxDepthShort: 'Prof. màx.',
    qualifications: 'Certificacions i titulacions',
    qualificationsDescription: 'Les teves acreditacions i qualificacions professionals.',
    noCertifications: 'Encara no tens certificacions.',
    addQualifications: 'Afegeix les teves titulacions per tenir-les organitzades a la teva fitxa.',
    obtained: 'Obtinguda:',
    expiry: 'Caducitat:',
    expired: 'CADUCADA',
    remove: 'Eliminar',
    addCertification: 'Afegir certificació',
    addDescription: 'Introdueix les dades que apareixen a la teva acreditació.',
    titlePlaceholder: 'Titulació *',
    issuerPlaceholder: 'Organisme emissor *',
    obtainedDate: 'Data d’obtenció *',
    expiryDate: 'Caducitat (si existeix)',
    numberPlaceholder: 'Núm. de certificació (opcional)',
    photoAlt: 'La teva fotografia',
    pendingAlt: 'Fotografia pendent',
  },
  es: {
    personalArea: 'Área personal',
    profile: 'Mi perfil',
    description: 'Tu ficha personal, experiencia bajo el agua y certificaciones profesionales.',
    admin: 'Administrador',
    diver: 'Buceador',
    noName: 'Sin nombre',
    completeData: 'Completa tus datos para personalizar tu ficha',
    pendingPhoto: 'Foto pendiente de aprobación',
    pendingDescription: 'El profesor debe aprobar tu fotografía antes de que sea visible.',
    rejectedPhoto: 'Fotografía rechazada',
    uploadAnother: 'Puedes subir otra fotografía.',
    photoApproval: 'El profesor debe aprobar tu foto antes de que sea visible.',
    activitySummary: 'Resumen de actividad',
    activeYears: 'Años de actividad',
    certifications: 'Certificaciones',
    profileStatus: 'Perfil',
    customized: 'Personalizado',
    incomplete: 'Incompleto',
    activity: 'Mi actividad',
    activityDescription: 'Resumen de toda tu trayectoria registrada.',
    dives: 'Inmersiones',
    diveRecords: 'Registros realizados',
    underwaterHours: 'Horas bajo el agua',
    accumulatedTime: 'Tiempo acumulado',
    maxDepth: 'Profundidad máxima',
    greatestDepth: 'Mayor profundidad',
    averageDuration: 'Duración media',
    perDive: 'Por inmersión',
    firstDive: 'Primera inmersión',
    firstRecord: 'Fecha del primer registro',
    lastDive: 'Última inmersión',
    lastRecord: 'Fecha del último registro',
    personalData: 'Datos personales',
    personalDescription: 'Información de tu perfil profesional.',
    fullName: 'Nombre y apellidos *',
    fullNamePlaceholder: 'Nombre completo',
    specialty: 'Especialidad o función',
    specialtyPlaceholder: 'Ej. Buceador profesional',
    organization: 'Centro formativo o empresa',
    organizationPlaceholder: 'Nombre de empresa o centro',
    save: 'Guardar cambios',
    passwordSection: 'Seguridad y contraseña',
    passwordDescription: 'Actualiza la contraseña de tu cuenta.',
    currentPassword: 'Contraseña actual',
    newPassword: 'Nueva contraseña',
    confirmPassword: 'Confirma la nueva contraseña',
    passwordPlaceholder: 'Introduce la contraseña',
    passwordMinLength: 'La nueva contraseña debe tener al menos 10 caracteres.',
    changePassword: 'Cambiar contraseña',
    yearlyEvolution: 'Evolución por años',
    yearlyDescription: 'Inmersiones y horas acumuladas cada año.',
    year: 'Año',
    noDives: 'Cuando registres inmersiones verás aquí tu evolución.',
    hours: 'Horas',
    maxDepthShort: 'Prof. máx.',
    qualifications: 'Certificaciones y titulaciones',
    qualificationsDescription: 'Tus acreditaciones y cualificaciones profesionales.',
    noCertifications: 'Todavía no tienes certificaciones.',
    addQualifications: 'Añade tus titulaciones para tenerlas organizadas en tu ficha.',
    obtained: 'Obtenida:',
    expiry: 'Caducidad:',
    expired: 'CADUCADA',
    remove: 'Quitar',
    addCertification: 'Añadir certificación',
    addDescription: 'Introduce los datos que aparecen en tu acreditación.',
    titlePlaceholder: 'Titulación *',
    issuerPlaceholder: 'Organismo emisor *',
    obtainedDate: 'Fecha de obtención *',
    expiryDate: 'Caducidad (si existe)',
    numberPlaceholder: 'N.º de certificación (opcional)',
    photoAlt: 'Tu fotografía',
    pendingAlt: 'Fotografía pendiente',
  },
  en: {
    personalArea: 'Personal area',
    profile: 'My profile',
    description: 'Your personal profile, underwater experience and professional certifications.',
    admin: 'Administrator',
    diver: 'Diver',
    noName: 'No name',
    completeData: 'Complete your details to personalize your profile',
    pendingPhoto: 'Photo awaiting approval',
    pendingDescription: 'Your instructor must approve your photo before it becomes visible.',
    rejectedPhoto: 'Photo rejected',
    uploadAnother: 'You can upload another photo.',
    photoApproval: 'Your instructor must approve your photo before it becomes visible.',
    activitySummary: 'Activity summary',
    activeYears: 'Years active',
    certifications: 'Certifications',
    profileStatus: 'Profile',
    customized: 'Complete',
    incomplete: 'Incomplete',
    activity: 'My activity',
    activityDescription: 'Summary of your recorded diving history.',
    dives: 'Dives',
    diveRecords: 'Recorded entries',
    underwaterHours: 'Underwater hours',
    accumulatedTime: 'Total time',
    maxDepth: 'Maximum depth',
    greatestDepth: 'Deepest dive',
    averageDuration: 'Average duration',
    perDive: 'Per dive',
    firstDive: 'First dive',
    firstRecord: 'First recorded date',
    lastDive: 'Latest dive',
    lastRecord: 'Most recent recorded date',
    personalData: 'Personal details',
    personalDescription: 'Information for your professional profile.',
    fullName: 'Full name *',
    fullNamePlaceholder: 'Full name',
    specialty: 'Specialty or role',
    specialtyPlaceholder: 'E.g. Professional diver',
    organization: 'Training centre or company',
    organizationPlaceholder: 'Company or centre name',
    save: 'Save changes',
    passwordSection: 'Security and password',
    passwordDescription: 'Update your account password.',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
    passwordPlaceholder: 'Enter your password',
    passwordMinLength: 'Your new password must contain at least 10 characters.',
    changePassword: 'Change password',
    yearlyEvolution: 'Yearly progress',
    yearlyDescription: 'Dives and accumulated hours each year.',
    year: 'Year',
    noDives: 'Your progress will appear here once you have recorded dives.',
    hours: 'Hours',
    maxDepthShort: 'Max. depth',
    qualifications: 'Certifications and qualifications',
    qualificationsDescription: 'Your professional certifications and qualifications.',
    noCertifications: 'You do not have any certifications yet.',
    addQualifications: 'Add your qualifications to keep them organized in your profile.',
    obtained: 'Obtained:',
    expiry: 'Expiry:',
    expired: 'EXPIRED',
    remove: 'Remove',
    addCertification: 'Add certification',
    addDescription: 'Enter the details shown on your certificate.',
    titlePlaceholder: 'Qualification *',
    issuerPlaceholder: 'Issuing organization *',
    obtainedDate: 'Date obtained *',
    expiryDate: 'Expiry date (if applicable)',
    numberPlaceholder: 'Certification number (optional)',
    photoAlt: 'Your photo',
    pendingAlt: 'Pending photo',
  },
}

export default async function Profile(props: {
  searchParams: Promise<{ error?: string; ok?: string }>
}) {
  const searchParams = await props.searchParams
  const sb = createClient()

  const {
    data: { user },
  } = await sb.auth.getUser()

  if (!user) return null

  const uid = user.id

  const { data: p } = await sb
    .from('profiles')
    .select('full_name, specialty, organization, avatar_path, role, language')
    .eq('id', uid)
    .single()

  const language =
    p?.language === 'es' ? 'es' : p?.language === 'en' ? 'en' : 'ca'

  const t = translations[language]

  const { data: certs } = await sb
    .from('certifications')
    .select('*')
    .eq('user_id', uid)
    .order('obtained_on', { ascending: false })

  const all = await fetchAll(() =>
    sb
      .from('dives')
      .select('dive_date, duration_min, max_depth_m')
      .eq('user_id', uid)
      .order('dive_date')
      .order('id')
  )

  const { data: photos } = await sb
    .from('profile_photos')
    .select('path, status, reject_reason')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(1)

  const last = photos?.[0]
  const isAdmin = p?.role === 'admin'

  const url = async (path?: string | null) =>
    path
      ? (await sb.storage.from('avatars').createSignedUrl(path, 3600))
          .data?.signedUrl || undefined
      : undefined

  const photo = await url(p?.avatar_path)
  const pendingUrl =
    last?.status === 'pending' ? await url(last.path) : undefined

  const stats = summarize(all)

  const years = [...new Set(all.map((d) => d.dive_date.slice(0, 4)))]
    .sort()
    .reverse()

  const byYear = years.map((y) => ({
    y,
    ...summarize(all.filter((d) => d.dive_date.startsWith(y))),
  }))

  const maxH = Math.max(1, ...byYear.map((r) => r.hours))
  const today = new Date().toISOString().slice(0, 10)

  const tiles: [string, string | number, string][] = [
    [t.dives, stats.n, t.diveRecords],
    [t.underwaterHours, stats.hours.toFixed(1), t.accumulatedTime],
    [
      t.maxDepth,
      stats.maxDepth !== null ? `${stats.maxDepth} m` : '—',
      t.greatestDepth,
    ],
    [
      t.averageDuration,
      stats.avg !== null ? `${stats.avg} min` : '—',
      t.perDive,
    ],
    [t.firstDive, stats.first ?? '—', t.firstRecord],
    [t.lastDive, stats.last ?? '—', t.lastRecord],
  ]

  return (
    <div className="w-full space-y-6 pb-8">
      <header className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--accent-strong)]">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            {t.personalArea}
          </span>

          <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--title)] sm:text-4xl">
                {t.profile}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
                {t.description}
              </p>
            </div>

            <span className="self-start rounded-full border border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--muted)] sm:self-auto">
              {isAdmin ? t.admin : t.diver}
            </span>
          </div>
        </div>
      </header>

      <Msg error={searchParams.error} ok={searchParams.ok} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
        <aside className="space-y-5 lg:sticky lg:top-6">
          <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 text-center shadow-[var(--shadow)] backdrop-blur-xl sm:p-6">
            <div className="relative mx-auto aspect-square w-full max-w-[20rem] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--tint)]">
              {photo ? (
                <img
                  src={photo}
                  alt={t.photoAlt}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-[var(--muted)]">
                  <Icon name="user" className="h-24 w-24 opacity-40" />
                </div>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-tight text-[var(--title)]">
              {p?.full_name || t.noName}
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {[p?.specialty, p?.organization].filter(Boolean).join(' · ') ||
                t.completeData}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <PhotoUploader hasPhoto={!!photo} />

              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--tint)] px-4 py-2.5 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 [&::-webkit-details-marker]:hidden">
                  <Icon name="lock" className="h-4 w-4" />
                  {t.changePassword}
                  <Icon
                    name="chevron-down"
                    className="h-4 w-4 transition-transform group-open:rotate-180"
                  />
                </summary>

                <div className="absolute right-0 z-30 mt-3 w-[min(19rem,calc(100vw-3rem))] rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 text-left shadow-xl backdrop-blur-xl">
                  <h3 className="font-semibold text-[var(--title)]">
                    {t.passwordSection}
                  </h3>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {t.passwordDescription}
                  </p>

                  <form action={changeOwnPassword} className="mt-4 space-y-3">
                    <label className="block text-sm">
                      <span className="mb-2 block font-medium text-[var(--fg)]">
                        {t.currentPassword}
                      </span>
                      <PasswordInput
                        id="current_password"
                        name="current_password"
                        autoComplete="current-password"
                        placeholder={t.passwordPlaceholder}
                      />
                    </label>

                    <label className="block text-sm">
                      <span className="mb-2 block font-medium text-[var(--fg)]">
                        {t.newPassword}
                      </span>
                      <PasswordInput
                        id="new_password"
                        name="new_password"
                        autoComplete="new-password"
                        placeholder={t.passwordPlaceholder}
                      />
                    </label>

                    <label className="block text-sm">
                      <span className="mb-2 block font-medium text-[var(--fg)]">
                        {t.confirmPassword}
                      </span>
                      <PasswordInput
                        id="confirm_password"
                        name="confirm_password"
                        autoComplete="new-password"
                        placeholder={t.passwordPlaceholder}
                      />
                    </label>

                    <p className="text-xs text-[var(--muted)]">
                      {t.passwordMinLength}
                    </p>

                    <button className="btn w-full">
                      {t.changePassword} →
                    </button>
                  </form>
                </div>
              </details>
            </div>

            {!isAdmin && last?.status === 'pending' && (
              <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-left text-xs text-amber-800 dark:text-amber-200">
                <p className="font-semibold">⏳ {t.pendingPhoto}</p>
                <p className="mt-1">{t.pendingDescription}</p>
                {pendingUrl && (
                  <img
                    src={pendingUrl}
                    alt={t.pendingAlt}
                    className="mx-auto mt-3 h-16 w-16 rounded-xl object-cover"
                  />
                )}
              </div>
            )}

            {!isAdmin && last?.status === 'rejected' && (
              <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-left text-xs text-red-700 dark:text-red-300">
                <p className="font-semibold">{t.rejectedPhoto}</p>
                {last.reject_reason && (
                  <p className="mt-1">{last.reject_reason}</p>
                )}
                <p className="mt-1">{t.uploadAnother}</p>
              </div>
            )}

            {!isAdmin && !last && !photo && (
              <p className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--tint)] p-3 text-xs text-[var(--muted)]">
                {t.photoApproval}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-[var(--title)]">
              {t.activitySummary}
            </h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-[var(--muted)]">{t.activeYears}</span>
                <span className="font-semibold text-[var(--fg)]">
                  {years.length}
                </span>
              </div>

              <div className="h-px bg-[var(--line)]" />

              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-[var(--muted)]">{t.certifications}</span>
                <span className="font-semibold text-[var(--fg)]">
                  {certs?.length ?? 0}
                </span>
              </div>

              <div className="h-px bg-[var(--line)]" />

              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-[var(--muted)]">{t.profileStatus}</span>
                <span className="font-semibold text-[var(--accent-strong)]">
                  {p?.full_name ? t.customized : t.incomplete}
                </span>
              </div>
            </div>
          </section>
        </aside>

        <div className="min-w-0 space-y-6">
          <section>
            <div className="mb-3">
              <h2 className="text-lg font-bold text-[var(--title)]">
                {t.activity}
              </h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {t.activityDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {tiles.map(([k, v, description]) => (
                <div
                  key={k}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5"
                >
                  <p className="text-xs font-medium text-[var(--muted)]">
                    {k}
                  </p>
                  <p className="mt-3 break-words text-2xl font-bold tracking-tight text-[var(--title)]">
                    {v}
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--muted)]">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] backdrop-blur-xl">
            <div className="border-b border-[var(--line)] px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-lg text-[var(--accent-strong)]">
                  <Icon name="user" className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--title)]">
                    {t.personalData}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {t.personalDescription}
                  </p>
                </div>
              </div>
            </div>

            <form action={saveProfile} className="fit-grid items-end p-5 sm:p-6">
              <label className="block text-sm">
                <span className="mb-2 block font-medium text-[var(--fg)]">
                  {t.fullName}
                </span>
                <input
                  name="full_name"
                  required
                  defaultValue={p?.full_name}
                  placeholder={t.fullNamePlaceholder}
                  className="input"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-2 block font-medium text-[var(--fg)]">
                  {t.specialty}
                </span>
                <input
                  name="specialty"
                  defaultValue={p?.specialty ?? ''}
                  placeholder={t.specialtyPlaceholder}
                  className="input"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-2 block font-medium text-[var(--fg)]">
                  {t.organization}
                </span>
                <input
                  name="organization"
                  defaultValue={p?.organization ?? ''}
                  placeholder={t.organizationPlaceholder}
                  className="input"
                />
              </label>

              <div>
                <button className="btn inline-flex items-center justify-center gap-2">
                  {t.save}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] backdrop-blur-xl">
            <div className="border-b border-[var(--line)] px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-lg text-[var(--accent-strong)]">
                  <Icon name="chart-no-axes-combined" className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--title)]">
                    {t.yearlyEvolution}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {t.yearlyDescription}
                  </p>
                </div>
              </div>
            </div>

            {!byYear.length ? (
              <div className="p-8 text-center">
                <p className="text-sm text-[var(--muted)]">
                  {t.noDives}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto p-4 sm:p-5">
                <table className="w-full min-w-[540px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--line)] text-xs text-[var(--muted)]">
                      <th className="p-3 font-semibold">{t.year}</th>
                      <th className="p-3 font-semibold">{t.dives}</th>
                      <th className="w-1/2 p-3 font-semibold">{t.hours}</th>
                      <th className="p-3 font-semibold">{t.maxDepthShort}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {byYear.map((r) => (
                      <tr
                        key={r.y}
                        className="border-b border-[var(--line)] last:border-0"
                      >
                        <td className="p-3 font-semibold tabular-nums text-[var(--title)]">
                          {r.y}
                        </td>
                        <td className="p-3 font-medium text-[var(--fg)]">
                          {r.n}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--tint)]">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[var(--g1)] to-[var(--g2)]"
                                style={{
                                  width: `${(r.hours / maxH) * 100}%`,
                                  transformOrigin: 'left',
                                }}
                              />
                            </div>
                            <span className="w-14 text-right text-xs font-medium tabular-nums text-[var(--fg)]">
                              {r.hours.toFixed(1)} h
                            </span>
                          </div>
                        </td>
                        <td className="p-3 font-medium text-[var(--fg)]">
                          {r.maxDepth !== null ? `${r.maxDepth} m` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section
            id="certificaciones"
            className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] backdrop-blur-xl"
          >
            <div className="border-b border-[var(--line)] px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-lg text-[var(--accent-strong)]">
                  <Icon name="award" className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--title)]">
                    {t.qualifications}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {t.qualificationsDescription}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {!certs?.length ? (
                <div className="mb-5 rounded-xl border border-dashed border-[var(--line)] bg-[var(--tint)] p-5 text-center">
                  <p className="text-sm font-medium text-[var(--fg)]">
                    {t.noCertifications}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {t.addQualifications}
                  </p>
                </div>
              ) : (
                <ul className="mb-6 grid gap-3 md:grid-cols-2">
                  {certs.map((c) => {
                    const expired = c.expires_on && c.expires_on < today

                    return (
                      <li
                        key={c.id}
                        className="flex min-w-0 items-start justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--tint)]/60 p-4"
                      >
                        <div className="min-w-0">
                          <div className="break-words font-semibold text-[var(--title)]">
                            {c.title}
                          </div>
                          <div className="mt-1 text-sm text-[var(--muted)]">
                            {c.issuer}
                          </div>
                          <div className="mt-2 space-y-1 text-xs text-[var(--muted)]">
                            <p>{t.obtained} {c.obtained_on}</p>
                            {c.expires_on && (
                              <p className={expired ? 'font-semibold text-red-600 dark:text-red-300' : ''}>
                                {t.expiry} {c.expires_on}
                                {expired ? ` · ${t.expired}` : ''}
                              </p>
                            )}
                            {c.cert_number && (
                              <p>Nº {c.cert_number}</p>
                            )}
                          </div>
                        </div>

                        <form action={deleteCert} className="shrink-0">
                          <input
                            type="hidden"
                            name="id"
                            value={c.id}
                          />
                          <button className="rounded-lg border border-red-400/30 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-500/10 dark:text-red-300">
                            {t.remove}
                          </button>
                        </form>
                      </li>
                    )
                  })}
                </ul>
              )}

              <div className="mb-4 border-t border-[var(--line)] pt-5">
                <h3 className="font-semibold text-[var(--title)]">
                  {t.addCertification}
                </h3>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {t.addDescription}
                </p>
              </div>

              <form action={addCert} className="fit-grid items-end">
                <input
                  name="title"
                  required
                  placeholder={t.titlePlaceholder}
                  className="input"
                />
                <input
                  name="issuer"
                  required
                  placeholder={t.issuerPlaceholder}
                  className="input"
                />
                <label className="block text-xs font-medium text-[var(--muted)]">
                  {t.obtainedDate}
                  <input
                    name="obtained_on"
                    type="date"
                    required
                    className="input mt-2"
                  />
                </label>
                <label className="block text-xs font-medium text-[var(--muted)]">
                  {t.expiryDate}
                  <input
                    name="expires_on"
                    type="date"
                    className="input mt-2"
                  />
                </label>
                <input
                  name="cert_number"
                  placeholder={t.numberPlaceholder}
                  className="input"
                />
                <div>
                  <button className="btn inline-flex items-center justify-center gap-2">
                    {t.addCertification}
                    <span aria-hidden="true">+</span>
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
