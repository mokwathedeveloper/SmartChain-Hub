-- Migration 006 — onramp payments tracking table

CREATE TABLE IF NOT EXISTS onramp_payments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address  TEXT NOT NULL,
  amount_usd      DECIMAL(10, 2) NOT NULL,
  a0gi_amount     TEXT NOT NULL,
  payment_method  TEXT NOT NULL CHECK (payment_method IN ('stripe', 'mpesa', 'bank')),
  tx_ref          TEXT NOT NULL UNIQUE,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  tx_hash         TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for wallet lookups
CREATE INDEX IF NOT EXISTS idx_onramp_wallet ON onramp_payments (wallet_address);
CREATE INDEX IF NOT EXISTS idx_onramp_status ON onramp_payments (status);

-- RLS: anyone can insert (webhook calls without auth), only owner can read
ALTER TABLE onramp_payments ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for webhook inserts)
CREATE POLICY "Service role full access on onramp_payments"
  ON onramp_payments
  USING (true)
  WITH CHECK (true);
