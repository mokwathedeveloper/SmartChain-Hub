/**
 * POST /api/transactions/fine-tune
 * Proxies to the Express backend which proxies to the AI agent.
 * This allows the frontend to trigger fine-tuning without CORS issues.
 */
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

  try {
    const upstream = await fetch(`${backendUrl}/api/transactions/fine-tune`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(req.body),
    });
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (e: any) {
    return res.status(502).json({ ok: false, reason: `Backend unreachable: ${e.message}` });
  }
}
