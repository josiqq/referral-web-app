-- ============================================
-- Add Product Categories with Image and Description
-- ============================================

-- ============================================
-- 1. Product Categories Table
-- ============================================

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  image_url text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.product_categories enable row level security;

-- RLS Policies for Product Categories
create policy "product_categories_select_public" on public.product_categories
  for select using (is_active = true);

create policy "product_categories_select_admin" on public.product_categories
  for select using (public.is_admin());

create policy "product_categories_insert_admin" on public.product_categories
  for insert with check (public.is_admin());

create policy "product_categories_update_admin" on public.product_categories
  for update using (public.is_admin());

create policy "product_categories_delete_admin" on public.product_categories
  for delete using (public.is_admin());

-- ============================================
-- 2. Add category_id to Products Table (nullable)
-- ============================================

alter table public.products
add column if not exists category_id uuid references public.product_categories(id) on delete set null;

-- ============================================
-- 3. Indexes for Performance
-- ============================================

create index if not exists idx_product_categories_slug on public.product_categories(slug);
create index if not exists idx_product_categories_display_order on public.product_categories(display_order);
create index if not exists idx_product_categories_is_active on public.product_categories(is_active);
create index if not exists idx_products_category_id on public.products(category_id);
