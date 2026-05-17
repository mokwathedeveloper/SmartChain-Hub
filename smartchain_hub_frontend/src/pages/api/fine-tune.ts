/**
 * POST /api/fine-tune
 * Fetches real transaction data from Supabase and sends to AI agent for fine-tuning.
 * Falls back to root_hashes if provided.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const aiAgentUrl = (process.env.NEXT_PUBLIC_AI_AGENT_URL || "https://smartchain-ai-agent.onrender.com").trim();
  const { root_hashes = [], dry_run = false } = req.body || {};

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const serviceKey  = (process.env.SUPABASE_SERVICE_KEY || "").trim();

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

    const transactions = (txs || []).map((tx: any) => ({
      amount:       parseFloat(tx.amount || 0),
      fee:          parseFloat(tx.optimized_fee || 0),
      savings:      parseFloat(tx.savings || 0),
      route:        tx.route || "0G Chain Flash Route",
      tee_verified: false,
      timestamp:    new Date(tx.created_at).getTime(),
    })).filter((tx: any) => tx.amount > 0 && tx.savings > 0);

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
  } catch (e: any) {
    return res.status(502).json({ ok: false, reason: `Fine-tune failed: ${e.message}`, samples: 0 });
  }
}
