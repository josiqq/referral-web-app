-- ============================================
-- Fix: public referral code validation function
-- Called pre-login so can't rely on RLS
-- ============================================

-- Drop the restrictive RLS policy that blocks anon users
drop policy if exists "referral_codes_select_active" on public.referral_codes;

-- Function callable without auth — only exposes valid/invalid, never leaks data
create or replace function public.check_referral_code(p_code text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.referral_codes
    where code = upper(trim(p_code))
      and is_active = true
      and used_by is null
  );
$$;

-- Grant execute to anon role so it works without a session
grant execute on function public.check_referral_code(text) to anon;
grant execute on function public.check_referral_code(text) to authenticated;

-- Re-add the select policy but only for authenticated users (for admin panel)
create policy "referral_codes_select_authenticated" on public.referral_codes
  for select using (auth.uid() is not null);
