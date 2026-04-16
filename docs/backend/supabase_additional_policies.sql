-- ==========================================
-- SmartChain Hub: Additional SQL Policies
-- ==========================================
-- INSTRUCTIONS: 
-- 1. Log in to your Supabase Dashboard.
-- 2. Go to the "SQL Editor" section.
-- 3. Paste the entire content of this file and click "Run".
-- ==========================================

-- 1. Allow users to insert their own transactions
-- Fixes the 403 Forbidden error when clicking "Confirm & Execute"
CREATE POLICY "Users can insert own transactions" 
ON transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Allow users to update their own profiles (for balance updates)
-- Fixes the error when updating full name or claiming revenue
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profiles" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 3. Allow users to update their own revenue shares (to mark as claimed)
-- Fixes the error when clicking "Claim Earnings"
CREATE POLICY "Users can update own revenue shares" 
ON revenue_shares FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Enable public read access for transactions (Optional, for public activity feed)
-- Only if you want users to see each others hashes (amounts remain private via RLS)
-- CREATE POLICY "Public can view transaction hashes" ON transactions FOR SELECT USING (true);
