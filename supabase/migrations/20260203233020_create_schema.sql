-- ============================================
-- Referral Program Database Schema
-- ============================================

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  referral_code text unique not null,
  role text default 'user' check (role in ('user', 'admin')),
  status text default 'pending' check (status in ('pending', 'active', 'qualified')),
  points_balance integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Referral edges table (stores referral relationships)
-- sponsor_id is the user who referred, referred_id is the new user
create table if not exists public.referral_edges (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid not null references public.profiles(id) on delete cascade,
  referred_id uuid not null references public.profiles(id) on delete cascade,
  level integer default 1,
  created_at timestamp with time zone default now(),
  unique(sponsor_id, referred_id)
);

-- 3. Invitations table (tracks sent invitations)
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  email text,
  status text default 'pending' check (status in ('pending', 'accepted', 'expired')),
  created_at timestamp with time zone default now()
);

-- 4. Reward ledger (tracks all point transactions)
create table if not exists public.reward_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  type text not null check (type in ('earn', 'redeem', 'bonus', 'adjustment')),
  description text,
  reference_id uuid,
  created_at timestamp with time zone default now()
);

-- 5. Conversion events (tracks real actions that trigger rewards)
create table if not exists public.conversion_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null check (event_type in ('signup', 'purchase', 'subscription', 'referral_bonus', 'manual')),
  event_data jsonb default '{}',
  points_awarded integer default 0,
  processed boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.referral_edges enable row level security;
alter table public.invitations enable row level security;
alter table public.reward_ledger enable row level security;
alter table public.conversion_events enable row level security;

-- ============================================
-- RLS Policies for Profiles
-- ============================================

-- Users can view their own profile
create policy "profiles_select_own" on public.profiles 
  for select using (auth.uid() = id);

-- Users can update their own profile (but not role or points_balance)
create policy "profiles_update_own" on public.profiles 
  for update using (auth.uid() = id);

-- Admins can view all profiles
create policy "profiles_select_admin" on public.profiles 
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow insert during signup (via trigger)
create policy "profiles_insert_own" on public.profiles 
  for insert with check (auth.uid() = id);

-- ============================================
-- RLS Policies for Referral Edges
-- ============================================

-- Users can see their downline (where they are sponsor)
create policy "referral_edges_select_sponsor" on public.referral_edges 
  for select using (sponsor_id = auth.uid());

-- Users CANNOT see their upline (who referred them) - this is critical for privacy
-- No policy for referred_id = auth.uid() on select

-- Admins can view all referral edges
create policy "referral_edges_select_admin" on public.referral_edges 
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- System can insert referral edges
create policy "referral_edges_insert" on public.referral_edges 
  for insert with check (true);

-- ============================================
-- RLS Policies for Invitations
-- ============================================

-- Users can view their own sent invitations
create policy "invitations_select_own" on public.invitations 
  for select using (sender_id = auth.uid());

-- Users can create invitations
create policy "invitations_insert_own" on public.invitations 
  for insert with check (sender_id = auth.uid());

-- ============================================
-- RLS Policies for Reward Ledger
-- ============================================

-- Users can view their own reward history
create policy "reward_ledger_select_own" on public.reward_ledger 
  for select using (user_id = auth.uid());

-- Admins can view all
create policy "reward_ledger_select_admin" on public.reward_ledger 
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can insert
create policy "reward_ledger_insert_admin" on public.reward_ledger 
  for insert with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- RLS Policies for Conversion Events
-- ============================================

-- Users can view their own events
create policy "conversion_events_select_own" on public.conversion_events 
  for select using (user_id = auth.uid());

-- Admins can view all
create policy "conversion_events_select_admin" on public.conversion_events 
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can insert events
create policy "conversion_events_insert_admin" on public.conversion_events 
  for insert with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- Indexes for Performance
-- ============================================

create index if not exists idx_profiles_referral_code on public.profiles(referral_code);
create index if not exists idx_referral_edges_sponsor on public.referral_edges(sponsor_id);
create index if not exists idx_referral_edges_referred on public.referral_edges(referred_id);
create index if not exists idx_reward_ledger_user on public.reward_ledger(user_id);
create index if not exists idx_conversion_events_user on public.conversion_events(user_id);
