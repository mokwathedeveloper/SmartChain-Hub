-- Migration 003 — add missing INSERT/UPDATE policies

-- Drop if exists first to avoid duplicate errors
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own revenue shares" ON revenue_shares;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Transactions
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Revenue shares
CREATE POLICY "Users can insert own revenue shares"
  ON revenue_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Profiles
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
