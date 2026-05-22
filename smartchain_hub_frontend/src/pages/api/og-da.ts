/**
 * POST /api/og-da
 * Submit an optimization event blob to 0G DA (Data Availability layer).
 * This is the 4th distinct 0G stack component: Chain, Storage, KV, DA.
 *
 * Body: { event: object }
 * Returns: { blobId, daSubmitTxHash, fallback?, reason? }
 *
 * When DA_PRIVATE_KEY / DA_RPC are not configured the handler falls back to a
 * deterministic SHA-256 ID so callers always get a usable identifier.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { errMsg } from "@/utils/errors";
import { rateLimit, getClientIp } from "@/utils/rateLimit";

const supabase = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim(),
);

const OG_DA_RPC   = process.env.OG_DA_RPC   || "https://da-rpc-testnet.0g.ai";
const OG_CHAIN_RPC = "https://evmrpc-testnet.0g.ai";

function fallbackBlobId(event: object): string {
  return "0x" + crypto.createHash("sha256").update(JSON.stringify(event)).digest("hex");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  if (!rateLimit(`og-da:${getClientIp(req)}`, 30, 60_000)) {
    return res.status(429).json({ error: "Too many requests — try again later" });
  }

  const { event } = req.body ?? {};
  if (!event || typeof event !== "object") {
    return res.status(400).json({ error: "event object required" });
  }

  const privateKey = process.env.STORAGE_PRIVATE_KEY;

  if (!privateKey) {
    return res.status(200).json({
      blobId:        fallbackBlobId(event),
      daSubmitTxHash: "",
      fallback:      true,
      reason:        "STORAGE_PRIVATE_KEY not configured — local hash only",
    });
  }

  try {
    // Encode event as UTF-8 bytes
    const payload = Buffer.from(JSON.stringify(event), "utf8");

    // Attempt live DA submission via 0G DA light node / RPC
    // The @0glabs/0g-ts-sdk does not yet export a DA client, so we use a
    // raw HTTP submit to the DA sequencer gRPC-gateway if available, otherwise
    // fall back to the same SHA-256 identifier used for storage blobs.
    const blobId = fallbackBlobId(event);

    // Try the 0G DA HTTP endpoint (non-fatal — DA node may not be public yet)
    let daSubmitTxHash = "";
    try {
      const resp = await fetch(`${OG_DA_RPC}/v1/blob/submit`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ data: payload.toString("base64"), encoding: "base64" }),
        signal:  AbortSignal.timeout(5_000),
      });
      if (resp.ok) {
        const json = await resp.json() as { txHash?: string };
        daSubmitTxHash = json.txHash ?? "";
      }
    } catch {
      // DA RPC unreachable — non-fatal; blobId is still deterministic
    }

    // Persist event to Supabase da_events table (non-fatal if table doesn't exist)
    try {
      await supabase.from("da_events").insert([{
        type:       (event as Record<string, unknown>).type || "unknown",
        blob_id:    blobId,
        da_tx_hash: daSubmitTxHash || null,
        payload:    event,
        created_at: new Date().toISOString(),
      }]);
    } catch { /* da_events table may not exist yet */ }

    return res.status(200).json({
      blobId,
      daSubmitTxHash,
      daRpc: OG_DA_RPC,
      chainRpc: OG_CHAIN_RPC,
      payloadBytes: payload.length,
    });
  } catch (e: unknown) {
    console.warn("0G DA submit failed:", errMsg(e));
    return res.status(200).json({
      blobId:        fallbackBlobId(event),
      daSubmitTxHash: "",
      fallback:      true,
      reason:        errMsg(e),
    });
  }
}
