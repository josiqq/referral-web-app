-- ============================================
-- Auto-create Profile on User Signup
-- ============================================

-- Function to generate a unique referral code
create or replace function public.generate_referral_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$;

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_referral_code text;
  sponsor_code text;
  sponsor_user_id uuid;
begin
  -- Generate unique referral code
  loop
    new_referral_code := generate_referral_code();
    exit when not exists (select 1 from public.profiles where referral_code = new_referral_code);
  end loop;

  -- Insert profile
  -- Note: frontend sends 'full_name' in metadata
  insert into public.profiles (id, email, display_name, referral_code, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new_referral_code,
    coalesce(new.raw_user_meta_data ->> 'role', 'user'),
    'pending'
  )
  on conflict (id) do nothing;

  -- Check if user was referred by someone
  -- Note: frontend sends 'referred_by_code' in metadata
  sponsor_code := coalesce(new.raw_user_meta_data ->> 'referred_by_code', new.raw_user_meta_data ->> 'referral_code');
  
  if sponsor_code is not null and sponsor_code != '' then
    -- Find the sponsor
    select id into sponsor_user_id 
    from public.profiles 
    where referral_code = sponsor_code;
    
    if sponsor_user_id is not null then
      -- Create referral edge (level 1 = direct referral)
      insert into public.referral_edges (sponsor_id, referred_id, level)
      values (sponsor_user_id, new.id, 1)
      on conflict (sponsor_id, referred_id) do nothing;
      
      -- Create signup conversion event for new user
      insert into public.conversion_events (user_id, event_type, event_data, points_awarded)
      values (new.id, 'signup', jsonb_build_object('sponsor_code', sponsor_code), 100);
      
      -- Create referral bonus event for sponsor
      insert into public.conversion_events (user_id, event_type, event_data, points_awarded)
      values (sponsor_user_id, 'referral_bonus', jsonb_build_object('referred_user_id', new.id), 200);
      
      -- Update points for both users
      update public.profiles set points_balance = points_balance + 100 where id = new.id;
      update public.profiles set points_balance = points_balance + 200 where id = sponsor_user_id;
      
      -- Log in reward ledger
      insert into public.reward_ledger (user_id, amount, type, description)
      values (new.id, 100, 'earn', 'Signup bonus');
      
      insert into public.reward_ledger (user_id, amount, type, description, reference_id)
      values (sponsor_user_id, 200, 'earn', 'Referral bonus for new signup', new.id);
    end if;
  end if;

  return new;
end;
$$;

-- Drop existing trigger if exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
