/**
 * POST /api/fine-tune
 * Calls the AI agent directly for fine-tuning.
 * Falls back to backend if AI agent URL is not set.
 */
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  // Call AI agent directly — avoids dependency on undeployed backend
  const aiAgentUrl = (process.env.NEXT_PUBLIC_AI_AGENT_URL || "https://smartchain-ai-agent.onrender.com").trim();

  try {
    const upstream = await fetch(`${aiAgentUrl}/fine-tune`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(req.body),
      signal:  AbortSignal.timeout(120000), // 2 min timeout for fine-tuning
    });
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (e: any) {
    return res.status(502).json({ ok: false, reason: `AI agent unreachable: ${e.message}`, samples: 0 });
  }
}
