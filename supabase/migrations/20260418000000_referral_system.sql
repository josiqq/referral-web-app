-- ============================================
-- Referral System Migration
-- ============================================

-- ============================================
-- 1. Add referral columns to profiles
-- ============================================

alter table public.profiles
  add column if not exists referred_by uuid references public.profiles(id) on delete set null;

-- Index for fast tree lookups
create index if not exists idx_profiles_referred_by on public.profiles(referred_by);

-- ============================================
-- 2. Referral codes table (admin-generated, one-time use)
-- ============================================

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  used_by uuid references public.profiles(id) on delete set null,
  used_at timestamp with time zone,
  is_active boolean default true,
  notes text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.referral_codes enable row level security;

-- Admin can do everything
create policy "referral_codes_all_admin" on public.referral_codes
  for all using (public.is_admin());

-- Authenticated users can read active+unused codes (needed for sign-up validation)
create policy "referral_codes_select_active" on public.referral_codes
  for select using (
    auth.uid() is not null
    and is_active = true
    and used_by is null
  );

-- Indexes
create index if not exists idx_referral_codes_code on public.referral_codes(code);
create index if not exists idx_referral_codes_used_by on public.referral_codes(used_by);
create index if not exists idx_referral_codes_assigned_to on public.referral_codes(assigned_to);

-- ============================================
-- 3. Recursive function: full downline tree
-- Returns all descendants of a given user id
-- ============================================

create or replace function public.get_downline(root_id uuid)
returns table (
  id uuid,
  display_name text,
  email text,
  referred_by uuid,
  depth integer,
  created_at timestamp with time zone
)
language sql
security definer
set search_path = public
as $$
  with recursive tree as (
    select
      p.id,
      p.display_name,
      p.email,
      p.referred_by,
      1 as depth,
      p.created_at
    from public.profiles p
    where p.referred_by = root_id

    union all

    select
      p.id,
      p.display_name,
      p.email,
      p.referred_by,
      t.depth + 1,
      p.created_at
    from public.profiles p
    inner join tree t on p.referred_by = t.id
  )
  select * from tree
  order by depth, created_at;
$$;

-- ============================================
-- 4. Function to validate + consume a referral code
-- Called server-side during sign-up.
-- Returns the inviter profile id (assigned_to), or null if invalid.
-- ============================================

create or replace function public.consume_referral_code(
  p_code text,
  p_new_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inviter_id uuid;
  v_code_id uuid;
begin
  select rc.id, rc.assigned_to
  into v_code_id, v_inviter_id
  from public.referral_codes rc
  where rc.code = upper(trim(p_code))
    and rc.is_active = true
    and rc.used_by is null
  limit 1;

  if v_code_id is null then
    return null;
  end if;

  -- Mark code as used
  update public.referral_codes
  set
    used_by = p_new_user_id,
    used_at = now(),
    is_active = false
  where id = v_code_id;

  -- Link new user to their inviter
  if v_inviter_id is not null then
    update public.profiles
    set referred_by = v_inviter_id
    where id = p_new_user_id;
  end if;

  return v_inviter_id;
end;
$$;

-- ============================================
-- 5. Allow authenticated users to read profiles
--    (needed for tree display — names/emails of teammates)
-- ============================================

-- Drop overly restrictive own-only policy if needed
drop policy if exists "profiles_select_own" on public.profiles;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_select_team" on public.profiles
  for select using (auth.uid() is not null);
