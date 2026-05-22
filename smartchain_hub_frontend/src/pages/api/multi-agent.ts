/**
 * POST /api/multi-agent
 * Orchestrates 3 specialized AI agents working in parallel:
 *   Agent 1 — Route Optimizer    (existing TF model via ai-optimize)
 *   Agent 2 — Market Data Agent  (congestion/price/liquidity heuristics)
 *   Agent 3 — Risk Assessor      (MEV, slippage, counterparty risk scoring)
 *
 * Each agent "pays" the next via micropayment records logged to Supabase.
 * The frontend renders the full payment DAG showing agent-to-agent economy.
 *
 * Body: { amount: number; priority: string; userId?: string }
 * Returns: { result, dag, agents, latencyMs }
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { rateLimit, getClientIp } from "@/utils/rateLimit";

const supabase = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim(),
);

interface AgentTask {
  agentId:    string;
  name:       string;
  role:       string;
  startMs:    number;
  endMs:      number;
  latencyMs:  number;
  output:     Record<string, unknown>;
  paymentWei: number;
  paidBy:     string | null;
}

const OG_GALILEO_RPC = "https://evmrpc-testnet.0g.ai";

async function rpcCall<T>(method: string, params: unknown[]): Promise<T | null> {
  try {
    const res = await fetch(OG_GALILEO_RPC, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      signal:  AbortSignal.timeout(5_000),
    });
    const json = await res.json() as { result?: T; error?: unknown };
    if (json.error || json.result === undefined) return null;
    return json.result;
  } catch {
    return null;
  }
}

// Agent 2: Market Data — real 0G Galileo Testnet chain state
async function runMarketDataAgent(amount: number): Promise<{ congestion: number; gasPrice: number; liquidity: string }> {
  const [gasPriceHex, block] = await Promise.all([
    rpcCall<string>("eth_gasPrice", []),
    rpcCall<{ gasUsed: string; gasLimit: string }>("eth_getBlockByNumber", ["latest", false]),
  ]);

  // Gas price in Gwei (4 dp); fallback 0.001 Gwei
  let gasPrice = 0.001;
  if (gasPriceHex) {
    const wei = Number(BigInt(gasPriceHex));
    gasPrice  = Math.round((wei / 1e9) * 10_000) / 10_000 || 0.001;
  }

  // Block gas utilisation → congestion %; fallback 40%
  let congestion = 40;
  if (block?.gasUsed && block?.gasLimit) {
    const used  = parseInt(block.gasUsed,  16);
    const limit = parseInt(block.gasLimit, 16);
    if (limit > 0) congestion = Math.min(Math.round((used / limit) * 100), 100);
  }

  const liquidity = amount > 10_000 ? "Medium" : "High";
  return { congestion, gasPrice, liquidity };
}

// Agent 3: Risk Assessor (deterministic from real congestion data)
async function runRiskAgent(
  amount: number,
  congestion: number,
  route: string,
): Promise<{ riskScore: number; mevRisk: string; slippagePct: number; verdict: string }> {
  const mevRisk    = congestion > 55 ? "Medium" : "Low";
  const slippagePct = Math.round((0.01 + (congestion / 100) * 0.04) * 1000) / 1000;
  const riskScore  = Math.min(Math.round(congestion / 10 + (amount > 50000 ? 2 : 0)), 9);
  const verdict    = riskScore < 4 ? "Safe to proceed" : riskScore < 7 ? "Proceed with caution" : "High risk — consider splitting";
  return { riskScore, mevRisk, slippagePct, verdict };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  if (!rateLimit(`multi-agent:${getClientIp(req)}`, 20, 60_000)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  const { amount, priority, userId } = req.body as { amount?: number; priority?: string; userId?: string };
  if (!amount || isNaN(Number(amount))) {
    return res.status(400).json({ error: "amount required" });
  }

  const orchestratorStart = Date.now();

  // ── Agent 1: Route Optimizer (existing AI agent) ──────────────────────
  const a1Start = Date.now();
  let a1Output: Record<string, unknown> = {};
  try {
    const agentUrl = process.env.NEXT_PUBLIC_AI_AGENT_URL || "https://smartchain-ai-agent.onrender.com";
    const r = await fetch(`${agentUrl}/optimize`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ amount, priority: priority || "efficiency" }),
      signal:  AbortSignal.timeout(25_000),
    });
    a1Output = await r.json() as Record<string, unknown>;
  } catch {
    const amt = Number(amount);
    const fee = Math.round(amt * 0.003 * 100) / 100;
    a1Output = {
      route:        "0G Chain Flash Route",
      fee,
      savings:      Math.round(amt * 0.002 * 100) / 100,  // always < fee
      confidence:   91,
      tee_verified: false,
      fallback:     true,
    };
  }
  const a1End = Date.now();

  // ── Agent 2: Market Data (must complete first — risk agent needs real congestion) ──
  const a2Start = Date.now();
  const marketData = await runMarketDataAgent(Number(amount));
  const a2End = Date.now();

  // ── Agent 3: Risk Assessor with actual congestion from Agent 2 ───────────────
  const a3Start = Date.now();
  const riskData = await runRiskAgent(Number(amount), marketData.congestion, String(a1Output.route || ""));
  const a3End = Date.now();

  // ── Micropayment amounts (demonstration values in wei) ─────────────────
  const MICROPAY_MARKET  = 500_000_000_000;  // 0.0000005 A0GI
  const MICROPAY_RISK    = 300_000_000_000;  // 0.0000003 A0GI

  const agents: AgentTask[] = [
    {
      agentId:    "sch-route-optimizer-v2",
      name:       "Route Optimizer",
      role:       "Primary AI inference via 0G Compute TeeML — finds optimal fee path",
      startMs:    a1Start - orchestratorStart,
      endMs:      a1End   - orchestratorStart,
      latencyMs:  a1End - a1Start,
      output:     a1Output,
      paymentWei: MICROPAY_MARKET + MICROPAY_RISK,
      paidBy:     null,
    },
    {
      agentId:    "sch-market-data-v1",
      name:       "Market Data Agent",
      role:       "Network congestion heuristics and gas price estimation (simulation-based; 0G indexer integration planned)",
      startMs:    a2Start - orchestratorStart,
      endMs:      a2End   - orchestratorStart,
      latencyMs:  a2End - a2Start,
      output:     marketData as unknown as Record<string, unknown>,
      paymentWei: MICROPAY_MARKET,
      paidBy:     "sch-route-optimizer-v2",
    },
    {
      agentId:    "sch-risk-assessor-v1",
      name:       "Risk Assessor",
      role:       "MEV, slippage, and counterparty risk scoring for transaction safety",
      startMs:    a3Start - orchestratorStart,
      endMs:      a3End   - orchestratorStart,
      latencyMs:  a3End - a3Start,
      output:     riskData as unknown as Record<string, unknown>,
      paymentWei: MICROPAY_RISK,
      paidBy:     "sch-route-optimizer-v2",
    },
  ];

  // Payment DAG
  const dag = [
    { from: "user",                    to: "sch-route-optimizer-v2", amountWei: MICROPAY_MARKET + MICROPAY_RISK, label: "Task fee" },
    { from: "sch-route-optimizer-v2",  to: "sch-market-data-v1",     amountWei: MICROPAY_MARKET,                 label: "Market data" },
    { from: "sch-route-optimizer-v2",  to: "sch-risk-assessor-v1",   amountWei: MICROPAY_RISK,                   label: "Risk assessment" },
  ];

  // Combined result (Route Optimizer output + market/risk context)
  const finalResult = {
    ...(a1Output as object),
    congestion:       marketData.congestion,
    gasPrice:         marketData.gasPrice,
    liquidity:        marketData.liquidity,
    risk:             riskData.verdict,
    riskScore:        riskData.riskScore,
    mevRisk:          riskData.mevRisk,
    slippage:         riskData.slippagePct,
    agentCoordinated: true,
  };

  // Log agent coordination event directly to Supabase da_events (avoids self-referential HTTP call)
  try {
    // Hash deterministic, timestamp-free content so blob_id is stable per logical event
    const hashable = {
      type:    "multi_agent_coordination",
      user_id: userId ?? null,
      amount,
      agents:  agents.map(a => ({ id: a.agentId, latency: a.latencyMs })),
      dag,
    };
    const blobId = createHash("sha256").update(JSON.stringify(hashable)).digest("hex");
    await supabase.from("da_events").insert([{
      type:       "multi_agent_coordination",
      blob_id:    blobId,
      da_tx_hash: null,
      payload: {
        user_id: userId,
        amount,
        agents:  agents.map(a => ({ id: a.agentId, latency: a.latencyMs })),
        dag,
        ts:      Date.now(),
      },
      created_at: new Date().toISOString(),
    }]);
  } catch { /* non-blocking */ }

  // Persist coordination record to Supabase (agent_payments table — non-critical)
  if (userId) {
    try {
      await supabase.from("agent_payments").insert(
        dag.map(edge => ({
          user_id:    userId,
          from_agent: edge.from,
          to_agent:   edge.to,
          amount_wei: edge.amountWei,
          label:      edge.label,
          created_at: new Date().toISOString(),
        }))
      );
    } catch { /* table may not exist yet — non-fatal */ }
  }

  return res.status(200).json({
    result:     finalResult,
    agents,
    dag,
    latencyMs:  Date.now() - orchestratorStart,
  });
}
