/**
 * POST /api/storage-upload
 * Server-side 0G Storage upload — SDK requires Node.js (uses fs).
 * Body: { data: object }
 * Returns: { rootHash, txHash, storageScanUrl }
 */
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

function fallbackHash(data: object): string {
  return "0x" + crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { data } = req.body;
  if (!data) return res.status(400).json({ error: "data required" });

  const privateKey = process.env.STORAGE_PRIVATE_KEY;
  if (!privateKey) {
    return res.status(200).json({ rootHash: fallbackHash(data), txHash: "", storageScanUrl: "" });
  }

  try {
    const { Indexer, MemData } = await import("@0glabs/0g-ts-sdk");
    const { ethers } = await import("ethers");

    const OG_STORAGE_RPC = "https://evmrpc.0g.ai";
    const OG_INDEXER_RPC = "https://indexer-storage-testnet-standard.0g.ai";

    const provider = new ethers.JsonRpcProvider(OG_STORAGE_RPC);
    const signer = new ethers.Wallet(privateKey, provider);

    const bytes = new TextEncoder().encode(JSON.stringify(data));
    const file = new MemData(bytes);
    const [tree, treeErr] = await file.merkleTree();
    if (treeErr) throw treeErr;

    const indexer = new Indexer(OG_INDEXER_RPC);
    const [uploadResult, uploadErr] = await indexer.upload(file, OG_STORAGE_RPC, signer as any);
    if (uploadErr) throw uploadErr;

    const rootHash = tree!.rootHash()!;
    const txHash = (uploadResult as any)?.txHash || "";
    return res.status(200).json({
      rootHash,
      txHash,
      storageScanUrl: txHash ? `https://storagescan-newton.0g.ai/tx/${txHash}` : "",
    });
  } catch (e: any) {
    console.warn("0G Storage upload failed:", e.message);
    return res.status(200).json({ rootHash: fallbackHash(data), txHash: "", storageScanUrl: "" });
  }
}
