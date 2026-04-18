-- ============================================
-- Sponsors table + advisor_settings columns
-- ============================================

-- Toggle y textos de la sección en advisor_settings
alter table public.advisor_settings
  add column if not exists sponsors_enabled boolean default false,
  add column if not exists sponsors_title text default 'Nuestros Patrocinadores',
  add column if not exists sponsors_subtitle text default 'Marcas y aliados que confían en nosotros';

-- Tabla de patrocinadores
create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website_url text,
  description text,
  position int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.sponsors enable row level security;

-- Lectura pública
create policy "sponsors_public_read" on public.sponsors
  for select using (true);

-- Solo admin escribe
create policy "sponsors_admin_write" on public.sponsors
  for all using (public.is_admin());

-- Storage: carpeta logos dentro del bucket advisor-assets ya existente
-- (el bucket ya está creado, solo documentamos la ruta: advisor-assets/sponsors/)
