/**
 * ZK Proof client utility.
 * Calls /api/zk-proof to generate a proof for a transaction optimization.
 * Returns the proof result including commitment hash for on-chain anchoring.
 */

export interface ZKProofResult {
  proof:         object | null;
  publicSignals: string[];
  verified:      boolean;
  commitment:    string;   // 0x-prefixed SHA-256 or Groth16 public signal
  method:        "groth16" | "commitment-sha256";
  fallback?:     boolean;
  route:         string;
}

export async function generateZKProof(
  amount:  number,
  fee:     number,
  savings: number,
  route:   string,
  userId:  string
): Promise<ZKProofResult> {
  const res = await fetch("/api/zk-proof", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ amount, fee, savings, route, userId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `ZK proof failed: ${res.status}`);
  }

  return res.json();
}

/** Returns a short display string for the commitment (first 18 chars). */
export function shortCommitment(commitment: string): string {
  return commitment.slice(0, 18) + "...";
}
