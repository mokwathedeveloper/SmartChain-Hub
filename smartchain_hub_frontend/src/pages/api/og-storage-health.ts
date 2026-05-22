/**
 * GET /api/og-storage-health
 * Server-side proxy to the 0G Storage indexer.
 * Exists solely to avoid browser CORS blocks — the indexer has no
 * Access-Control-Allow-Origin header so direct browser fetches fail.
 */
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  res.setHeader("Cache-Control", "no-store");

  try {
    const r = await fetch("https://indexer-storage-testnet-standard.0g.ai/nodes", {
      signal: AbortSignal.timeout(6_000),
    });
    if (!r.ok) {
      return res.status(200).json({ status: "degraded", detail: `Indexer HTTP ${r.status}` });
    }
    let nodes: unknown;
    try {
      nodes = await r.json();
    } catch {
      return res.status(200).json({ status: "degraded", detail: "Storage indexer returned invalid data" });
    }
    if (!Array.isArray(nodes)) {
      return res.status(200).json({ status: "degraded", detail: "Storage indexer returned invalid data" });
    }
    return res.status(200).json({ status: "live", nodeCount: nodes.length });
  } catch {
    return res.status(200).json({ status: "degraded", detail: "Storage indexer unreachable" });
  }
}
