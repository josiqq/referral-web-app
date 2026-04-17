# CONTEXT.md — Teralife Referral Web App

> Documento de contexto para LLMs y colaboradores. Describe el propósito del proyecto, arquitectura, estado actual y próximos pasos.

---

## ¿Qué es este proyecto?

Es la **web de ventas personalizada de un asesor de bienestar de Teralife** (actualmente Charles Aguilera, Paraguay, +595986259004). Teralife es una marca de suplementos que usa nanotecnología para mejorar la absorción de nutrientes.

El sitio cumple dos funciones:
1. **Landing pública** para que clientes potenciales vean los productos, lean testimonios y contacten al asesor por WhatsApp.
2. **Panel privado** (en construcción) para que el asesor/admin gestione productos, categorías e imágenes, y potencialmente un sistema de referidos.

La arquitectura está pensada para ser **multi-asesor en el futuro**: el código es un template reusable donde los datos del asesor (nombre, número, foto, textos) son configurables.

---

## Stack tecnológico

| Capa                 | Tecnología                                 |
| ----------------------| --------------------------------------------|
| Framework            | Next.js 16 (App Router)                    |
| Lenguaje             | TypeScript                                 |
| Estilos              | Tailwind CSS v4                            |
| Componentes UI       | shadcn/ui + Radix UI                       |
| Backend / DB         | Supabase (PostgreSQL + RLS)                |
| Autenticación        | Supabase Auth                              |
| Storage              | Supabase Storage (bucket `product-images`) |
| Internacionalización | next-intl (ES / PT / EN)                   |
| Formularios          | react-hook-form + zod                      |
| Analytics            | Vercel Analytics                           |
| Package manager      | pnpm                                       |

---

## Estructura de carpetas

```
referral-web-app/
├── app/
│   └── [locale]/               # Rutas i18n (es por defecto, pt, en)
│       ├── page.tsx             # Landing principal
│       ├── layout.tsx           # Layout con next-intl + metadata dinámica
│       ├── productos/page.tsx   # Página de catálogo completo
│       └── contacto/page.tsx    # Página de contacto
├── components/
│   └── landing/                 # Secciones de la landing
│       ├── header.tsx           # Nav sticky con links y switcher de idioma
│       ├── hero.tsx             # Sección hero con foto del asesor y stats
│       ├── about.tsx            # Sección "Sobre Mí"
│       ├── products-preview.tsx # Preview de productos en la landing
│       ├── products.tsx         # Catálogo completo (galería + categorías)
│       ├── category-hero.tsx    # Banner visual de categoría
│       ├── benefits.tsx         # Beneficios de los productos / marca
│       ├── testimonials.tsx     # Testimonios de clientes
│       ├── contact-preview.tsx  # CTA de contacto en la landing
│       ├── contact.tsx          # Página de contacto completa
│       ├── faq.tsx              # Preguntas frecuentes
│       └── footer.tsx           # Footer con links legales y WhatsApp
├── lib/
│   ├── actions/                 # Server Actions de Next.js ("use server")
│   │   ├── products.ts          # CRUD productos + imágenes (admin) + queries públicas
│   │   ├── categories.ts        # CRUD categorías (admin) + queries públicas
│   │   ├── admin.ts             # isAdmin(), getAdminStats()
│   │   ├── profile.ts           # updateProfile()
│   │   └── upload.ts            # Subida/borrado de imágenes a Supabase Storage
│   └── supabase/
│       ├── client.ts            # Cliente para el browser
│       ├── server.ts            # Cliente para Server Components / Actions
│       └── proxy.ts             # updateSession() para el middleware
├── i18n/
│   └── routing.ts               # Locales: ['es','pt','en'], default 'es'
├── messages/
│   ├── es.json                  # Textos en español (idioma base)
│   ├── pt.json                  # Portugués
│   └── en.json                  # Inglés
├── supabase/
│   └── migrations/
│       ├── 20260204000000_initial_schema.sql       # profiles, products, product_images
│       ├── 20260204000001_create_storage_bucket.sql # Bucket product-images + RLS
│       └── 20260205000000_add_product_categories.sql # product_categories + FK en products
└── middleware.ts                # Auth + i18n; protege /dashboard y /admin
```

---

## Base de datos (Supabase)

### Tablas

**`profiles`** — Extiende `auth.users`
- `id` (uuid, FK → auth.users), `email`, `display_name`
- `role` — `'user'` | `'admin'`
- Trigger `on_auth_user_created` lo puebla automáticamente al registrarse.

**`products`**
- `id`, `slug` (único), `name`
- `short_description`, `description`, `benefits` (jsonb array de strings)
- `ingredients`, `usage_instructions`
- `price` (decimal), `is_active` (bool), `display_order` (int)
- `category_id` (FK → product_categories, nullable)

**`product_images`**
- `id`, `product_id` (FK → products, cascade delete)
- `image_url`, `alt_text`, `is_primary` (bool), `display_order`

**`product_categories`**
- `id`, `slug`, `name`, `description`
- `image_url` — para el banner de categoría (`CategoryHero`)
- `display_order`, `is_active`

### RLS (Row Level Security)
Todas las tablas tienen RLS activo. Patrón general:
- Lectura pública → solo registros con `is_active = true`
- Escritura → solo `role = 'admin'` (verificado con función `is_admin()` security definer para evitar recursión)

### Storage
- Bucket `product-images` (público, 5MB max, JPEG/PNG/WebP/GIF)
- Path de archivos: `{product_id}/{timestamp}-{random}.{ext}`

### Seed inicial
La migración `initial_schema.sql` inserta 6 productos: Teralife Gotas, Colágeno, Omega, Magnesio, Probióticos, Vitamina D.

---

## Flujo de rutas y autenticación

```
/                    → Landing (pública)
/productos           → Catálogo completo (pública)
/contacto            → Página de contacto (pública)
/auth/login          → Login (redirige a /dashboard si ya autenticado)
/auth/sign-up        → Registro
/dashboard           → Panel del usuario (protegido — solo autenticados)
/admin               → Panel de administración (protegido — role=admin)
```

El `middleware.ts` gestiona autenticación e i18n conjuntamente, con soporte completo de locales (`/pt/productos`, etc.).

---

## Internacionalización

- Locales: `es` (default), `pt`, `en`
- Estrategia: `localePrefix: 'as-needed'` → español sin prefijo en la URL, otros con prefijo (`/pt/`, `/en/`)
- Los textos están en `messages/{locale}.json`
- La metadata del `<head>` (`title`, `description`) también es i18n

---

## Estado actual del proyecto

### ✅ Completado y funcional
- Landing pública completa (Hero, About, Products Preview, Benefits, Testimonials, Contact Preview, FAQ, Footer)
- Página `/productos` con galería de imágenes por producto y soporte de categorías con banners
- Página `/contacto`
- Cambio de idioma (ES / PT / EN)
- Schema de base de datos completo con RLS y políticas
- Server Actions para CRUD completo de productos, categorías e imágenes (solo admin)
- Upload y eliminación de imágenes en Supabase Storage
- Middleware de autenticación + protección de rutas `/dashboard` y `/admin`
- Seed con 6 productos de ejemplo

### ✅ Sistema de referidos implementado (abril 2026)

**Decisiones de diseño:**
- Los que se unen son **nuevos asesores/distribuidores** (red multinivel)
- Los códigos los **genera el admin manualmente** desde `/admin/codigos`
- Cada usuario ve su **upline completo + toda su red hacia abajo**

**Archivos nuevos:**
- `supabase/migrations/20260418000000_referral_system.sql` — columna `referred_by` en `profiles`, tabla `referral_codes`, funciones SQL `get_downline()` y `consume_referral_code()`
- `lib/actions/referrals.ts` — `validateReferralCode`, `consumeReferralCode`, `getMyTree`, `listReferralCodes`, `createReferralCode`, `deactivateReferralCode`, `listAllMembers`
- `app/[locale]/auth/login/page.tsx` + `components/auth/login-form.tsx`
- `app/[locale]/auth/sign-up/page.tsx` + `components/auth/sign-up-form.tsx` — flujo 2 pasos: código → registro
- `app/[locale]/dashboard/page.tsx` — árbol jerárquico del usuario
- `components/dashboard/team-tree.tsx` — árbol visual (upline + me + downline recursivo)
- `components/dashboard/logout-button.tsx`
- `app/[locale]/admin/codigos/page.tsx` + `components/admin/referral-codes-panel.tsx` — gestión de códigos

**Flujo sign-up:**
1. Usuario ingresa a `/auth/sign-up`
2. Paso 1: ingresa el código `TERA-XXXXXX` → se valida contra `referral_codes` (activo, sin usar)
3. Paso 2: completa nombre/email/contraseña → se crea auth user → `consume_referral_code()` marca el código como usado y escribe `referred_by` en `profiles`

**Árbol:**
- Upline: caminando `referred_by` hacia arriba en el servidor
- Downline: función recursiva SQL `get_downline(root_id)` → árbol en el cliente
- El usuario es siempre la cabeza visible de su árbol

**Formato de código:** `TERA-XXXXXX` (6 hex chars, generado con `crypto.randomBytes` server-side)

---

## Próximos pasos (ordenados por prioridad)

### 1. Panel de administración (`/admin`) — productos y categorías
Las Server Actions ya existen. Falta la UI.

**Archivos a crear:**
- `app/[locale]/admin/page.tsx` — Dashboard con stats usando `getAdminStats()`
- `app/[locale]/admin/productos/page.tsx` + `[id]/page.tsx`
- `app/[locale]/admin/categorias/page.tsx`

### 5. Páginas legales
El footer enlaza a `/privacy` y `/terms` que no existen. Crear:
- `app/[locale]/privacy/page.tsx`
- `app/[locale]/terms/page.tsx`

### 6. Centralizar configuración del asesor
Actualmente el número de WhatsApp (`+595986259004`) y otros datos están hardcodeados en múltiples componentes (`hero.tsx`, `contact.tsx`, `products.tsx`, `footer.tsx`). Centralizar en:
- Un archivo `lib/config.ts` con constantes del asesor, o
- Una tabla `settings` en Supabase para hacerlo editable desde el admin

---

## Variables de entorno necesarias

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Notas importantes para el LLM que continúe

- **Server Actions**: todas las operaciones de escritura a DB son Server Actions (`"use server"`), no API routes. Mantener este patrón.
- **Verificación de admin**: se repite en cada action: `getUser()` → leer `profiles.role` → comprobar `=== 'admin'`. Considerar refactorizar en un helper `requireAdmin()` si se añaden más actions.
- **Tres variantes de productos**: `Products` (lista plana), `ProductsGrouped` (con banners de categoría), `ProductsStatic` (fallback sin DB). La página `/productos` decide cuál renderizar dinámicamente.
- **i18n en componentes**: los que usan `useTranslations()` son Client Components obligatoriamente. Los Server Components acceden a traducciones vía `getTranslations()` de `next-intl/server`.
- **Beneficios de producto**: se almacenan como `jsonb` array de strings en Supabase, pero en el código TypeScript son `string[]`. La migración usa `'[]'::jsonb` como default.
- **Imágenes del asesor**: la foto de perfil se sirve desde `/public/profile.png`. Si no existe, el `Avatar` muestra un fallback con iniciales `TU`.
- **Footer WhatsApp**: hay una inconsistencia menor — `footer.tsx` usa `+1234567890` (placeholder) mientras el resto de componentes usa `+595986259004`. Corregir al centralizar la config.
