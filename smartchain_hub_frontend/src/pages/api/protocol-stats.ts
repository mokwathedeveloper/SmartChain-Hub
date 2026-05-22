/**
 * GET /api/protocol-stats
 * Returns global protocol-wide traction metrics.
 * Uses service role key to bypass RLS — read-only, no user data exposed.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { errMsg } from "@/utils/errors";

const serviceKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ""
).trim();

const admin = serviceKey
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
  : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  if (!admin) {
    return res.status(200).json({
      totalTx: 0, totalVolume: 0, totalSavings: 0,
      teeVerified: 0, daAnchored: 0, agentsActive: 0,
    });
  }

  try {
    const [txRes, daRes] = await Promise.all([
      admin
        .from("transactions")
        .select("amount, savings, tee_verified, user_id"),
      admin
        .from("da_events")
        .select("id", { count: "exact", head: true }),
    ]);

    const rows = txRes.data ?? [];
    let totalVolume  = 0;
    let totalSavings = 0;
    let teeVerified  = 0;
    const userSet    = new Set<string>();

    for (const r of rows) {
      const amt = Number(r.amount  || 0);
      const sav = Number(r.savings || 0);
      totalVolume  += amt;
      // Cap savings at 5% of amount — same rule as the UI cap
      totalSavings += amt > 0 ? Math.min(Math.max(0, sav), amt * 0.05) : Math.max(0, sav);
      if (r.tee_verified) teeVerified++;
      if (r.user_id) userSet.add(r.user_id as string);
    }

    return res.status(200).json({
      totalTx:      rows.length,
      totalVolume,
      totalSavings,
      teeVerified,
      daAnchored:   daRes.count ?? 0,
      agentsActive: userSet.size,
    });
  } catch (e) {
    return res.status(500).json({ error: errMsg(e) });
  }
}
