-- ============================================
-- Advisor Settings Table
-- Stores all configurable data for the landing:
-- profile photo, contact info, bio, stats
-- ============================================

create table if not exists public.advisor_settings (
  id uuid primary key default gen_random_uuid(),
  -- Identity
  display_name text not null default 'Charles Aguilera',
  role_title text not null default 'Asesor de Bienestar Teralife',
  bio text,
  -- Photo
  photo_url text,
  -- Contact
  whatsapp text not null default '+595986259004',
  email text,
  location text,
  -- Stats shown in hero
  stat_clients text default '500+',
  stat_experience text default '5+',
  stat_products text default '20+',
  -- Whatsapp greeting message
  whatsapp_message text default 'Hola! Me interesa conocer más sobre los productos Teralife.',
  -- Office hours
  office_hours text default 'Lunes a Viernes: 9am - 6pm',
  -- Metadata
  updated_at timestamp with time zone default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

-- Only one row ever (singleton)
alter table public.advisor_settings enable row level security;

-- Public can read
create policy "advisor_settings_public_read" on public.advisor_settings
  for select using (true);

-- Only admin can write
create policy "advisor_settings_admin_write" on public.advisor_settings
  for all using (public.is_admin());

-- Insert default row
insert into public.advisor_settings (id)
values ('00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

-- ============================================
-- Storage bucket for advisor assets (profile photo)
-- ============================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'advisor-assets',
  'advisor-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "advisor_assets_public_read"
on storage.objects for select
using (bucket_id = 'advisor-assets');

create policy "advisor_assets_admin_insert"
on storage.objects for insert
with check (
  bucket_id = 'advisor-assets'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

create policy "advisor_assets_admin_update"
on storage.objects for update
using (
  bucket_id = 'advisor-assets'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

create policy "advisor_assets_admin_delete"
on storage.objects for delete
using (
  bucket_id = 'advisor-assets'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);
