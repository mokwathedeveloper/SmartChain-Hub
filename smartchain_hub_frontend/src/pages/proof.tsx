/**
 * /proof — Live TeeML Attestation Explorer
 * Shows the last N TEE-verified optimizations with on-chain verifiable evidence.
 * This page is the answer to: "prove your TeeML claims are real."
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

function shortHash(h: string | null, len = 16) {
  if (!h) return '—';
  return h.length > len + 3 ? `${h.slice(0, len)}…` : h;
}

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

  return (
    <>
      <Head>
        <title>TEE Proof Explorer | SmartChain Hub</title>
        <meta name="description" content="Publicly verifiable TEE attestations for every AI optimization on 0G Chain" />
      </Head>
      <div className="space-y-6 animate-fade-in-up">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-white">TEE Attestation Explorer</h1>
            <p className="text-sm text-gray-500 mt-1">
              Every optimization is executed inside a Trusted Execution Environment on 0G Compute.
              The proof is committed on-chain — independently verifiable by anyone.
            </p>
          </div>
          <button
            onClick={() => load(page * PER_PAGE)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 text-sm font-semibold rounded-xl hover:bg-blue-600/20 transition-all disabled:opacity-40 shrink-0"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Confirmed",   value: meta?.total?.toLocaleString()       ?? '—', color: "text-white",       bg: "bg-gray-800/60" },
            { label: "TEE Verified",      value: meta?.teeVerified?.toLocaleString() ?? '—', color: "text-green-400",   bg: "bg-green-500/8 border border-green-500/20" },
            { label: "Verification Rate", value: `${verifiedRate}%`,                          color: "text-blue-400",    bg: "bg-blue-500/8 border border-blue-500/20" },
            { label: "Chain",             value: meta?.chainName ?? ACTIVE_CHAIN.name,        color: "text-purple-400",  bg: "bg-purple-500/8 border border-purple-500/20" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-5`}>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">{s.label}</p>
              <p className={`text-2xl font-black ${s.color} tabular-nums`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* TEE Architecture explainer */}
        <div className="card p-5 border-blue-500/20">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white mb-1">How TEE Verification Works</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Every optimization request is routed to a 0G Compute TeeML node. The AI model runs inside an Intel SGX enclave —
                isolated from the host OS. The enclave signs the result with its private key (<code className="text-blue-400 font-mono text-[11px]">tee_signer</code>),
                producing a <code className="text-blue-400 font-mono text-[11px]">tee_proof</code> hash.
                The optimization result + Merkle root is uploaded to <strong className="text-white">0G Storage</strong> and the root committed on-chain.
                Each row below contains the on-chain tx link, storage root, and TEE proof — all independently verifiable.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {["0G Compute TeeML", "0G Storage Log", "0G Chain", "0G DA"].map(c => (
                  <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Proof table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Attestation Records</h2>
              <p className="text-xs text-gray-500 mt-0.5">Confirmed TEE-attested optimizations — click any row to expand proof</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500 font-mono">{ACTIVE_CHAIN.name}</span>
            </div>
          </div>

          {loading ? (
            <div className="p-8 space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-12 bg-gray-800/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-red-400 mb-3">{error}</p>
              <button
                onClick={() => load(page * PER_PAGE)}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          ) : proofs.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <p className="text-sm text-gray-500">No confirmed proofs yet.</p>
              <p className="text-xs text-gray-600 mt-1">Run an optimization on the <Link href="/transactions" className="text-blue-400 hover:underline">AI Optimizer</Link> to generate your first proof.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/60">
              {proofs.map(p => (
                <div key={p.id}>
                  {/* Collapsed row */}
                  <button
                    onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                    className="w-full px-6 py-4 hover:bg-gray-800/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* TEE badge */}
                      <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        p.teeVerified
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-gray-700/40 text-gray-500 border-gray-700'
                      }`}>
                        {p.teeVerified ? '✓ TEE' : 'Unverified'}
                      </span>

                      {/* On-chain link */}
                      {p.explorerUrl ? (
                        <a
                          href={p.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-xs font-mono text-blue-400 hover:text-blue-300 hover:underline shrink-0"
                        >
                          {shortHash(p.txHash, 18)}
                        </a>
                      ) : (
                        <span className="text-xs font-mono text-gray-600 shrink-0">{shortHash(p.txHash, 18)}</span>
                      )}

                      <span className="text-xs text-gray-400 truncate flex-1 min-w-[80px]">{p.route}</span>

                      <div className="flex items-center gap-4 ml-auto shrink-0">
                        <span className="text-sm font-bold text-white tabular-nums">${p.amount.toLocaleString()}</span>
                        <span className="text-sm font-semibold text-green-400 tabular-nums">+${p.savings.toFixed(2)}</span>
                        <span className="text-xs text-gray-600">{timeAgo(p.timestamp)}</span>
                        <svg className={`w-3.5 h-3.5 text-gray-600 transition-transform ${expanded === p.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Expanded proof detail */}
                  {expanded === p.id && (
                    <div className="px-6 pb-5 bg-gray-900/40 border-t border-gray-800/40 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                        {[
                          { label: "TEE Signer",     value: p.teeSigner  || '(not provided)', mono: true  },
                          { label: "Provider ID",    value: p.providerId || '(not provided)', mono: true  },
                          { label: "ML Engine",      value: p.mlEngine   || '(not provided)', mono: false },
                          { label: "Route",          value: p.route,         mono: false },
                          { label: "TEE Proof Hash", value: p.teeProof || '(stored on 0G Storage)', mono: true },
                          { label: "ZK Commitment",  value: p.zkCommitment || '(not generated)', mono: true },
                          { label: "0G Storage Root",value: p.storageRoot || '(no storage upload)', mono: true },
                          { label: "Timestamp",      value: new Date(p.timestamp).toISOString(), mono: true },
                        ].map(f => (
                          <div key={f.label} className="bg-gray-800/60 rounded-xl p-3">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">{f.label}</p>
                            <p className={`text-xs text-gray-300 break-all leading-relaxed ${f.mono ? 'font-mono' : ''}`}>{f.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Verify links */}
                      <div className="flex flex-wrap gap-2 pt-1">
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.total > PER_PAGE && (
            <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-xs text-gray-500 hover:text-white disabled:opacity-30 transition-colors font-medium"
              >← Newer</button>
              <span className="text-xs text-gray-600">Page {page + 1}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={(page + 1) * PER_PAGE >= meta.total}
                className="text-xs text-gray-500 hover:text-white disabled:opacity-30 transition-colors font-medium"
              >Older →</button>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
