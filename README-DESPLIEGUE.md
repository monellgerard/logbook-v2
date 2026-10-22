# LogBook · pruebas, seguridad y despliegue

## 1. Ejecutar las pruebas de permisos
```
npm install -D vitest@2.1.4
npm pkg set "scripts.test=vitest run"
npm test
```
Crean 3 usuarios temporales (alumna, alumno, profesor) en tu Supabase real y los borran al terminar. Comprueban: aislamiento entre alumnos, imposibilidad de hacerse administrador, solo lectura del profesor, flujo de revisión y filtros por año/mes. Para trabajar con alumnos reales conviene usar un proyecto Supabase separado para pruebas.

## 2. Antes de publicar
- [ ] **Actualizar Next.js** a una versión con soporte (la 14 ya no lo tiene): `npm install next@latest react@latest react-dom@latest`, `npm run build` y repetir las pruebas. Revisa `npm audit` y las novedades de seguridad en nextjs.org/blog.
- [ ] Configurar **SMTP propio** en Supabase (Authentication → Emails → SMTP Settings) para que funcione la recuperación de contraseña con muchos alumnos.
- [ ] Authentication → Sign In / Providers: **registro público desactivado**; contraseña mínima de 10 o más.
- [ ] El archivo `.env.local` **no** se sube a GitHub (ya está en `.gitignore`).
- [ ] Cambia la contraseña del profesor por una larga y única; guarda la clave `SUPABASE_SECRET_KEY` solo en Vercel.

## 3. Publicar en Vercel
1. Sube el proyecto a un repositorio **privado** de GitHub.
2. En vercel.com: Add New → Project → importa el repositorio.
3. En Environment Variables añade: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SITE_URL` (la dirección pública final, p. ej. `https://tu-app.vercel.app`).
4. Deploy. Después, en Supabase → Authentication → URL Configuration: **Site URL** = esa dirección y en **Redirect URLs** añade `https://tu-app.vercel.app/**`.
5. Prueba: login, crear alumno, alumno registra inmersión, profesor la revisa.

## 4. Copias de seguridad
Mira en Supabase → Database → Backups qué incluye tu plan. Si no hay copias diarias, exporta periódicamente los datos (CSV de la clase desde la app y `pg_dump` con tu cadena de conexión) y guárdalos en un sitio seguro.

## 5. RGPD (lista de apoyo; la responsabilidad legal es del centro)
- Datos mínimos: nombre, correo y datos de buceo. La foto es opcional y requiere aprobación del profesor.
- El proyecto Supabase está en región UE (Irlanda).
- El centro debe: informar a alumnos (y tutores, si son menores) sobre el tratamiento, fijar base legal y plazo de conservación, atender solicitudes de acceso, rectificación y supresión, y revisar el contrato de encargado de tratamiento con Supabase y Vercel. Consulta con el delegado de protección de datos del centro.
- Supresión de un alumno: hoy se hace desde Supabase (Authentication → Users → Delete); sus inmersiones, certificaciones y perfil se borran en cascada. Las fotos en Storage hay que borrarlas aparte (carpeta con su ID en el bucket `avatars`).
