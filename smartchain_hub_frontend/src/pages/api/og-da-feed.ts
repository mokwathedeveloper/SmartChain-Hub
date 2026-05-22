/**
 * GET /api/og-da-feed
 * Returns recent 0G DA events — the on-chain heartbeat of the agent economy.
 * Events are stored in Supabase `da_events` table (inserted by /api/og-da).
 * Falls back to recent transactions table if da_events table doesn't exist yet.
 *
 * Query params:
 *   limit  — default 30, max 100
 *   type   — filter by event type (optimization, multi_agent_coordination, etc.)
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { errMsg } from "@/utils/errors";
import { rateLimit, getClientIp } from "@/utils/rateLimit";

const supabase = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim(),
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  res.setHeader("Cache-Control", "public, s-maxage=5, stale-while-revalidate=10");

  if (!rateLimit(`og-da-feed:${getClientIp(req)}`, 120, 60_000)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  const limit  = Math.min(Number(req.query.limit) || 30, 100);
  const type   = req.query.type as string | undefined;

  try {
    // Try da_events table first
    let query = supabase
      .from("da_events")
      .select("id,type,blob_id,da_tx_hash,payload,created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (type) query = query.eq("type", type);

    const { data: daData, error: daError } = await query;

    if (!daError && daData && daData.length > 0) {
      return res.status(200).json({ events: daData, source: "da_events" });
    }

    // Fallback: synthesize events from transactions table
    const { data: txData } = await supabase
      .from("transactions")
      .select("id,route,amount,savings,status,storage_root,tx_hash,tee_verified,created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    const events = (txData || []).map(tx => ({
      id:         tx.id,
      type:       "optimization",
      blob_id:    tx.storage_root || (tx.id ? `0x${tx.id.replace(/-/g, "")}` : null),
      da_tx_hash: tx.tx_hash || null,
      payload: {
        route:       tx.route,
        amount:      tx.amount,
        savings:     tx.savings,
        status:      tx.status,
        tee_verified: tx.tee_verified,
      },
      created_at: tx.created_at,
    }));

    return res.status(200).json({ events, source: "transactions_fallback" });
  } catch (e: unknown) {
    console.error("og-da-feed error:", errMsg(e));
    return res.status(500).json({ error: "Failed to fetch DA feed" });
  }
}
