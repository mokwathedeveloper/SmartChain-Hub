/**
 * GET /api/og-stats
 * Live aggregate stats from Supabase — replaces hardcoded landing page numbers.
 * Returns:
 *   totalOptimizations  — confirmed tx count
 *   totalSavingsUsd     — sum of savings column (stored as USD)
 *   activeUsers         — distinct users with at least one confirmed tx
 *   totalChainTxs       — optimizations that produced an on-chain hash
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { errMsg } from "@/utils/errors";
import { rateLimit, getClientIp } from "@/utils/rateLimit";

// Use service-role key server-side so we can do aggregate queries
const supabaseAdmin = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim(),
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  // Cache: 30s on CDN, 60s stale-while-revalidate
  res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");

  if (!rateLimit(`og-stats:${getClientIp(req)}`, 60, 60_000)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  try {
    const [optimizationsRes, savingsRes, usersRes, chainTxsRes] = await Promise.all([
      // Count confirmed optimizations
      supabaseAdmin
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("status", "confirmed"),

      // Sum of savings (USD)
      supabaseAdmin
        .from("transactions")
        .select("savings")
        .eq("status", "confirmed"),

      // Distinct active users
      supabaseAdmin
        .from("transactions")
        .select("user_id")
        .eq("status", "confirmed"),

      // Txs that landed on-chain (have a tx_hash)
      supabaseAdmin
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("status", "confirmed")
        .not("tx_hash", "is", null),
    ]);

    const totalOptimizations = optimizationsRes.count ?? 0;

    const totalSavingsUsd = (savingsRes.data ?? []).reduce(
      (acc: number, row: { savings?: number | null }) => acc + (Number(row.savings) || 0),
      0,
    );

    const activeUsers = new Set(
      (usersRes.data ?? []).map((r: { user_id: string }) => r.user_id),
    ).size;

    const totalChainTxs = chainTxsRes.count ?? 0;

    return res.status(200).json({
      totalOptimizations,
      totalSavingsUsd: Math.round(totalSavingsUsd * 100) / 100,
      activeUsers,
      totalChainTxs,
    });
  } catch (e: unknown) {
    console.error("og-stats error:", errMsg(e));
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
}
