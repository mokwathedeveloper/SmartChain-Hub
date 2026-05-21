/**
 * POST /api/ai-optimize
 * Server-side proxy to the AI agent /optimize endpoint.
 * Keeps the browser on the same Vercel origin so no CORS headers are needed,
 * even when the Render service is cold-starting and returns a plain 503.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { errMsg } from "@/utils/errors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const agentUrl = process.env.NEXT_PUBLIC_AI_AGENT_URL || "https://smartchain-ai-agent.onrender.com";
  try {
    const r = await fetch(`${agentUrl}/optimize`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(req.body),
      signal:  AbortSignal.timeout(30000),
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (e: unknown) {
    return res.status(503).json({ error: errMsg(e) });
  }
}
