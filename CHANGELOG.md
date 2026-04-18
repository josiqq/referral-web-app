# Changelog — referral-web-app

Registro de cambios realizados en sesiones de desarrollo asistido.

---

## [2026-04-20] — Sesión 1

### Dashboard — UX fixes

- **Sidebar fijo** (`components/dashboard/dashboard-nav.tsx`, `app/[locale]/dashboard/layout.tsx`)
  - El sidebar de escritorio ahora usa `position: fixed` y `h-screen` en lugar de `min-h-screen`, quedando anclado al viewport sin deslizarse con el contenido.
  - Se agregó `md:ml-56` al `<main>` del layout para compensar el ancho fijo del sidebar.

- **Mi Red rediseñada** (`components/dashboard/team-tree.tsx`)
  - Reemplaza el árbol horizontal (scroll horizontal en mobile) por una lista jerárquica colapsable con indentación.
  - Colores por profundidad de nivel: primary → secondary → emerald → violet → orange.
  - Upline colapsable: muestra 2 primeros, botón "Ver X más" para expandir.
  - Cada nodo con hijos tiene un chevron y se puede abrir/cerrar; los primeros 2 niveles abren por defecto.
  - Stats con íconos (Crown, TrendingUp, Network).

---

## [2026-04-20] — Sesión 2

### Nueva vista admin — Sobre Mí

- **Migración SQL** (`supabase/migrations/20260420000000_about_settings.sql`)
  - Agrega columnas a `advisor_settings`: `about_title`, `about_subtitle`, `about_bio`, `about_mission`, `about_photo_url`, `about_values` (JSONB).

- **Tipos y server actions** (`lib/actions/settings.ts`)
  - Nuevo tipo `AboutValue` y nuevos campos en `AdvisorSettings`.
  - Nueva action `updateAboutSettings()`.
  - Nueva action `uploadAboutPhoto()` (usa bucket `advisor-assets/about/`).

- **Componente landing** (`components/landing/about.tsx`)
  - Convertido de Client Component a Server Component.
  - Lee título, subtítulo, bio, misión, foto y valores desde la DB, con fallback a i18n si los campos están vacíos.

- **Panel admin** (`components/admin/about-panel.tsx`)
  - Upload de foto de sección.
  - Campos para título y subtítulo.
  - Textareas para biografía y misión.
  - Editor de valores dinámico con selector de ícono (Heart / HandHeart / BookOpen), agregar y eliminar tarjetas.

- **Página dashboard** (`app/[locale]/dashboard/about/page.tsx`)
  - Ruta `/dashboard/about`, protegida para admin.

- **Navegación** (`components/dashboard/dashboard-nav.tsx`)
  - Ítem "Sobre Mí" (`UserCircle2`) agregado al sidebar, solo visible para admin.

---

## [2026-04-20] — Sesión 3

### Página 404 personalizada

- **`app/[locale]/not-found.tsx`** — Página 404 con diseño acorde a la marca:
  - Ilustración SVG inline con número "404", hojas decorativas y el ícono de Teralife.
  - Mensaje amigable + dos botones: "Volver al inicio" y "Ver productos".
  - Sin dependencias externas, compatible con i18n vía locale layout.
- **`app/not-found.tsx`** — Archivo root que re-exporta el not-found del locale, cubriendo rutas fuera del prefijo de idioma.

### Nueva sección — Patrocinadores

- **Migración SQL** (`supabase/migrations/20260420000001_sponsors.sql`)
  - Nueva tabla `public.sponsors` con campos: `id`, `name`, `logo_url`, `website_url`, `description`, `position`, `is_active`, `created_at`.
  - RLS: lectura pública, escritura solo admin.
  - Columnas en `advisor_settings`: `sponsors_enabled` (boolean), `sponsors_title`, `sponsors_subtitle`.

- **Tipos y server actions** (`lib/actions/sponsors.ts`)
  - `getSponsors(onlyActive?)` — lectura pública ordenada por `position`.
  - `createSponsor()` — crea con posición autoincremental.
  - `updateSponsor()` — edición parcial.
  - `deleteSponsor()` — borra el logo del storage antes de eliminar el registro.
  - `reorderSponsors(ids[])` — actualiza `position` en batch.
  - `toggleSponsorsSection(enabled)` — activa/desactiva la sección en la landing.
  - `uploadSponsorLogo()` — sube logos al bucket `advisor-assets/sponsors/`.

- **`lib/actions/settings.ts`** — Tipo `AdvisorSettings` extendido con `sponsors_enabled`, `sponsors_title`, `sponsors_subtitle`.

- **Componente landing** (`components/landing/sponsors.tsx`)
  - Server Component. No renderiza nada si `sponsors_enabled = false`.
  - Tarjetas con logo en grayscale (full color en hover), nombre, descripción opcional y link externo.
  - Estado vacío si la sección está activa pero sin sponsors.

- **`app/[locale]/page.tsx`** — `<Sponsors />` insertado entre `<Benefits />` y `<Testimonials />`.

- **Panel admin** (`components/admin/sponsors-panel.tsx`)
  - Toggle on/off de la sección con feedback visual inmediato.
  - Editor de título y subtítulo de la sección.
  - Lista de sponsors con: reordenamiento (grip), activar/desactivar individual, editar inline, eliminar.
  - Formulario de creación/edición: upload de logo, nombre, URL, descripción.

- **Página dashboard** (`app/[locale]/dashboard/sponsors/page.tsx`)
  - Ruta `/dashboard/sponsors`, protegida para admin, carga todos los sponsors (incluyendo inactivos).

- **Navegación** (`components/dashboard/dashboard-nav.tsx`)
  - Ítem "Patrocinadores" (`Handshake`) agregado al sidebar entre "Sobre Mí" y "Configuración".

---

## Pendiente (plan acordado)

- [ ] Migrar **Testimonials** a tabla DB con panel admin (agregar/editar/reordenar/activar)
- [ ] Migrar **FAQ** a tabla DB con panel admin
- [ ] Definir estrategia de internacionalización para contenido dinámico (Opción B recomendada: tabla `content_translations`)
