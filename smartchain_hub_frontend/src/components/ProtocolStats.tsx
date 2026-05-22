/**
 * ProtocolStats — live protocol-wide traction metrics.
 * Fetches from /api/protocol-stats (service-role, bypasses RLS).
 * Refreshes every 60 s.
 */
import { useEffect, useState, useCallback } from 'react';

interface Stats {
  totalTx:      number;
  totalVolume:  number;
  totalSavings: number;
  teeVerified:  number;
  daAnchored:   number;
  agentsActive: number;
}

const EMPTY: Stats = {
  totalTx: 0, totalVolume: 0, totalSavings: 0,
  teeVerified: 0, daAnchored: 0, agentsActive: 0,
};

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

const ITEMS = [
  {
    key: 'totalTx' as keyof Stats,
    label: 'Optimizations',
    sub: 'transactions processed',
    color: 'text-blue-400',
    dot: 'bg-blue-400',
    fmt: fmtNum,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    ),
  },
  {
    key: 'totalVolume' as keyof Stats,
    label: 'Protocol Volume',
    sub: 'total value optimized',
    color: 'text-indigo-400',
    dot: 'bg-indigo-400',
    fmt: fmtUsd,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    ),
  },
  {
    key: 'totalSavings' as keyof Stats,
    label: 'AI Savings',
    sub: 'fees saved by AI routing',
    color: 'text-green-400',
    dot: 'bg-green-400',
    fmt: fmtUsd,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
    ),
  },
  {
    key: 'teeVerified' as keyof Stats,
    label: 'TEE Verified',
    sub: 'TeeML attested proofs',
    color: 'text-purple-400',
    dot: 'bg-purple-400',
    fmt: fmtNum,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
    ),
  },
  {
    key: 'daAnchored' as keyof Stats,
    label: 'DA Anchored',
    sub: 'blobs on 0G DA layer',
    color: 'text-cyan-400',
    dot: 'bg-cyan-400',
    fmt: fmtNum,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
    ),
  },
  {
    key: 'agentsActive' as keyof Stats,
    label: 'Active Agents',
    sub: 'unique agents in economy',
    color: 'text-amber-400',
    dot: 'bg-amber-400',
    fmt: fmtNum,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
    ),
  },
];

export default function ProtocolStats() {
  const [stats, setStats]           = useState<Stats>(EMPTY);
  const [loading, setLoading]       = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/protocol-stats', { signal: AbortSignal.timeout(8_000) });
      if (res.ok) {
        const data = await res.json() as Stats;
        setStats(data);
        setLastUpdated(new Date());
      }
    } catch {
      // fail silently — stats are informational, never block the page
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold text-white">Protocol Stats</h2>
          <p className="text-xs text-gray-600 mt-0.5">Global traction · updates every 60s</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_1px] shadow-green-400/60" />
          <span className="text-[10px] text-green-400 font-semibold">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ITEMS.map(item => (
          <div key={item.key} className="bg-gray-800/50 rounded-xl p-3.5 border border-gray-700/40">
            <svg className={`w-5 h-5 mb-2 ${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {item.icon}
            </svg>
            <p className={`text-lg font-bold tabular-nums ${item.color}`}>
              {loading ? '—' : item.fmt(stats[item.key])}
            </p>
            <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{item.label}</p>
            <p className="text-[9px] text-gray-600 mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      {lastUpdated && (
        <p className="text-[10px] text-gray-700 mt-4">
          Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      )}
    </div>
  );
}
