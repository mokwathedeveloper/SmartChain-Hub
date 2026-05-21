/**
 * AI Agent API client.
 * Routes all AI agent calls through same-origin Next.js proxy routes
 * (/api/ai-optimize, /api/ai-health) so the browser never contacts
 * Render directly — eliminating CORS issues caused by cold-start 503s.
 */
import { secureLogger } from './secureLogger';

export interface OptimizeResult {
  route: string;
  fee: number;
  savings: number;
  time_s?: number;
  estimated_time_s?: number;
  fallback?: boolean;
  explanation?: string;
  confidence?: number;
  tee_verified?: boolean;
  tee_mode?: string;
  tee_proof?: string;
  tee_signer?: string;
  provider_id?: string;
  ml_engine?: string;
  risk?: string;
  congestion?: string;
}

export interface HealthResult {
  status: string;
  model?: string;
  [key: string]: unknown;
}

export interface FineTuneResult {
  ok: boolean;
  reason?: string;
  samples?: number;
  final_loss?: number;
  model_hash?: string;
  [key: string]: unknown;
}

/** Optimize a transaction — proxied through /api/ai-optimize (same-origin, no CORS). */
export async function optimizeTransaction(amount: number, priority: string): Promise<OptimizeResult> {
  secureLogger.info('Optimizing transaction', { amount, priority });

  const res = await fetch('/api/ai-optimize', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ amount, priority }),
  });

  if (!res.ok) throw new Error(`AI agent returned ${res.status}`);
  return res.json() as Promise<OptimizeResult>;
}

/** Health check for the AI agent — proxied through /api/ai-health (same-origin, no CORS). */
export async function getAgentHealth(): Promise<HealthResult> {
  const res = await fetch('/api/ai-health');
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json() as Promise<HealthResult>;
}

/** Trigger fine-tuning via the backend (which proxies to AI agent). */
export async function triggerFineTune(rootHashes: string[] = [], dryRun = false, accessToken = ""): Promise<FineTuneResult> {
  const res = await fetch('/api/fine-tune', {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ root_hashes: rootHashes, dry_run: dryRun }),
  });
  return res.json() as Promise<FineTuneResult>;
}
