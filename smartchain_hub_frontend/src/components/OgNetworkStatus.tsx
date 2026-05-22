/**
 * OgNetworkStatus — live health panel for all 5 0G stack components.
 * Displayed on the dashboard. Polls every 30 s.
 */
import { useEffect, useState, useCallback } from 'react';
import { ACTIVE_CHAIN } from '@/utils/chains';

type ComponentStatus = 'live' | 'degraded' | 'unknown';

interface OgComponent {
  name:    string;
  label:   string;
  status:  ComponentStatus;
  latency: number | null;
  detail:  string;
}

const INITIAL_COMPONENTS: OgComponent[] = [
  { name: 'chain',   label: '0G Chain',          status: 'unknown', latency: null, detail: '' },
  { name: 'storage', label: '0G Storage',         status: 'unknown', latency: null, detail: '' },
  { name: 'kv',      label: '0G Storage KV',      status: 'unknown', latency: null, detail: '' },
  { name: 'compute', label: '0G Compute TeeML',   status: 'unknown', latency: null, detail: '' },
  { name: 'da',      label: '0G DA',              status: 'unknown', latency: null, detail: '' },
];

async function pingChain(): Promise<{ status: ComponentStatus; latency: number; detail: string }> {
  const t0 = Date.now();
  try {
    const res = await fetch(ACTIVE_CHAIN.rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }),
      signal: AbortSignal.timeout(5_000),
    });
    const json = await res.json() as { result?: string };
    const blockHex = json.result ?? '0x0';
    const block = parseInt(blockHex, 16);
    return { status: 'live', latency: Date.now() - t0, detail: `Block #${block.toLocaleString()}` };
  } catch {
    return { status: 'degraded', latency: Date.now() - t0, detail: 'RPC unreachable' };
  }
}

async function pingStorage(): Promise<{ status: ComponentStatus; latency: number; detail: string }> {
  const t0 = Date.now();
  try {
    // Proxy through our own API route — the 0G indexer has no CORS headers so
    // a direct browser fetch is blocked with ERR_FAILED / missing Allow-Origin.
    const res = await fetch('/api/og-storage-health', { signal: AbortSignal.timeout(8_000) });
    if (!res.ok) return { status: 'degraded', latency: Date.now() - t0, detail: `Health check HTTP ${res.status}` };
    const json = await res.json() as { status: string; nodeCount?: number; detail?: string };
    if (json.status !== 'live') {
      // Distinguish between indexer outage and our proxy being down
      const msg = json.detail?.includes('503') || json.detail?.includes('unreachable')
        ? '0G indexer offline'
        : json.detail || 'Storage degraded';
      return { status: 'degraded', latency: Date.now() - t0, detail: msg };
    }
    const n = json.nodeCount ?? 0;
    return { status: 'live', latency: Date.now() - t0, detail: `${n} node${n !== 1 ? 's' : ''} indexed` };
  } catch {
    return { status: 'degraded', latency: Date.now() - t0, detail: 'Storage endpoint unreachable' };
  }
}

async function pingKv(): Promise<{ status: ComponentStatus; latency: number; detail: string }> {
  const t0 = Date.now();
  try {
    const res = await fetch('/api/agent-memory?userId=_health_check_', {
      signal: AbortSignal.timeout(5_000),
    });
    // Any HTTP response (including 4xx) proves the KV endpoint is alive and responding.
    // 400 = missing/invalid userId (normal — we have no auth token here).
    // 401 = auth required. 404 = key not found. All confirm the route is up.
    // Only network errors or 5xx indicate a real outage.
    const live = res.status < 500;
    return { status: live ? 'live' : 'degraded', latency: Date.now() - t0, detail: live ? 'KV reachable' : `KV error ${res.status}` };
  } catch {
    return { status: 'degraded', latency: Date.now() - t0, detail: 'KV unreachable' };
  }
}

async function pingCompute(): Promise<{ status: ComponentStatus; latency: number; detail: string }> {
  const t0 = Date.now();
  try {
    // 15 s timeout: Render free tier can take ~10-15 s to cold-start.
    // Any HTTP response means the service is reachable (alive or warming up).
    // Only a network error (timeout, ECONNREFUSED) means truly unreachable.
    const res = await fetch('/api/ai-health', { signal: AbortSignal.timeout(15_000) });
    let json: { status?: string } = {};
    try { json = await res.json() as { status?: string }; } catch { /* non-JSON ok */ }
    const live = res.ok || res.status < 500;
    const detail = json.status === 'ok'
      ? 'TeeML ready'
      : res.status === 503
        ? 'Compute warming up'
        : `Compute ${json.status ?? res.status}`;
    return { status: live ? 'live' : 'degraded', latency: Date.now() - t0, detail };
  } catch {
    return { status: 'degraded', latency: Date.now() - t0, detail: 'Compute unreachable' };
  }
}

async function pingDa(): Promise<{ status: ComponentStatus; latency: number; detail: string }> {
  const t0 = Date.now();
  try {
    // Read-only: fetch the DA event feed (limit=1) — no Supabase writes, no blob submissions
    const res = await fetch('/api/og-da-feed?limit=1', {
      signal: AbortSignal.timeout(6_000),
    });
    if (!res.ok) return { status: 'degraded', latency: Date.now() - t0, detail: `DA feed HTTP ${res.status}` };
    const json = await res.json() as { events?: unknown[]; source?: string };
    const src = json.source ? ` (${json.source})` : '';
    return { status: 'live', latency: Date.now() - t0, detail: `DA feed OK${src}` };
  } catch {
    return { status: 'degraded', latency: Date.now() - t0, detail: 'DA endpoint unreachable' };
  }
}

const STATUS_DOT: Record<ComponentStatus, string> = {
  live:     'bg-green-400',
  degraded: 'bg-yellow-400',
  unknown:  'bg-gray-600',
};

const STATUS_TEXT: Record<ComponentStatus, string> = {
  live:     'text-green-400',
  degraded: 'text-yellow-400',
  unknown:  'text-gray-500',
};

const OgNetworkStatus = () => {
  const [components, setComponents] = useState<OgComponent[]>(INITIAL_COMPONENTS);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const [chain, storage, kv, compute, da] = await Promise.all([
      pingChain(), pingStorage(), pingKv(), pingCompute(), pingDa(),
    ]);

    setComponents([
      { name: 'chain',   label: '0G Chain',        ...chain   },
      { name: 'storage', label: '0G Storage',       ...storage },
      { name: 'kv',      label: '0G Storage KV',    ...kv      },
      { name: 'compute', label: '0G Compute TeeML', ...compute },
      { name: 'da',      label: '0G DA',            ...da      },
    ]);
    setLastUpdated(new Date());
    setRefreshing(false);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  const liveCount = components.filter(c => c.status === 'live').length;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-white">0G Network Status</h2>
          <p className="text-xs text-gray-600 mt-0.5">
            {liveCount}/{components.length} components live
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="text-gray-600 hover:text-blue-400 transition-colors disabled:opacity-40"
          title="Refresh"
        >
          <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="space-y-2.5">
        {components.map(c => (
          <div key={c.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[c.status]} ${c.status === 'live' ? 'shadow-[0_0_6px_1px] shadow-green-400/60' : ''}`} />
              <span className="text-xs text-gray-300 font-medium">{c.label}</span>
            </div>
            <div className="flex items-center gap-3">
              {c.latency !== null && (
                <span className="text-xs text-gray-600">{c.latency}ms</span>
              )}
              <span className={`text-xs font-semibold capitalize ${STATUS_TEXT[c.status]}`}>
                {c.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {lastUpdated && (
        <p className="text-xs text-gray-700 mt-4">
          Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      )}
    </div>
  );
};

export default OgNetworkStatus;
