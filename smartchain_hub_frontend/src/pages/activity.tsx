/**
 * /activity — Live 0G DA Event Feed
 * The on-chain heartbeat of the SmartChain agent economy.
 * Every optimization, agent coordination, and marketplace event is
 * submitted as a 0G DA blob and displayed here in real time.
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

const EVENT_TYPE_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  optimization:             { label: "Optimization",      color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20",   icon: "⚡" },
  multi_agent_coordination: { label: "Multi-Agent",       color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", icon: "🤖" },
  marketplace_hire:         { label: "Agent Hired",       color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",  icon: "💰" },
  agent_listed:             { label: "Agent Listed",      color: "text-cyan-400",   bg: "bg-cyan-500/10 border-cyan-500/20",    icon: "📋" },
  fine_tune:                { label: "Fine-tune",         color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20",icon: "🧠" },
  unknown:                  { label: "Event",             color: "text-gray-400",   bg: "bg-gray-800/60 border-gray-700",       icon: "●" },
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

function shortHash(h: string | null) {
  if (!h) return null;
  return h.length > 20 ? `${h.slice(0, 12)}…${h.slice(-6)}` : h;
}

export default function ActivityPage() {
  const [events,   setEvents]   = useState<DaEvent[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [newCount, setNewCount] = useState(0);
  const [source,   setSource]   = useState<string>("");

  // Stable ref so the interval callback always sees the latest events without
  // recreating load (and resetting the interval) on every state update.
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
  }, [typeFilter]); // typeFilter only — eventsRef is stable, no stale-closure risk

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 10_000);
    return () => clearInterval(interval);
  }, [load]); // load rebuilds only when typeFilter changes — interval always fresh

  const eventCounts = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const types = Array.from(new Set(events.map(e => e.type)));

  return (
    <>
      <Head>
        <title>Activity Feed | SmartChain Hub</title>
        <meta name="description" content="Live 0G DA event feed — the on-chain heartbeat of the SmartChain agent economy" />
      </Head>
      <div className="space-y-6 animate-fade-in-up">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-white">Live Activity Feed</h1>
            <p className="text-sm text-gray-500 mt-1">
              Every agent action submitted as a 0G DA blob — the verifiable on-chain heartbeat of the economy.
              {source && <span className="text-gray-700 ml-1">(source: {source})</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {newCount > 0 && (
              <button
                onClick={() => { setNewCount(0); load(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-xl hover:bg-blue-600/30 transition-all animate-pulse"
              >
                {newCount} new events — refresh
              </button>
            )}
            <button
              onClick={() => load()}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-blue-400 transition-colors disabled:opacity-40"
              title="Refresh"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Events",  value: String(events.length),                               color: "text-white",      bg: "bg-gray-800/60" },
            { label: "Optimizations", value: String(eventCounts["optimization"] ?? 0),             color: "text-blue-400",   bg: "bg-blue-500/8 border border-blue-500/20" },
            { label: "Multi-Agent",   value: String(eventCounts["multi_agent_coordination"] ?? 0), color: "text-purple-400", bg: "bg-purple-500/8 border border-purple-500/20" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">{s.label}</p>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
          <div className="bg-green-500/8 border border-green-500/20 rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Status</p>
            <p className="text-xl font-black text-green-400 flex items-center gap-1.5">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              Live
            </p>
          </div>
        </div>

        {/* Type filter */}
        {types.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter("all")}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${typeFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-500 hover:text-gray-300"}`}
            >All</button>
            {types.map(t => {
              const m = getMeta(t);
              return (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${typeFilter === t ? `${m.bg} ${m.color} border` : "bg-gray-800 text-gray-500 hover:text-gray-300"}`}>
                  {m.label} ({eventCounts[t] ?? 0})
                </button>
              );
            })}
          </div>
        )}

        {/* DA Architecture info */}
        <div className="card p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4.5 h-4.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-white mb-0.5">0G Data Availability Layer</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Every agent action (optimizations, multi-agent coordination, marketplace hires) is submitted as a blob to the 0G DA layer.
              The blob ID is deterministic SHA-256 of the payload — independently verifiable.
              When a live DA node is available, the blob receives a chain-anchored <code className="text-cyan-400 font-mono text-[11px]">daSubmitTxHash</code>.
            </p>
          </div>
        </div>

        {/* Event feed */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Event Stream</h2>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">Auto-refreshes every 10s</span>
            </div>
          </div>

          {loading ? (
            <div className="p-6 space-y-2">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="h-14 bg-gray-800/40 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
              </div>
              <p className="text-sm text-gray-500">No DA events yet.</p>
              <p className="text-xs text-gray-600 mt-1">
                Run an optimization on the{" "}
                <Link href="/transactions" className="text-blue-400 hover:underline">AI Optimizer</Link>
                {" "}to generate your first event.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/40">
              {events.map(evt => {
                const m = getMeta(evt.type);
                return (
                  <div key={evt.id} className="px-6 py-4 hover:bg-gray-800/20 transition-colors">
                    <div className="flex items-start gap-3">
                      {/* Type badge */}
                      <span className={`text-base shrink-0 mt-0.5`}>{m.icon}</span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${m.bg} ${m.color}`}>
                            {m.label}
                          </span>
                          {evt.da_tx_hash && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">DA Anchored</span>
                          )}
                          <span className="text-xs text-gray-600 ml-auto shrink-0">{timeAgo(evt.created_at)}</span>
                        </div>

                        {/* Blob ID */}
                        <p className="text-[10px] font-mono text-gray-600 mb-1.5">
                          Blob: {shortHash(evt.blob_id)}
                          {evt.da_tx_hash && (
                            <span className="ml-2 text-cyan-600">· DA Tx: {shortHash(evt.da_tx_hash)}</span>
                          )}
                        </p>

                        {/* Payload summary */}
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                          {!!evt.payload?.route && (
                            <span className="text-xs text-gray-500">Route: <span className="text-gray-300">{String(evt.payload.route)}</span></span>
                          )}
                          {evt.payload?.amount != null && (
                            <span className="text-xs text-gray-500">Amount: <span className="text-white font-semibold">${Number(evt.payload.amount as number).toLocaleString()}</span></span>
                          )}
                          {evt.payload?.savings != null && (
                            <span className="text-xs text-gray-500">Savings: <span className="text-green-400">+${Number(evt.payload.savings as number).toFixed(2)}</span></span>
                          )}
                          {Array.isArray(evt.payload?.agents) && evt.payload.agents.length > 0 && (
                            <span className="text-xs text-gray-500">Agents: <span className="text-purple-400">{(evt.payload.agents as unknown[]).length} coordinated</span></span>
                          )}
                          {evt.payload?.tee_verified === true && (
                            <span className="text-xs text-blue-400">✓ TEE Verified</span>
                          )}
                        </div>
                      </div>
                    </div>
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
