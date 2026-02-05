-- ============================================
-- Create Storage Bucket for Product Images
-- ============================================

-- Create the bucket for product images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- ============================================
-- RLS Policies for Storage
-- ============================================

-- Anyone can view images (public bucket)
create policy "product_images_public_read"
on storage.objects for select
using (bucket_id = 'product-images');

-- Only admins can upload images
create policy "product_images_admin_insert"
on storage.objects for insert
with check (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Only admins can update images
create policy "product_images_admin_update"
on storage.objects for update
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Only admins can delete images
create policy "product_images_admin_delete"
on storage.objects for delete
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);
