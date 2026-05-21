/**
 * GET /api/ai-health
 * Server-side proxy to the AI agent /health endpoint.
 * Keeps the browser on the same Vercel origin so no CORS headers are needed,
 * even when the Render service is cold-starting and returns a plain 503.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { errMsg } from "@/utils/errors";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const agentUrl = process.env.NEXT_PUBLIC_AI_AGENT_URL || "https://smartchain-ai-agent.onrender.com";
  try {
    const r = await fetch(`${agentUrl}/health`, { signal: AbortSignal.timeout(10000) });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (e: unknown) {
    return res.status(503).json({ status: "unavailable", error: errMsg(e) });
  }
}
