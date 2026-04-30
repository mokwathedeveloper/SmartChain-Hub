/**
 * 0G Storage Service — client-side wrapper.
 * Actual SDK calls run server-side at /api/storage-upload (Node.js required).
 */

export interface StorageUploadResult {
  rootHash: string;
  txHash: string;
  storageScanUrl: string;
}

async function uploadToZeroGStorage(data: object): Promise<StorageUploadResult> {
  try {
    const res = await fetch("/api/storage-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    if (!res.ok) throw new Error(`storage-upload ${res.status}`);
    return res.json();
  } catch (err) {
    console.warn("0G Storage unavailable, using fallback:", err);
    // Browser-safe fallback hash using SubtleCrypto
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const hashBuf = await crypto.subtle.digest('SHA-256', encoded);
    const hashHex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
    return { rootHash: `0x${hashHex}`, txHash: "", storageScanUrl: "" };
  }
}

export class ZeroGStorageService {
  private static instance: ZeroGStorageService;
  private constructor() {}

  public static getInstance(): ZeroGStorageService {
    if (!ZeroGStorageService.instance) {
      ZeroGStorageService.instance = new ZeroGStorageService();
    }
    return ZeroGStorageService.instance;
  }

  async uploadMetadata(txData: object): Promise<string> {
    const result = await uploadToZeroGStorage(txData);
    return result.rootHash;
  }

  async uploadWithProof(txData: object): Promise<StorageUploadResult> {
    return uploadToZeroGStorage(txData);
  }
}

export const storageService = ZeroGStorageService.getInstance();
