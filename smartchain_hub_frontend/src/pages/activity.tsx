/**
 * /activity — Live 0G DA Event Feed
 * The on-chain heartbeat of the SmartChain agent economy.
 */
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";

interface DaEvent {
  id:         string;
  type:       string;
  blob_id:    string;
  da_tx_hash: string | null;
  payload:    Record<string, unknown>;
  created_at: string;
}

const EVENT_TYPE_META: Record<string, { label: string; color: string; border: string; bg: string; dot: string }> = {
  optimization:             { label: "Optimization",  color: "text-blue-400",   border: "border-blue-500/20",   bg: "bg-blue-500/10",   dot: "bg-blue-400"   },
  multi_agent_coordination: { label: "Multi-Agent",   color: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/10", dot: "bg-purple-400" },
  marketplace_hire:         { label: "Agent Hired",   color: "text-green-400",  border: "border-green-500/20",  bg: "bg-green-500/10",  dot: "bg-green-400"  },
  agent_listed:             { label: "Agent Listed",  color: "text-cyan-400",   border: "border-cyan-500/20",   bg: "bg-cyan-500/10",   dot: "bg-cyan-400"   },
  fine_tune:                { label: "Fine-tune",     color: "text-yellow-400", border: "border-yellow-500/20", bg: "bg-yellow-500/10", dot: "bg-yellow-400" },
  unknown:                  { label: "Event",         color: "text-gray-400",   border: "border-gray-700",      bg: "bg-gray-800/60",   dot: "bg-gray-500"   },
};

function getMeta(type: string) {
  return EVENT_TYPE_META[type] ?? EVENT_TYPE_META.unknown;
}

function timeAgo(ts: string) {
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (d < 60)    return `${d}s ago`;
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

function shortHash(h: string | null, len = 14) {
  if (!h) return null;
  return h.length > len + 3 ? `${h.slice(0, len)}…${h.slice(-6)}` : h;
}

function payloadRoute(p: Record<string, unknown>): string | null {
  if (p.route)       return String(p.route);
  if (p.specialty)   return String(p.specialty);
  if (p.description) return String(p.description);
  return null;
}

const DA_FACTS = [
  {
    title: "SHA-256 Blob ID",
    desc: "The blob ID is a deterministic SHA-256 of the event payload — any observer can recompute and verify it.",
    color: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/8",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>,
  },
  {
    title: "0G DA Submission",
    desc: "Every event is submitted to the 0G DA network for ordering, availability, and finality guarantees.",
    color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/8",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>,
  },
  {
    title: "Chain-anchored Tx",
    desc: "When confirmed by a live DA node, the blob receives a daSubmitTxHash — a permanent on-chain anchor.",
    color: "text-green-400", border: "border-green-500/20", bg: "bg-green-500/8",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>,
  },
];

export default function ActivityPage() {
  const [events,     setEvents]     = useState<DaEvent[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [newCount,   setNewCount]   = useState(0);
  const [source,     setSource]     = useState<string>("");
  const [expanded,   setExpanded]   = useState<string | null>(null);

  // Stable ref so interval callback always sees latest events
  const eventsRef = useRef<DaEvent[]>([]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const url = typeFilter !== "all" ? `/api/og-da-feed?type=${typeFilter}` : "/api/og-da-feed";
      const res  = await fetch(url);
      const json = await res.json() as { events: DaEvent[]; source: string };
      if (json.events) {
        if (silent && eventsRef.current.length > 0) {
          const added = json.events.filter(e => !eventsRef.current.some(ex => ex.id === e.id));
          if (added.length > 0) setNewCount(n => n + added.length);
        }
        eventsRef.current = json.events;
        setEvents(json.events);
        setSource(json.source || "");
      }
    } catch { /* silent */ }
    if (!silent) setLoading(false);
  }, [typeFilter]);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 10_000);
    return () => clearInterval(interval);
  }, [load]);

  const eventCounts = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const types = Array.from(new Set(events.map(e => e.type)));
  const daAnchoredCount = events.filter(e => !!e.da_tx_hash).length;

  return (
    <>
      <Head>
        <title>Activity Feed | SmartChain Hub</title>
        <meta name="description" content="Live 0G DA event feed — the on-chain heartbeat of the SmartChain agent economy" />
      </Head>
      <div className="space-y-6 animate-fade-in-up">

        {/* ── Page header ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-white">Live Activity Feed</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Every agent action submitted as a 0G DA blob — the verifiable on-chain heartbeat of the economy.
              {source && <span className="text-gray-600 ml-1 text-xs">({source})</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start">
            {newCount > 0 && (
              <button
                onClick={() => { setNewCount(0); load(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-xl hover:bg-blue-600/30 transition-all"
              >
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                {newCount} new — refresh
              </button>
            )}
            <button
              onClick={() => load()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 text-sm font-semibold rounded-xl hover:bg-blue-600/20 transition-all disabled:opacity-40"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-800/60 rounded-2xl p-5">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Total Events</p>
            <p className="text-2xl font-black text-white tabular-nums">{events.length}</p>
          </div>
          <div className="bg-blue-500/8 border border-blue-500/20 rounded-2xl p-5">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Optimizations</p>
            <p className="text-2xl font-black text-blue-400 tabular-nums">{eventCounts["optimization"] ?? 0}</p>
          </div>
          <div className="bg-cyan-500/8 border border-cyan-500/20 rounded-2xl p-5">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">DA Anchored</p>
            <p className="text-2xl font-black text-cyan-400 tabular-nums">{daAnchoredCount}</p>
          </div>
          <div className="bg-green-500/8 border border-green-500/20 rounded-2xl p-5">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Status</p>
            <p className="text-2xl font-black text-green-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shrink-0" />
              Live
            </p>
          </div>
        </div>

        {/* ── DA Architecture — 3 fact cards ───────────────────────── */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
            </div>
            <h2 className="text-sm font-bold text-white">0G Data Availability Layer</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DA_FACTS.map(f => (
              <div key={f.title} className={`rounded-xl border ${f.border} ${f.bg} p-4`}>
                <div className={`w-8 h-8 rounded-lg border ${f.border} flex items-center justify-center mb-3 ${f.bg}`}>
                  <span className={f.color}>{f.icon}</span>
                </div>
                <p className={`text-sm font-bold text-white mb-1.5`}>{f.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Type filter ───────────────────────────────────────────── */}
        {types.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter("all")}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
                typeFilter === "all"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                  : "bg-gray-800 text-gray-500 hover:text-gray-300 hover:bg-gray-750"
              }`}
            >
              All ({events.length})
            </button>
            {types.map(t => {
              const m = getMeta(t);
              return (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all border ${
                    typeFilter === t
                      ? `${m.bg} ${m.color} ${m.border}`
                      : "bg-gray-800 border-transparent text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {m.label} ({eventCounts[t] ?? 0})
                </button>
              );
            })}
          </div>
        )}

        {/* ── Event stream ─────────────────────────────────────────── */}
        <div className="card overflow-hidden">

          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Event Stream</h2>
              <p className="text-xs text-gray-500 mt-0.5">Click any row to expand blob details</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">Auto-refreshes every 10s</span>
            </div>
          </div>

          {/* Column headers — desktop only */}
          {!loading && events.length > 0 && (
            <div className="hidden lg:grid px-6 py-2.5 border-b border-gray-800/50 text-[10px] text-gray-600 uppercase tracking-wider font-semibold select-none gap-4"
              style={{ gridTemplateColumns: '112px 1fr 88px 92px 76px 72px 20px' }}>
              <span>Type</span>
              <span>Description</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Savings</span>
              <span>DA</span>
              <span className="text-right">Time</span>
              <span />
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="p-6 space-y-2.5">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="h-14 bg-gray-800/40 rounded-xl animate-pulse" />
              ))}
            </div>

          /* Empty */
          ) : events.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
              </div>
              <p className="text-sm text-gray-400 font-semibold">No DA events yet</p>
              <p className="text-xs text-gray-600 mt-1.5">
                Run an optimization on the{' '}
                <Link href="/transactions" className="text-blue-400 hover:underline">AI Optimizer</Link>
                {' '}to generate your first event.
              </p>
            </div>

          /* Events */
          ) : (
            <div className="divide-y divide-gray-800/40">
              {events.map(evt => {
                const m = getMeta(evt.type);
                const isExpanded = expanded === evt.id;
                const route = payloadRoute(evt.payload);
                const amount = evt.payload?.amount != null ? Number(evt.payload.amount as number) : null;
                const savings = evt.payload?.savings != null ? Number(evt.payload.savings as number) : null;
                const agentCount = Array.isArray(evt.payload?.agents) ? (evt.payload.agents as unknown[]).length : null;
                const teeVerified = evt.payload?.tee_verified === true;

                return (
                  <div key={evt.id}>

                    {/* ── Row ──────────────────────────────────────── */}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : evt.id)}
                      className={`w-full px-6 py-4 text-left transition-colors ${isExpanded ? 'bg-gray-800/40' : 'hover:bg-gray-800/20'}`}
                    >
                      {/* Mobile (< lg): 2-line stacked layout */}
                      <div className="lg:hidden space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${m.bg} ${m.color} ${m.border}`}>
                              {m.label}
                            </span>
                            {evt.da_tx_hash && (
                              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                                DA ✓
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-gray-600">{timeAgo(evt.created_at)}</span>
                            <svg className={`w-3.5 h-3.5 text-gray-600 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-gray-400 truncate flex-1">{route ?? '—'}</span>
                          <div className="flex items-center gap-3 shrink-0">
                            {amount !== null && (
                              <span className="text-sm font-bold text-white tabular-nums">${amount.toLocaleString()}</span>
                            )}
                            {savings !== null && (
                              <span className="text-sm font-semibold text-green-400 tabular-nums">+${savings.toFixed(2)}</span>
                            )}
                            {agentCount !== null && (
                              <span className="text-xs text-purple-400">{agentCount} agents</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Desktop (lg+): grid layout */}
                      <div className="hidden lg:grid items-center gap-4"
                        style={{ gridTemplateColumns: '112px 1fr 88px 92px 76px 72px 20px' }}>
                        {/* Type badge */}
                        <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg font-semibold border w-fit ${m.bg} ${m.color} ${m.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${m.dot} shrink-0`} />
                          {m.label}
                        </span>
                        {/* Route/description */}
                        <div className="min-w-0">
                          <span className="text-xs text-gray-300 truncate block">{route ?? '—'}</span>
                          {teeVerified && (
                            <span className="text-[10px] text-blue-400 font-medium">✓ TEE Verified</span>
                          )}
                        </div>
                        {/* Amount */}
                        <span className="text-sm font-bold text-white tabular-nums text-right">
                          {amount !== null ? `$${amount.toLocaleString()}` : (agentCount !== null ? `${agentCount} agents` : '—')}
                        </span>
                        {/* Savings */}
                        <span className="text-sm font-semibold text-green-400 tabular-nums text-right">
                          {savings !== null ? `+$${savings.toFixed(2)}` : '—'}
                        </span>
                        {/* DA status */}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border w-fit ${
                          evt.da_tx_hash
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            : 'bg-gray-800/60 text-gray-600 border-gray-700'
                        }`}>
                          {evt.da_tx_hash ? 'DA ✓' : 'Pending'}
                        </span>
                        {/* Time */}
                        <span className="text-xs text-gray-600 text-right">{timeAgo(evt.created_at)}</span>
                        {/* Chevron */}
                        <svg className={`w-4 h-4 text-gray-600 transition-transform justify-self-end ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </div>
                    </button>

                    {/* ── Expanded blob detail ─────────────────────── */}
                    {isExpanded && (
                      <div className="px-6 pt-4 pb-6 bg-gray-900/50 border-t border-gray-800/40">
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-4">Blob Details</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          <div className="bg-gray-800/60 rounded-xl p-3.5">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5">Blob ID (SHA-256)</p>
                            <p className="text-xs font-mono text-gray-300 break-all leading-relaxed">{evt.blob_id || '—'}</p>
                          </div>
                          <div className="bg-gray-800/60 rounded-xl p-3.5">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5">DA Submit Tx Hash</p>
                            <p className="text-xs font-mono text-cyan-300 break-all leading-relaxed">{evt.da_tx_hash || '(not yet anchored)'}</p>
                          </div>
                          {route && (
                            <div className="bg-gray-800/60 rounded-xl p-3.5">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5">Route / Description</p>
                              <p className="text-xs text-gray-300">{route}</p>
                            </div>
                          )}
                          {amount !== null && (
                            <div className="bg-gray-800/60 rounded-xl p-3.5">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5">Transaction Amount</p>
                              <p className="text-sm font-bold text-white tabular-nums">${amount.toLocaleString()}</p>
                            </div>
                          )}
                          {savings !== null && (
                            <div className="bg-gray-800/60 rounded-xl p-3.5">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5">AI Savings</p>
                              <p className="text-sm font-bold text-green-400 tabular-nums">+${savings.toFixed(2)}</p>
                            </div>
                          )}
                          <div className="bg-gray-800/60 rounded-xl p-3.5">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5">Timestamp</p>
                            <p className="text-xs font-mono text-gray-300">{new Date(evt.created_at).toISOString()}</p>
                          </div>
                        </div>
                        {/* Payload badge row */}
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-800/60">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${m.bg} ${m.color} ${m.border}`}>
                            {m.label}
                          </span>
                          {evt.da_tx_hash && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                              DA Anchored
                            </span>
                          )}
                          {teeVerified && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                              ✓ TEE Verified
                            </span>
                          )}
                          {agentCount !== null && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                              {agentCount} agents coordinated
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </>
  );
}
