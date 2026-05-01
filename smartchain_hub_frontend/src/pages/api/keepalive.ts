/**
 * GET /api/keepalive
 * Pings the AI agent to prevent Render free tier cold starts.
 * Call this from a cron job or Vercel cron.
 */
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const agentUrl = process.env.NEXT_PUBLIC_AI_AGENT_URL || "https://smartchain-ai-agent.onrender.com";
  try {
    const r = await fetch(`${agentUrl}/health`, { signal: AbortSignal.timeout(10000) });
    const data = await r.json();
    return res.status(200).json({ ok: true, agent: data });
  } catch (e: any) {
    return res.status(200).json({ ok: false, error: e.message });
  }
}
