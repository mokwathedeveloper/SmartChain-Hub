import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { supabase } from "@/utils/supabase";

const stats = [
  {
    label: "Transactions Optimized",
    value: "124K+",
    sub: "projected at scale",
    icon: (
      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    label: "User Savings Potential",
    value: "$2.4M",
    sub: "estimated at capacity",
    icon: (
      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
  {
    label: "Sovereign Agents",
    value: "8,200+",
    sub: "addressable market",
    icon: (
      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
      </svg>
    ),
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    label: "0G Chain TXs",
    value: "340K+",
    sub: "system design capacity",
    icon: (
      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
      </svg>
    ),
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
];

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


export default function Home() {
  const router = useRouter();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard');
    });
  }, [router]);

  return (
    <>
      <Head>
        <title>SmartChain Hub | Sovereign AI Agents on 0G</title>
        <meta name="description" content="Decentralized AI commerce platform with soulbound Agent ID, TEE-verified inference, and persistent memory on 0G." />
      </Head>

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

              <div className="flex flex-wrap gap-3 sm:gap-4">
                {/* Primary — judges can try this immediately, no wallet required */}
                <Link href="/transactions"
                  className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  Try Demo — No Wallet Needed
                </Link>
                <Link href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl transition-all text-sm hover:-translate-y-0.5">
                  Launch App
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </Link>
              </div>
              <p className="text-xs text-gray-600 mt-2">No signup required for demo · Full features with MetaMask</p>

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
            {stats.map(s => (
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
                <Link href="/transactions"
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
