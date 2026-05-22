/**
 * GET /api/proof-feed
 * Returns the most recent TEE-attested optimizations (global, not user-specific).
 * Used by the /proof page as the publicly verifiable evidence feed.
 *
 * Query params:
 *   limit  — number of records (default 20, max 50)
 *   offset — pagination offset
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { errMsg } from "@/utils/errors";
import { rateLimit, getClientIp } from "@/utils/rateLimit";
import { ACTIVE_CHAIN } from "@/utils/chains";

// Accept both naming conventions: the Supabase standard name and the legacy
// name that was set on Vercel before the standard name was adopted.
const serviceKey =
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "").trim();

const supabaseAdmin = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
  serviceKey,
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  if (!serviceKey) {
    return res.status(500).json({ error: "Server configuration error: SUPABASE_SERVICE_ROLE_KEY required" });
  }

  res.setHeader("Cache-Control", "public, s-maxage=15, stale-while-revalidate=30");

  if (!rateLimit(`proof-feed:${getClientIp(req)}`, 60, 60_000)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  const limit  = Math.min(Number(req.query.limit)  || 20, 50);
  const offset = Math.max(Number(req.query.offset) || 0,  0);

  try {
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("id,tx_hash,amount,savings,optimized_fee,route,status,storage_root,storage_scan_url,tee_verified,tee_proof,tee_signer,provider_id,ml_engine,zk_commitment,created_at")
      .eq("status", "confirmed")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const proofs = (data || []).map(row => ({
      id:              row.id,
      txHash:          row.tx_hash          || null,
      explorerUrl:     row.tx_hash          ? ACTIVE_CHAIN.explorerTx(row.tx_hash) : null,
      amount:          Number(row.amount    || 0),
      savings:         Number(row.savings   || 0),
      fee:             Number(row.optimized_fee || 0),
      route:           row.route            || "—",
      storageRoot:     row.storage_root     || null,
      storageScanUrl:  row.storage_scan_url || null,
      teeVerified:     row.tee_verified     ?? false,
      teeProof:        row.tee_proof        || null,
      teeSigner:       row.tee_signer       || null,
      providerId:      row.provider_id      || null,
      mlEngine:        row.ml_engine        || null,
      zkCommitment:    row.zk_commitment    || null,
      timestamp:       row.created_at,
    }));

    // Global stats for the proof page header
    const { count: totalVerified } = await supabaseAdmin
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed")
      .eq("tee_verified", true);

    const { count: totalConfirmed } = await supabaseAdmin
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed");

    return res.status(200).json({
      proofs,
      meta: {
        total:       totalConfirmed   ?? 0,
        teeVerified: totalVerified    ?? 0,
        chainName:   ACTIVE_CHAIN.name,
        chainId:     ACTIVE_CHAIN.chainId,
        explorer:    ACTIVE_CHAIN.explorer,
        offset,
        limit,
      },
    });
  } catch (e: unknown) {
    console.error("proof-feed error:", errMsg(e));
    return res.status(500).json({ error: "Failed to fetch proof feed" });
  }
}
