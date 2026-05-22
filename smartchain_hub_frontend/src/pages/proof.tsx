/**
 * /proof — Live TeeML Attestation Explorer
 * Shows the last N TEE-verified optimizations with on-chain verifiable evidence.
 */
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ACTIVE_CHAIN } from "@/utils/chains";

interface ProofRecord {
  id: string;
  txHash: string | null;
  explorerUrl: string | null;
  amount: number;
  savings: number;
  fee: number;
  route: string;
  storageRoot: string | null;
  storageScanUrl: string | null;
  teeVerified: boolean;
  teeProof: string | null;
  teeSigner: string | null;
  providerId: string | null;
  mlEngine: string | null;
  zkCommitment: string | null;
  timestamp: string;
}

interface FeedMeta {
  total: number;
  teeVerified: number;
  chainName: string;
  chainId: number;
  explorer: string;
}

function timeAgo(ts: string) {
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (d < 60)    return `${d}s ago`;
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

function shortHash(h: string | null, len = 18) {
  if (!h) return '—';
  return h.length > len + 3 ? `${h.slice(0, len)}…` : h;
}

const TEE_STEPS = [
  {
    n: "01", title: "SGX Enclave", color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/8",
    desc: "AI model runs inside an Intel SGX enclave — isolated from the host OS and cloud operator.",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 12V7a7 7 0 0114 0v5M3 12h18M12 12v9m-4-4h8"/></svg>,
  },
  {
    n: "02", title: "Signed Proof", color: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/8",
    desc: "The enclave signs the result with its hardware key, producing a verifiable tee_proof hash.",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
  },
  {
    n: "03", title: "0G Storage", color: "text-green-400", border: "border-green-500/20", bg: "bg-green-500/8",
    desc: "Optimization result + Merkle root uploaded to 0G Storage Log. Root is committed on-chain.",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 7h16M4 7a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v0a2 2 0 01-2 2M4 7v10a2 2 0 002 2h12a2 2 0 002-2V7M9 11h6M9 15h6"/></svg>,
  },
  {
    n: "04", title: "On-chain Proof", color: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/8",
    desc: "Each record below has the on-chain tx link, storage root, and TEE proof — verifiable by anyone.",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>,
  },
];

const PROOF_FIELDS = (p: ProofRecord) => [
  { label: "TEE Signer",      value: p.teeSigner     || '—', mono: true  },
  { label: "Provider ID",     value: p.providerId    || '—', mono: true  },
  { label: "ML Engine",       value: p.mlEngine      || '—', mono: false },
  { label: "Route",           value: p.route,               mono: false },
  { label: "TEE Proof Hash",  value: p.teeProof      || '(stored on 0G Storage)', mono: true },
  { label: "ZK Commitment",   value: p.zkCommitment  || '—', mono: true },
  { label: "0G Storage Root", value: p.storageRoot   || '—', mono: true },
  { label: "Timestamp",       value: new Date(p.timestamp).toISOString(), mono: true },
];

export default function ProofPage() {
  const [proofs, setProofs]     = useState<ProofRecord[]>([]);
  const [meta, setMeta]         = useState<FeedMeta | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage]         = useState(0);
  const PER_PAGE = 20;

  const load = async (offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/proof-feed?limit=${PER_PAGE}&offset=${offset}`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const json = await res.json() as { proofs: ProofRecord[]; meta: FeedMeta };
      setProofs(json.proofs || []);
      setMeta(json.meta || null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load proofs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page * PER_PAGE); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const verifiedRate = meta && meta.total > 0
    ? Math.round((meta.teeVerified / meta.total) * 100)
    : 0;

  const totalPages = meta ? Math.ceil(meta.total / PER_PAGE) : 1;

  return (
    <>
      <Head>
        <title>TEE Proof Explorer | SmartChain Hub</title>
        <meta name="description" content="Publicly verifiable TEE attestations for every AI optimization on 0G Chain" />
      </Head>
      <div className="space-y-6 animate-fade-in-up">

        {/* ── Page header ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-white">TEE Attestation Explorer</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Every optimization runs inside a Trusted Execution Environment on 0G Compute.
              The proof is committed on-chain — independently verifiable by anyone.
            </p>
          </div>
          <button
            onClick={() => load(page * PER_PAGE)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 text-sm font-semibold rounded-xl hover:bg-blue-600/20 transition-all disabled:opacity-40 shrink-0 self-start"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Stats ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-800/60 rounded-2xl p-5">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Total Confirmed</p>
            <p className="text-2xl font-black text-white tabular-nums">{meta?.total?.toLocaleString() ?? '—'}</p>
          </div>
          <div className="bg-green-500/8 border border-green-500/20 rounded-2xl p-5">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">TEE Verified</p>
            <p className="text-2xl font-black text-green-400 tabular-nums">{meta?.teeVerified?.toLocaleString() ?? '—'}</p>
          </div>
          <div className="bg-blue-500/8 border border-blue-500/20 rounded-2xl p-5">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Verification Rate</p>
            <p className="text-2xl font-black text-blue-400 tabular-nums mb-2">{verifiedRate}%</p>
            <div className="h-1.5 bg-gray-700/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
                style={{ width: `${verifiedRate}%` }}
              />
            </div>
          </div>
          <div className="bg-purple-500/8 border border-purple-500/20 rounded-2xl p-5">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Chain</p>
            <p className="text-2xl font-black text-purple-400 truncate">{meta?.chainName ?? ACTIVE_CHAIN.name}</p>
          </div>
        </div>

        {/* ── How TEE Verification Works — 4-step visual ──────────── */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h2 className="text-sm font-bold text-white">How TEE Verification Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEE_STEPS.map((s, i) => (
              <div key={s.n} className={`relative rounded-xl border ${s.border} ${s.bg} p-4`}>
                {/* Step number + connector arrow on lg */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${s.color} opacity-50`}>{s.n}</span>
                  {i < TEE_STEPS.length - 1 && (
                    <svg className="hidden lg:block w-4 h-4 text-gray-700 absolute -right-3 top-1/2 -translate-y-1/2 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  )}
                </div>
                <div className={`w-9 h-9 rounded-xl border ${s.border} flex items-center justify-center mb-3 ${s.bg}`}>
                  <span className={s.color}>{s.icon}</span>
                </div>
                <p className={`text-sm font-bold text-white mb-1.5`}>{s.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Attestation Records ──────────────────────────────────── */}
        <div className="card overflow-hidden">

          {/* Section header */}
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Attestation Records</h2>
              <p className="text-xs text-gray-500 mt-0.5">Click any row to expand the full cryptographic proof</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500 font-mono">{ACTIVE_CHAIN.name}</span>
            </div>
          </div>

          {/* Column headers — desktop only */}
          {!loading && proofs.length > 0 && (
            <div className="hidden lg:grid px-6 py-2.5 border-b border-gray-800/50 text-[10px] text-gray-600 uppercase tracking-wider font-semibold select-none"
              style={{ gridTemplateColumns: '96px 1fr 160px 88px 88px 72px 20px' }}>
              <span>Status</span>
              <span>Tx Hash</span>
              <span>Route</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Savings</span>
              <span className="text-right">Time</span>
              <span />
            </div>
          )}

          {/* Loading skeleton */}
          {loading ? (
            <div className="p-6 space-y-3">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-14 bg-gray-800/50 rounded-xl animate-pulse" />
              ))}
            </div>

          /* Error state */
          ) : error ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                </svg>
              </div>
              <p className="text-sm text-red-400 mb-3">{error}</p>
              <button
                onClick={() => load(page * PER_PAGE)}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Try again
              </button>
            </div>

          /* Empty state */
          ) : proofs.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <p className="text-sm text-gray-400 font-semibold">No confirmed proofs yet</p>
              <p className="text-xs text-gray-600 mt-1.5">
                Run an optimization on the{' '}
                <Link href="/transactions" className="text-blue-400 hover:underline">AI Optimizer</Link>
                {' '}to generate your first attestation.
              </p>
            </div>

          /* Records */
          ) : (
            <div className="divide-y divide-gray-800/50">
              {proofs.map(p => {
                const isExpanded = expanded === p.id;
                return (
                  <div key={p.id}>

                    {/* ── Row ─────────────────────────────────────── */}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : p.id)}
                      className={`w-full px-6 py-4 text-left transition-colors ${isExpanded ? 'bg-gray-800/40' : 'hover:bg-gray-800/25'}`}
                    >
                      {/* Mobile (< lg): 2-line stacked layout */}
                      <div className="lg:hidden space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                              p.teeVerified
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : 'bg-gray-700/40 text-gray-500 border-gray-700'
                            }`}>
                              {p.teeVerified ? '✓ TEE' : 'Unverified'}
                            </span>
                            {p.explorerUrl ? (
                              <a href={p.explorerUrl} target="_blank" rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="text-xs font-mono text-blue-400 hover:text-blue-300 hover:underline truncate">
                                {shortHash(p.txHash, 14)}
                              </a>
                            ) : (
                              <span className="text-xs font-mono text-gray-600 truncate">{shortHash(p.txHash, 14)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-gray-600">{timeAgo(p.timestamp)}</span>
                            <svg className={`w-3.5 h-3.5 text-gray-600 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-gray-400 truncate flex-1">{p.route}</span>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-bold text-white tabular-nums">${p.amount.toLocaleString()}</span>
                            <span className="text-sm font-semibold text-green-400 tabular-nums">+${p.savings.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop (lg+): single-row grid layout */}
                      <div className="hidden lg:grid items-center gap-4"
                        style={{ gridTemplateColumns: '96px 1fr 160px 88px 88px 72px 20px' }}>
                        {/* Status */}
                        <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-semibold border w-fit ${
                          p.teeVerified
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-gray-700/40 text-gray-500 border-gray-700'
                        }`}>
                          {p.teeVerified ? '✓ TEE' : 'Unverified'}
                        </span>
                        {/* Tx hash */}
                        <div className="min-w-0">
                          {p.explorerUrl ? (
                            <a href={p.explorerUrl} target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-xs font-mono text-blue-400 hover:text-blue-300 hover:underline">
                              {shortHash(p.txHash, 20)}
                            </a>
                          ) : (
                            <span className="text-xs font-mono text-gray-600">{shortHash(p.txHash, 20)}</span>
                          )}
                        </div>
                        {/* Route */}
                        <span className="text-xs text-gray-400 truncate">{p.route}</span>
                        {/* Amount */}
                        <span className="text-sm font-bold text-white tabular-nums text-right">${p.amount.toLocaleString()}</span>
                        {/* Savings */}
                        <span className="text-sm font-semibold text-green-400 tabular-nums text-right">+${p.savings.toFixed(2)}</span>
                        {/* Time */}
                        <span className="text-xs text-gray-600 text-right">{timeAgo(p.timestamp)}</span>
                        {/* Chevron */}
                        <svg className={`w-4 h-4 text-gray-600 transition-transform justify-self-end ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </div>
                    </button>

                    {/* ── Expanded proof detail ────────────────────── */}
                    {isExpanded && (
                      <div className="px-6 pt-4 pb-6 bg-gray-900/50 border-t border-gray-800/40">
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-4">Cryptographic Proof</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          {PROOF_FIELDS(p).map(f => (
                            <div key={f.label} className="bg-gray-800/60 rounded-xl p-3.5">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5">{f.label}</p>
                              <p className={`text-xs text-gray-300 break-all leading-relaxed ${f.mono ? 'font-mono' : ''}`}>
                                {f.value}
                              </p>
                            </div>
                          ))}
                        </div>
                        {(p.explorerUrl || p.storageScanUrl) && (
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-800/60">
                            {p.explorerUrl && (
                              <a href={p.explorerUrl} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors font-medium">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                                View on {ACTIVE_CHAIN.name}
                              </a>
                            )}
                            {p.storageScanUrl && (
                              <a href={p.storageScanUrl} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors font-medium">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                                View 0G Storage
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

          {/* ── Pagination ───────────────────────────────────────── */}
          {meta && meta.total > PER_PAGE && (
            <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white disabled:opacity-30 transition-colors font-semibold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                Newer
              </button>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <span>Page</span>
                <span className="px-2 py-0.5 bg-gray-800 rounded-lg font-semibold text-gray-400">{page + 1}</span>
                <span>of {totalPages}</span>
              </div>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={(page + 1) * PER_PAGE >= meta.total}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white disabled:opacity-30 transition-colors font-semibold"
              >
                Older
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          )}

        </div>

      </div>
    </>
  );
}
