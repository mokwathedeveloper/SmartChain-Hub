/**
 * POST /api/agent-memory
 * Server-side 0G Storage KV write — SDK requires Node.js (uses fs).
 * Body: { userId, memory }
 * Returns: { ok: true, rootHash? }
 */
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId, memory } = req.body;
  if (!userId || !memory) return res.status(400).json({ error: "userId and memory required" });

  const privateKey = process.env.STORAGE_PRIVATE_KEY; // server-side only (no NEXT_PUBLIC_)
  if (!privateKey) return res.status(200).json({ ok: true, skipped: "no key" });

  try {
    const { Batcher, KvClient } = await import("@0glabs/0g-ts-sdk");
    const { ethers } = await import("ethers");

    const OG_KV_RPC = "https://indexer-storage-testnet-standard.0g.ai";
    const OG_STORAGE_RPC = "https://evmrpc.0g.ai";
    const STREAM_VERSION = BigInt("0x736d617274636861696e6d656d6f7279");

    const provider = new ethers.JsonRpcProvider(OG_STORAGE_RPC);
    const signer = new ethers.Wallet(privateKey, provider);
    const kvClient = new KvClient(OG_KV_RPC);

    const batcher = new (Batcher as any)(STREAM_VERSION, [kvClient], null, provider);
    const keyBytes = new TextEncoder().encode(`smartchain:memory:${userId}`);
    const valueBytes = new TextEncoder().encode(JSON.stringify(memory));
    batcher.streamDataBuilder.set(STREAM_VERSION as any, keyBytes, valueBytes);
    await batcher.exec(signer);

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.warn("0G KV write failed:", e.message);
    return res.status(200).json({ ok: true, skipped: e.message });
  }
}
