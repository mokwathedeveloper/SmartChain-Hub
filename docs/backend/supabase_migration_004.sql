-- Migration 004 — add missing columns to profiles table

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_fa_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS balance DECIMAL(12,2) DEFAULT 0.00;

-- Ensure all RLS policies exist for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure transactions policies are complete
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE USING (auth.uid() = user_id);

-- Ensure revenue_shares policies are complete
DROP POLICY IF EXISTS "Users can view own revenue shares" ON revenue_shares;
DROP POLICY IF EXISTS "Users can insert own revenue shares" ON revenue_shares;

CREATE POLICY "Users can view own revenue shares"
  ON revenue_shares FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own revenue shares"
  ON revenue_shares FOR INSERT WITH CHECK (auth.uid() = user_id);
