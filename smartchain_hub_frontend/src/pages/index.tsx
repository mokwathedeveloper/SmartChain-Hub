import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabase";
import type { User } from "@supabase/supabase-js";

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K+`;
  return n > 0 ? n.toLocaleString() : '—';
}

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return n > 0 ? `$${n.toFixed(2)}` : '$0';
}

const features = [
  {
    icon: (
      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    iconBg: "bg-blue-500/10 border border-blue-500/20",
    title: "Soulbound Agent ID",
    desc: "Every user gets a non-transferable on-chain identity. Your agent's reputation, memory, and model hash live permanently on 0G Chain.",
    badge: "0G Chain",
    badgeColor: "bg-blue-500/15 text-blue-300 border border-blue-500/20",
    accent: "from-blue-500/20 to-transparent",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
      </svg>
    ),
    iconBg: "bg-purple-500/10 border border-purple-500/20",
    title: "TEE-Verified AI Inference",
    desc: "Transaction optimization runs inside a Trusted Execution Environment via 0G Compute. Every result is cryptographically signed — not just a black box.",
    badge: "0G Compute",
    badgeColor: "bg-purple-500/15 text-purple-300 border border-purple-500/20",
    accent: "from-purple-500/20 to-transparent",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
      </svg>
    ),
    iconBg: "bg-green-500/10 border border-green-500/20",
    title: "Persistent Agent Memory",
    desc: "Agent memory is stored on 0G Storage KV layer — not localStorage. Reset your browser, switch devices. Your agent still remembers you.",
    badge: "0G Storage",
    badgeColor: "bg-green-500/15 text-green-300 border border-green-500/20",
    accent: "from-green-500/20 to-transparent",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    iconBg: "bg-yellow-500/10 border border-yellow-500/20",
    title: "Automated Revenue Sharing",
    desc: "0.5% of every transaction fee flows automatically to stakers. Stake A0GI, earn 5% APY plus a share of all platform activity.",
    badge: "0G Chain",
    badgeColor: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/20",
    accent: "from-yellow-500/20 to-transparent",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
      </svg>
    ),
    iconBg: "bg-cyan-500/10 border border-cyan-500/20",
    title: "Immutable Transaction Receipts",
    desc: "Every optimization is uploaded to 0G Storage Log layer. The Merkle root is committed on-chain — a permanent, tamper-proof audit trail.",
    badge: "0G Storage",
    badgeColor: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20",
    accent: "from-cyan-500/20 to-transparent",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
    iconBg: "bg-rose-500/10 border border-rose-500/20",
    title: "AI Route Optimization",
    desc: "TensorFlow model with 6 features — amount, priority, congestion, time-of-day — finds the cheapest, fastest, or most secure route for every transaction.",
    badge: "TensorFlow",
    badgeColor: "bg-rose-500/15 text-rose-300 border border-rose-500/20",
    accent: "from-rose-500/20 to-transparent",
  },
];

// ── Guided Demo Modal ──────────────────────────────────────────────────────
const DEMO_STEPS = [
  {
    id: 'agent-id',
    label: 'Mint Agent ID',
    badge: '0G Chain',
    badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    icon: (
      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    title: 'Soulbound Agent ID Minted',
    description: 'A non-transferable NFT is created on 0G Chain. Your agent\'s reputation, model hash, and memory root are permanently recorded.',
    detail: (
      <div className="space-y-2 mt-4">
        <div className="bg-black/40 rounded-xl p-4 border border-white/5 font-mono text-xs space-y-2">
          <div className="flex justify-between"><span className="text-gray-500">Agent ID</span><span className="text-blue-300">#0042</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="text-green-400">✓ Soulbound</span></div>
          <div className="flex justify-between gap-4"><span className="text-gray-500 shrink-0">Model Hash</span><span className="text-gray-300 truncate">0x9d8c7b6a5f4e3d2c…</span></div>
          <div className="flex justify-between gap-4"><span className="text-gray-500 shrink-0">Memory Root</span><span className="text-gray-300 truncate">0x7f3a9b2c1d4e5f6a…</span></div>
          <div className="flex justify-between"><span className="text-gray-500">TX</span><span className="text-cyan-400">0x4a7f…3e01 ✓</span></div>
        </div>
      </div>
    ),
    href: '/dashboard',
    hrefLabel: 'Go to Dashboard →',
  },
  {
    id: 'optimize',
    label: 'AI Optimization',
    badge: '0G Compute TEE',
    badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    icon: (
      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
    title: 'Transaction Optimized Inside TEE',
    description: 'LLaMA 3.1 8B runs inside an SGX Trusted Execution Environment on 0G Compute. The result is cryptographically signed — not just a heuristic.',
    detail: (
      <div className="space-y-2 mt-4">
        <div className="bg-black/40 rounded-xl p-4 border border-white/5 font-mono text-xs space-y-2">
          <div className="flex justify-between"><span className="text-gray-500">Input Amount</span><span className="text-white">$10,000.00</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Priority</span><span className="text-purple-300">Efficiency</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Estimated Fee</span><span className="text-white">$50.00</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Savings</span><span className="text-green-400">$30.00</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Route</span><span className="text-cyan-300">0G Flash Route v2</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Confidence</span><span className="text-yellow-300">91.2%</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Engine</span><span className="text-purple-300">TeeML / LLaMA 3.1 8B</span></div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
          <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          <p className="text-xs text-purple-300"><span className="font-semibold">✓ TEE Verified</span> — inference ran inside SGX on 0G Compute</p>
        </div>
      </div>
    ),
    href: '/transactions?demo=true',
    hrefLabel: 'Try Optimizer →',
  },
  {
    id: 'zk-proof',
    label: 'ZK Proof',
    badge: '0G Chain',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    icon: (
      <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
      </svg>
    ),
    title: 'ZK Commitment Anchored On-Chain',
    description: 'A SHA-256 commitment of the TEE result is recorded on 0G Chain — anyone can verify the proof without re-running the model.',
    detail: (
      <div className="space-y-2 mt-4">
        <div className="bg-black/40 rounded-xl p-4 border border-white/5 font-mono text-xs space-y-2">
          <div className="flex justify-between gap-4"><span className="text-gray-500 shrink-0">ZK Hash</span><span className="text-cyan-300 truncate">SHA-256:a3f7c9…1d2e</span></div>
          <div className="flex justify-between gap-4"><span className="text-gray-500 shrink-0">Proof Root</span><span className="text-gray-300 truncate">0xb2c4d6e8f0a1…bc3d</span></div>
          <div className="flex justify-between"><span className="text-gray-500">TEE Provider</span><span className="text-blue-300">0g-compute-sg-01</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Block</span><span className="text-white">#8,204,193</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Verified</span><span className="text-green-400">✓ On-Chain</span></div>
        </div>
      </div>
    ),
    href: '/proof',
    hrefLabel: 'View Proof Page →',
  },
  {
    id: 'da-anchor',
    label: 'DA Activity Feed',
    badge: '0G DA Layer',
    badgeColor: 'bg-green-500/20 text-green-300 border border-green-500/30',
    icon: (
      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
      </svg>
    ),
    title: 'Blob Anchored on 0G DA Layer',
    description: 'Transaction metadata is uploaded to 0G Storage Log and the blob root is submitted to the 0G DA Disperser — permanent, sharded, and retrievable.',
    detail: (
      <div className="space-y-2 mt-4">
        <div className="bg-black/40 rounded-xl p-4 border border-white/5 font-mono text-xs space-y-2">
          <div className="flex justify-between gap-4"><span className="text-gray-500 shrink-0">Blob ID</span><span className="text-green-300 truncate">a3f7c9b2…1d2e4f5a</span></div>
          <div className="flex justify-between gap-4"><span className="text-gray-500 shrink-0">Storage Root</span><span className="text-gray-300 truncate">0xc1d2e3f4…7a8b</span></div>
          <div className="flex justify-between"><span className="text-gray-500">DA Node</span><span className="text-blue-300">da-rpc-testnet.0g.ai</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Shards</span><span className="text-white">16 / 16 ✓</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="text-green-400">✓ Dispersed</span></div>
        </div>
      </div>
    ),
    href: '/activity',
    hrefLabel: 'View Activity Feed →',
  },
  {
    id: 'revenue',
    label: 'Revenue Share',
    badge: '0G Chain',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    icon: (
      <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    title: 'Revenue Distributed to Stakers',
    description: '10% of every fee is distributed proportionally to stakers via SmartChainRevenue.sol. Stake A0GI, earn 5% APY plus a share of all platform activity.',
    detail: (
      <div className="space-y-2 mt-4">
        <div className="bg-black/40 rounded-xl p-4 border border-white/5 font-mono text-xs space-y-2">
          <div className="flex justify-between"><span className="text-gray-500">Platform Fee</span><span className="text-white">$50.00</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Revenue Pool (10%)</span><span className="text-yellow-300">$5.00</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Your Stake Share</span><span className="text-white">33.3%</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Your Earnings</span><span className="text-green-400">+$1.67 A0GI</span></div>
          <div className="flex justify-between"><span className="text-gray-500">APY</span><span className="text-yellow-300">5.0%</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Contract</span><span className="text-cyan-400">Revenue.sol ✓</span></div>
        </div>
      </div>
    ),
    href: '/revenue',
    hrefLabel: 'View Revenue →',
  },
];

function GuidedDemoModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = (next: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 200);
  };

  const advance = () => {
    if (step < DEMO_STEPS.length - 1) goTo(step + 1);
  };
  const back = () => {
    if (step > 0) goTo(step - 1);
  };

  // Auto-advance every 6 seconds
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (step < DEMO_STEPS.length - 1) advance();
    }, 6000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const current = DEMO_STEPS[step];
  const isLast = step === DEMO_STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Guided Tour</span>
            <span className="text-xs text-gray-700">·</span>
            <span className="text-xs text-gray-500">{step + 1} / {DEMO_STEPS.length}</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 mb-5">
          <div className="flex gap-1.5">
            {DEMO_STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                className={`h-1 rounded-full transition-all duration-300 flex-1 ${
                  i < step ? 'bg-blue-500' : i === step ? 'bg-blue-400' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step indicator pills */}
        <div className="px-6 mb-5 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {DEMO_STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap shrink-0 transition-all border ${
                i === step
                  ? 'bg-blue-600 text-white border-blue-500'
                  : i < step
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                  : 'bg-white/5 text-gray-500 border-white/10'
              }`}
            >
              {i < step ? '✓ ' : ''}{s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          className="px-6 pb-2 transition-opacity duration-200"
          style={{ opacity: animating ? 0 : 1 }}
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              {current.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${current.badgeColor}`}>{current.badge}</span>
              </div>
              <h3 className="text-white font-bold text-base leading-snug">{current.title}</h3>
            </div>
          </div>

          <p className="text-sm text-gray-400 leading-relaxed mb-1">{current.description}</p>

          {current.detail}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 flex items-center justify-between gap-3 border-t border-white/5 mt-4">
          <button
            onClick={back}
            disabled={step === 0}
            className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Back
          </button>

          <div className="flex items-center gap-2">
            <Link
              href={current.href}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              {current.hrefLabel}
            </Link>

            {!isLast ? (
              <button
                onClick={advance}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-blue-600/20"
              >
                Next →
              </button>
            ) : (
              <Link
                href="/transactions?demo=true"
                onClick={onClose}
                className="px-5 py-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-violet-600/20"
              >
                Try It Live →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const steps = [
  {
    n: "01",
    title: "Connect Wallet or Try Demo",
    desc: "Use Demo Mode instantly — no wallet needed. Or connect MetaMask to 0G Galileo Testnet for full on-chain interactions.",
    icon: (
      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
      </svg>
    ),
  },
  {
    n: "02",
    title: "Mint Agent ID",
    desc: "Mint your soulbound NFT on 0G Chain. Non-transferable. Stores your model hash, memory root, and reputation.",
    icon: (
      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
  },
  {
    n: "03",
    title: "Optimize Transactions",
    desc: "Enter an amount. The AI runs inside a TEE on 0G Compute and returns the optimal route with a cryptographic proof.",
    icon: (
      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
  },
  {
    n: "04",
    title: "Earn & Stake",
    desc: "Every optimization earns revenue. Stake A0GI to earn 5% APY plus a share of all platform fees.",
    icon: (
      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
];


interface LiveStats {
  totalOptimizations: number;
  totalSavingsUsd: number;
  activeUsers: number;
  totalChainTxs: number;
}

export default function Home() {
  const router = useRouter();
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedInUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedInUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetch('/api/og-stats')
      .then(r => r.ok ? r.json() as Promise<LiveStats> : null)
      .then(data => { if (data) setLiveStats(data); })
      .catch(() => {});
  }, []);

  return (
    <>
      <Head>
        <title>SmartChain Hub | Sovereign AI Agents on 0G</title>
        <meta name="description" content="Decentralized AI commerce platform with soulbound Agent ID, TEE-verified inference, and persistent memory on 0G." />
      </Head>

      {showDemo && <GuidedDemoModal onClose={() => setShowDemo(false)} />}

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative bg-gray-950 overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.025)_1px,transparent_1px)] bg-[size:72px_72px]" />

        {/* Ambient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-0 w-64 h-64 bg-indigo-600/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/6 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 sm:px-6 max-w-6xl pt-16 sm:pt-28 pb-16 sm:pb-36">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left */}
            <div className="flex-1 max-w-2xl w-full animate-fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold mb-6 hover:bg-blue-500/15 transition-colors cursor-default">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"/>
                0G APAC Hackathon 2026 — Track 3: Agentic Economy
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-5">
                Your AI Agent.<br/>
                <span className="text-gradient">Sovereign on 0G.</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-400 mb-8 leading-relaxed max-w-xl">
                SmartChain Hub gives every user a sovereign AI agent with soulbound identity, persistent memory, and TEE-verified intelligence — all powered by the full 0G modular stack.
              </p>

              {loggedInUser ? (
                /* ── Logged-in CTA ── */
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <Link href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:-translate-y-0.5 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => setShowDemo(true)}
                    className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl transition-all text-sm hover:-translate-y-0.5">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Guided Tour
                  </button>
                </div>
              ) : (
                /* ── Guest CTA ── */
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <Link href="/transactions?demo=true"
                    className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Try Demo — No Wallet Needed
                  </Link>
                  <button
                    onClick={() => setShowDemo(true)}
                    className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl transition-all text-sm hover:-translate-y-0.5">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Guided Tour
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-600 mt-2">
                {loggedInUser
                  ? `Signed in as ${loggedInUser.email ?? loggedInUser.user_metadata?.full_name ?? 'your account'}`
                  : "No signup required for demo · Full features with account"}
              </p>

              {/* Contract badges */}
              <div className="flex flex-wrap gap-2 mt-8">
                {[
                  { label: "AgentID", addr: "0x69C6...Cd08" },
                  { label: "Transaction", addr: "0xf95A...C52" },
                  { label: "Payments", addr: "0x540a...7eB" },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-lg transition-colors cursor-default">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"/>
                    <span className="text-xs text-gray-400 font-mono">{c.label}: <span className="text-gray-500">{c.addr}</span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Agent ID card */}
            <div className="flex-1 flex justify-center w-full animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="w-full max-w-sm">
                {/* Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/60 mb-4">
                  {/* Card gloss */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                      </div>
                      <span className="text-white font-bold text-sm">0G Agent ID</span>
                    </div>
                    <span className="text-xs bg-white/15 text-white px-2.5 py-1 rounded-full font-semibold border border-white/10">Soulbound</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 mb-4">
                    {[["Reputation","42"],["Optimizations","42"],["Since","Apr 2026"]].map(([l,v]) => (
                      <div key={l} className="bg-white/10 rounded-xl p-3 text-center border border-white/5">
                        <p className="text-[10px] text-white/50 mb-1 uppercase tracking-wider">{l}</p>
                        <p className="text-sm font-bold text-white">{v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/8 rounded-xl p-3 mb-2.5 border border-white/5">
                    <p className="text-[10px] text-white/50 mb-1 uppercase tracking-wider">Memory Root (0G KV)</p>
                    <p className="text-xs font-mono text-white/70 truncate">0x7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c...</p>
                  </div>
                  <div className="bg-white/8 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-white/50 mb-1 uppercase tracking-wider">Model Hash (TF Weights)</p>
                    <p className="text-xs font-mono text-white/70 truncate">0x9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a...</p>
                  </div>
                </div>

                {/* TEE Badge */}
                <div className="bg-gray-900 border border-blue-500/25 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600/90 flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-blue-400">✓ Verified inside TEE — TeeML</p>
                    <p className="text-xs text-gray-500">Provider: 0g-compute-node-sg-01</p>
                    <p className="text-xs font-mono text-gray-600 truncate">Proof: 0x4a7f2b9c1d3e...</p>
                  </div>
                  <span className="ml-auto shrink-0 text-xs px-2.5 py-1.5 bg-blue-600 text-white rounded-lg font-bold">0G Compute</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────── */}
      <section className="bg-gray-900 border-y border-gray-800">
        <div className="container mx-auto px-6 max-w-6xl py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                label: "Transactions Optimized",
                value: liveStats ? fmtCount(liveStats.totalOptimizations) : '—',
                sub: liveStats ? 'on-chain confirmed' : 'loading…',
                icon: <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
                color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20",
              },
              {
                label: "User Savings",
                value: liveStats ? fmtUsd(liveStats.totalSavingsUsd) : '—',
                sub: liveStats ? 'total fee savings' : 'loading…',
                icon: <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
                color: "text-green-400", bg: "bg-green-500/10 border-green-500/20",
              },
              {
                label: "Sovereign Agents",
                value: liveStats ? fmtCount(liveStats.activeUsers) : '—',
                sub: liveStats ? 'active users' : 'loading…',
                icon: <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/></svg>,
                color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20",
              },
              {
                label: "0G Chain TXs",
                value: liveStats ? fmtCount(liveStats.totalChainTxs) : '—',
                sub: liveStats ? 'on-chain records' : 'loading…',
                icon: <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>,
                color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20",
              },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center sm:flex-row sm:items-center gap-3 sm:gap-4 group">
                <div className={`w-11 h-11 shrink-0 rounded-xl border flex items-center justify-center ${s.bg} group-hover:scale-110 transition-transform`}>
                  {s.icon}
                </div>
                <div className="text-center sm:text-left">
                  <div className={`text-2xl sm:text-3xl font-black ${s.color} tabular-nums`}>{s.value}</div>
                  <div className="text-xs sm:text-sm text-gray-500 leading-tight mt-0.5">{s.label}</div>
                  <div className="text-[10px] text-gray-700 leading-tight mt-0.5 italic">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section className="bg-gray-950 py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <span className="section-label">Full 0G Stack</span>
            <h2 className="section-title mt-3 mb-4">
              Built different.<br className="sm:hidden"/>
              <span className="text-gray-400 font-normal"> Not just ChatGPT with a tip jar.</span>
            </h2>
            <p className="section-sub max-w-xl mx-auto">Every feature is powered by a specific 0G primitive — not a centralized database pretending to be Web3.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="feature-card group">
                {/* Top gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${f.accent}`} />

                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <div className="flex items-start gap-2 mb-3">
                  <h3 className="text-white font-bold text-base leading-snug">{f.title}</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{f.desc}</p>
                <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-semibold ${f.badgeColor}`}>{f.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="bg-gray-900 py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <span className="section-label">How It Works</span>
            <h2 className="section-title mt-3">From wallet to sovereign agent in 4 steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

            {steps.map((s, idx) => (
              <div key={s.n} className="card-hover p-6 flex flex-col gap-4 group relative"
                style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 group-hover:border-blue-500/40 transition-all">
                    {s.icon}
                  </div>
                  <span className="text-xs font-black text-blue-400/60 tracking-widest">{s.n}</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDEO DEMO ───────────────────────────────────────────── */}
      <section className="bg-gray-950 py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-10">
            <span className="section-label">See It In Action</span>
            <h2 className="section-title mt-3 mb-4">Watch the demo</h2>
            <p className="section-sub max-w-xl mx-auto">See SmartChain Hub running live — AI optimization inside a TEE, soulbound identity, and on-chain receipts in real time.</p>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-gray-900">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent z-10" />
            <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
              <iframe
                src="https://www.loom.com/embed/c7eb4766f3cc4e5d84bab3b47e213670?hide_owner=true&hide_share=true&hide_title=false&hideEmbedTopBar=false"
                frameBorder="0"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                title="SmartChain Hub Demo"
              />
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-4">Watch SmartChain Hub optimize a real transaction on 0G Compute</p>
        </div>
      </section>

      {/* ── FLYWHEEL ─────────────────────────────────────────────── */}
      <section className="bg-gray-950 py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <span className="section-label">Economic Flywheel</span>
            <h2 className="section-title mt-3 mb-4">4 on-chain actions per user optimization</h2>
            <div className="flex flex-wrap justify-center gap-2.5">
              {[
                { text: "Optimize", main: true },
                { text: "→ 0G Compute TEE", arrow: true },
                { text: "→ 0G Storage Receipt", arrow: true },
                { text: "→ Agent ID Update", arrow: true },
                { text: "→ Revenue Share", arrow: true },
                { text: "→ Stake & Earn", arrow: true },
                { text: "⟳ Loop", loop: true },
              ].map((s, i) => (
                <span key={i} className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  s.main ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' :
                  s.loop ? 'bg-green-600 text-white shadow-md shadow-green-600/20' :
                  'text-gray-500'
                }`}>{s.text}</span>
              ))}
            </div>
          </div>

          {/* CTA box */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 p-8 sm:p-12">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 to-indigo-700/15" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative text-center">
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">Try a live optimization now</h3>
              <p className="text-gray-400 mb-2 max-w-md mx-auto">Enter any amount. The AI runs inside a TEE on 0G Compute and returns an optimized route with a cryptographic proof — in seconds.</p>
              <p className="text-xs text-blue-400/70 mb-8">No wallet · No signup · Full on-chain demo</p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
                <Link href="/transactions?demo=true"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  Try Demo Free
                </Link>
                <a href="https://github.com/mokwathedeveloper/SmartChain-Hub" target="_blank" rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View Source
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
