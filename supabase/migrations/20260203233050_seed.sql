-- ============================================
-- Seed Data for Testing (3-level network)
-- ============================================
-- Note: This creates mock data for testing purposes
-- In production, users are created through the auth flow

-- For testing, we'll create some mock conversion events and reward entries
-- The actual user creation happens through Supabase Auth

-- Sample reward events (will be associated with real users once they sign up)
-- These are templates that can be used for testing

-- Create a function to generate test data for a user
create or replace function public.generate_test_activity(user_uuid uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Add some sample conversion events
  insert into public.conversion_events (user_id, event_type, event_data, points_awarded, processed, created_at)
  values 
    (user_uuid, 'purchase', '{"amount": 99.99, "product": "Premium Plan"}'::jsonb, 500, true, now() - interval '7 days'),
    (user_uuid, 'purchase', '{"amount": 49.99, "product": "Basic Plan"}'::jsonb, 250, true, now() - interval '14 days'),
    (user_uuid, 'subscription', '{"plan": "monthly", "price": 29.99}'::jsonb, 300, true, now() - interval '21 days');
  
  -- Add corresponding reward ledger entries
  insert into public.reward_ledger (user_id, amount, type, description, created_at)
  values
    (user_uuid, 500, 'earn', 'Purchase: Premium Plan', now() - interval '7 days'),
    (user_uuid, 250, 'earn', 'Purchase: Basic Plan', now() - interval '14 days'),
    (user_uuid, 300, 'earn', 'Subscription bonus', now() - interval '21 days'),
    (user_uuid, -100, 'redeem', 'Redeemed: $10 Gift Card', now() - interval '3 days');
  
  -- Update total points
  update public.profiles 
  set points_balance = points_balance + 950,
      status = 'active'
  where id = user_uuid;
end;
$$;
