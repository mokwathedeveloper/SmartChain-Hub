/**
 * POST /api/fine-tune
 * Fetches real transaction data from Supabase and sends to AI agent for fine-tuning.
 * Falls back to root_hashes if provided.
 * Requires a valid Supabase user session (Authorization: Bearer <access_token>).
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { errMsg } from "@/utils/errors";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase";
import { rateLimit, getClientIp } from "@/utils/rateLimit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  // Rate limit: 5 fine-tune calls per hour per IP
  if (!rateLimit(`fine-tune:${getClientIp(req)}`, 5, 3_600_000)) {
    return res.status(429).json({ ok: false, reason: "Too many requests — try again later" });
  }

  // Verify caller has a valid Supabase session
  const authHeader = req.headers.authorization || "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!accessToken) return res.status(401).json({ ok: false, reason: "Unauthorized" });

  const { data: { user }, error: authErr } = await supabase.auth.getUser(accessToken);
  if (authErr || !user) return res.status(401).json({ ok: false, reason: "Unauthorized" });

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const serviceKey  = (process.env.SUPABASE_SERVICE_KEY || "").trim();
  const aiAgentUrl  = (process.env.NEXT_PUBLIC_AI_AGENT_URL || "https://smartchain-ai-agent.onrender.com").trim();
  const { root_hashes = [], dry_run = false } = req.body || {};

  if (!serviceKey) {
    return res.status(503).json({
      ok:     false,
      reason: "Fine-tune unavailable — SUPABASE_SERVICE_KEY not configured",
    });
  }

  try {
    // Service role key required — bypasses RLS for cross-user reads.
    // Never fall back to the anon key here.
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: txs } = await supabase
      .from("transactions")
      .select("amount, optimized_fee, savings, route, storage_root, created_at")
      .not("savings", "is", null)
      .gt("amount", 0)
      .gt("savings", 0)
      .order("created_at", { ascending: false })
      .limit(100);

    type TxRecord = { amount?: number | string; optimized_fee?: number | string; savings?: number | string; route?: string; created_at?: string };
    type TxMapped = { amount: number; fee: number; savings: number; route: string; tee_verified: boolean; timestamp: number };
    const transactions = (txs || []).map((tx: TxRecord): TxMapped => ({
      amount:       parseFloat(String(tx.amount || 0)),
      fee:          parseFloat(String(tx.optimized_fee || 0)),
      savings:      parseFloat(String(tx.savings || 0)),
      route:        tx.route || "0G Chain Flash Route",
      tee_verified: false,
      timestamp:    new Date(tx.created_at ?? 0).getTime(),
    })).filter((tx: TxMapped) => tx.amount > 0 && tx.savings > 0);

    if (transactions.length < 10) {
      return res.status(422).json({
        ok: false,
        reason: "insufficient_samples",
        samples: transactions.length,
        min: 10,
        message: `Need at least 10 transactions with savings data. Found ${transactions.length}.`,
      });
    }

    if (dry_run) {
      return res.status(200).json({
        ok: true,
        dry_run: true,
        samples: transactions.length,
        message: `Found ${transactions.length} valid transactions for fine-tuning.`,
      });
    }

    // Send transactions directly to AI agent fine-tune endpoint
    const upstream = await fetch(`${aiAgentUrl}/fine-tune`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        root_hashes,
        transactions, // pass data directly
        dry_run,
      }),
      signal: AbortSignal.timeout(120000),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json({ ...data, samples: transactions.length });
  } catch (e: unknown) {
    return res.status(502).json({ ok: false, reason: `Fine-tune failed: ${errMsg(e)}`, samples: 0 });
  }
}
