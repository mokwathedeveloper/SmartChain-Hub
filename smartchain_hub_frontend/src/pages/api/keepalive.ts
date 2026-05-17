/**
 * GET /api/keepalive
 * Pings the AI agent to prevent Render free tier cold starts.
 * Calls /optimize (not just /health) so TensorFlow is loaded and kept warm.
 * Called by Vercel cron every 14 minutes (see vercel.json).
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { errMsg } from "@/utils/errors";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const agentUrl = process.env.NEXT_PUBLIC_AI_AGENT_URL || "https://smartchain-ai-agent.onrender.com";
  try {
    // Call /optimize with a tiny amount — this loads TF and keeps it warm in memory
    const r = await fetch(`${agentUrl}/optimize`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ amount: 100, priority: "efficiency" }),
      signal:  AbortSignal.timeout(25000),
    });
    const data = await r.json();
    return res.status(200).json({ ok: true, warmed: true, agent: data });
  } catch (e: unknown) {
    // Also fall back to /health ping so we at least keep the process alive
    try {
      const h = await fetch(`${agentUrl}/health`, { signal: AbortSignal.timeout(8000) });
      const health = await h.json();
      return res.status(200).json({ ok: true, warmed: false, agent: health });
    } catch {
      return res.status(200).json({ ok: false, error: errMsg(e) });
    }
  }
}
