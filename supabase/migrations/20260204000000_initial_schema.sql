-- ============================================
-- Initial Database Schema - Teralife Wellness
-- ============================================

-- ============================================
-- 1. Profiles Table (extends auth.users)
-- ============================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Security definer function to check admin status (avoids RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- RLS Policies for Profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- ============================================
-- 2. Products Table
-- ============================================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_description text,
  description text,
  benefits jsonb default '[]'::jsonb,
  ingredients text,
  usage_instructions text,
  price decimal(10, 2),
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.products enable row level security;

-- RLS Policies for Products
create policy "products_select_public" on public.products
  for select using (is_active = true);

create policy "products_select_admin" on public.products
  for select using (public.is_admin());

create policy "products_insert_admin" on public.products
  for insert with check (public.is_admin());

create policy "products_update_admin" on public.products
  for update using (public.is_admin());

create policy "products_delete_admin" on public.products
  for delete using (public.is_admin());

-- ============================================
-- 3. Product Images Table
-- ============================================

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  is_primary boolean default false,
  display_order integer default 0,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.product_images enable row level security;

-- RLS Policies for Product Images
create policy "product_images_select_public" on public.product_images
  for select using (
    exists (
      select 1 from public.products
      where id = product_id and is_active = true
    )
  );

create policy "product_images_select_admin" on public.product_images
  for select using (public.is_admin());

create policy "product_images_insert_admin" on public.product_images
  for insert with check (public.is_admin());

create policy "product_images_update_admin" on public.product_images
  for update using (public.is_admin());

create policy "product_images_delete_admin" on public.product_images
  for delete using (public.is_admin());

-- ============================================
-- Indexes for Performance
-- ============================================

create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_display_order on public.products(display_order);
create index if not exists idx_products_is_active on public.products(is_active);
create index if not exists idx_product_images_product_id on public.product_images(product_id);
create index if not exists idx_product_images_display_order on public.product_images(display_order);

-- ============================================
-- Profile Trigger (simplified without referrals)
-- ============================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'user')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================
-- Seed Initial Products
-- ============================================

insert into public.products (slug, name, short_description, description, benefits, display_order) values
(
  'teralife-gotas',
  'Teralife Gotas',
  'Gotas de nanotecnologia que apoyan la regeneracion celular y el sistema inmunologico.',
  'Las Gotas Teralife son un suplemento revolucionario que utiliza nanotecnologia de ultima generacion para maximizar la absorcion de nutrientes esenciales. Formuladas para fortalecer tu sistema inmunologico y promover la regeneracion celular, estas gotas son tu aliado perfecto para mantener una salud optima.',
  '["Fortalece el sistema inmune", "Mejora la energia y vitalidad", "Apoya la regeneracion celular", "Ayuda a desintoxicar el organismo", "Absorcion hasta 10 veces mayor", "100% ingredientes naturales"]'::jsonb,
  1
),
(
  'teralife-colageno',
  'Teralife Colageno',
  'Colageno hidrolizado con nanotecnologia para una absorcion superior.',
  'El Colageno Teralife combina colageno hidrolizado de la mas alta calidad con nuestra exclusiva nanotecnologia. Esta formula avanzada permite una absorcion significativamente mayor que los suplementos tradicionales, ayudandote a mantener una piel radiante, articulaciones flexibles y un cabello saludable.',
  '["Mejora la elasticidad de la piel", "Fortalece articulaciones y huesos", "Cabello y unas mas fuertes", "Reduccion visible de arrugas", "Hidratacion profunda de la piel", "Recuperacion muscular acelerada"]'::jsonb,
  2
),
(
  'teralife-omega',
  'Teralife Omega',
  'Omega 3 de alta pureza con tecnologia de nanoencapsulacion.',
  'Teralife Omega ofrece acidos grasos omega-3 de la mas alta pureza, encapsulados con nuestra tecnologia de nanoencapsulacion. Esta innovadora formula garantiza una absorcion optima y protege los acidos grasos de la oxidacion, brindandote todos los beneficios cardiovasculares y cognitivos del omega-3.',
  '["Salud cardiovascular optima", "Funcion cerebral mejorada", "Reduccion de inflamacion", "Mejora el estado de animo", "Protege la vision", "Sin sabor a pescado"]'::jsonb,
  3
),
(
  'teralife-magnesio',
  'Teralife Magnesio',
  'Magnesio de alta biodisponibilidad para multiples funciones corporales.',
  'El Magnesio Teralife utiliza formas de magnesio de alta biodisponibilidad combinadas con nuestra nanotecnologia exclusiva. Este mineral esencial participa en mas de 300 reacciones enzimaticas en tu cuerpo, y nuestra formula asegura que obtengas el maximo beneficio en cada dosis.',
  '["Relajacion muscular profunda", "Mejor calidad del sueno", "Reduccion del estres y ansiedad", "Funcion nerviosa saludable", "Apoyo a la salud osea", "Equilibrio del sistema nervioso"]'::jsonb,
  4
),
(
  'teralife-probioticos',
  'Teralife Probioticos',
  'Probioticos avanzados para una flora intestinal equilibrada.',
  'Los Probioticos Teralife contienen cepas probioticas cuidadosamente seleccionadas y protegidas con nuestra tecnologia de nanoencapsulacion. Esta proteccion garantiza que las bacterias beneficiosas lleguen vivas a tu intestino, donde pueden colonizar y mejorar tu salud digestiva.',
  '["Salud digestiva optima", "Sistema inmune fortalecido", "Mejor absorcion de nutrientes", "Bienestar general mejorado", "Reduccion de hinchazón", "Equilibrio de la flora intestinal"]'::jsonb,
  5
),
(
  'teralife-vitamina-d',
  'Teralife Vitamina D',
  'Vitamina D3 con K2 para una absorcion optima de calcio.',
  'La Vitamina D Teralife combina vitamina D3 con vitamina K2 en una formula sinergica potenciada por nanotecnologia. Esta combinacion asegura que el calcio se dirija a los huesos y dientes, donde mas se necesita, mientras protege tus arterias y tejidos blandos.',
  '["Huesos y dientes fuertes", "Sistema inmune potenciado", "Estado de animo positivo", "Salud muscular optima", "Absorcion de calcio mejorada", "Proteccion cardiovascular"]'::jsonb,
  6
);
