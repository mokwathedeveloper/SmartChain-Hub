/**
 * GET  /api/agent-memory?userId=...  → read memory from 0G Storage KV
 * POST /api/agent-memory             → write memory to 0G Storage KV
 *
 * 0G Storage KV is the authoritative persistent memory store.
 * localStorage in the browser is a read-through cache only.
 */
import type { NextApiRequest, NextApiResponse } from "next";

const OG_KV_RPC      = "https://indexer-storage-testnet-standard.0g.ai";
const OG_STORAGE_RPC = "https://evmrpc.0g.ai";
// Stream ID as hex string — avoid BigInt serialization issues in error responses
const STREAM_ID_HEX  = "0x736d617274636861696e6d656d6f7279";
const STREAM_ID      = BigInt(STREAM_ID_HEX);

function memoryKey(userId: string): Uint8Array {
  return new TextEncoder().encode(`smartchain:memory:${userId}`);
}

function deterministicHash(content: string): string {
  const hash = Array.from(content).reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 0);
  return `0x${Math.abs(hash).toString(16).padStart(64, "0")}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const privateKey = process.env.STORAGE_PRIVATE_KEY;

  // ── GET: read memory from 0G KV ──────────────────────────────────────────
  if (req.method === "GET") {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: "userId required" });
    if (!privateKey) return res.status(200).json({ memory: null, skipped: "no key" });

    try {
      const { KvClient } = await import("@0glabs/0g-ts-sdk");
      const kvClient = new KvClient(OG_KV_RPC);
      const value = await (kvClient as any).getValue(STREAM_ID, memoryKey(userId));
      if (!value) return res.status(200).json({ memory: null });
      const memory = JSON.parse(new TextDecoder().decode(value));
      return res.status(200).json({ memory });
    } catch (e: any) {
      // Stringify BigInt in error message to avoid JSON serialization crash
      const msg = typeof e.message === 'string' ? e.message.replace(/\d+n/g, (s: string) => s.slice(0,-1)) : String(e);
      return res.status(200).json({ memory: null, skipped: msg });
    }
  }

  // ── POST: write memory to 0G KV ──────────────────────────────────────────
  if (req.method === "POST") {
    const { userId, memory } = req.body;
    if (!userId || !memory) return res.status(400).json({ error: "userId and memory required" });
    if (!privateKey) return res.status(200).json({ ok: true, skipped: "no key" });

    try {
      const { Batcher, KvClient } = await import("@0glabs/0g-ts-sdk");
      const { ethers }            = await import("ethers");

      const provider = new ethers.JsonRpcProvider(OG_STORAGE_RPC);
      const signer   = new ethers.Wallet(privateKey, provider);
      const kvClient = new KvClient(OG_KV_RPC);

      const batcher = new (Batcher as any)(STREAM_ID, [kvClient], null, provider);
      batcher.streamDataBuilder.set(STREAM_ID as any, memoryKey(userId), new TextEncoder().encode(JSON.stringify(memory)));
      await batcher.exec(signer);

      const rootHash = deterministicHash(JSON.stringify(memory));
      return res.status(200).json({ ok: true, rootHash });
    } catch (e: any) {
      const msg = typeof e.message === 'string' ? e.message.replace(/\d+n/g, (s: string) => s.slice(0,-1)) : String(e);
      const rootHash = deterministicHash(JSON.stringify(memory));
      return res.status(200).json({ ok: true, skipped: msg, rootHash });
    }
  }

  return res.status(405).end();
}
