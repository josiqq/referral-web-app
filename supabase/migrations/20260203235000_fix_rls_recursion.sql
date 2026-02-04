-- ============================================
-- Fix: RLS infinite recursion in profiles table
-- ============================================
-- Problem: The admin policy on profiles references the profiles table itself,
-- causing infinite recursion when checking if a user is an admin.

-- Drop the problematic policies
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "referral_edges_select_admin" on public.referral_edges;
drop policy if exists "reward_ledger_select_admin" on public.reward_ledger;
drop policy if exists "conversion_events_select_admin" on public.conversion_events;

-- Create a security definer function to check admin status
-- This avoids RLS checks when verifying admin role
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

-- Recreate admin policies using the function
create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());

create policy "referral_edges_select_admin" on public.referral_edges
  for select using (public.is_admin());

create policy "reward_ledger_select_admin" on public.reward_ledger
  for select using (public.is_admin());

create policy "conversion_events_select_admin" on public.conversion_events
  for select using (public.is_admin());
