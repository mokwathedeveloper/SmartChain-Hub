import Head from "next/head";
import Link from "next/link";

const stats = [
  { label: "Transactions Optimized", value: "124K+", icon: "⚡" },
  { label: "Total Savings", value: "$2.4M", icon: "💰" },
  { label: "Active Agents", value: "8,200+", icon: "🤖" },
  { label: "0G Chain TXs", value: "340K+", icon: "🔗" },
];

const features = [
  {
    icon: (
      <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    title: "Soulbound Agent ID",
    desc: "Every user gets a non-transferable on-chain identity. Your agent's reputation, memory, and model hash live permanently on 0G Chain.",
    badge: "0G Chain",
    badgeColor: "bg-blue-500/20 text-blue-300",
  },
  {
    icon: (
      <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
      </svg>
    ),
    title: "TEE-Verified AI Inference",
    desc: "Transaction optimization runs inside a Trusted Execution Environment via 0G Compute. Every result is cryptographically signed — not just a black box.",
    badge: "0G Compute",
    badgeColor: "bg-purple-500/20 text-purple-300",
  },
  {
    icon: (
      <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
      </svg>
    ),
    title: "Persistent Agent Memory",
    desc: "Agent memory is stored on 0G Storage KV layer — not localStorage. Reset your browser, switch devices. Your agent still remembers you.",
    badge: "0G Storage",
    badgeColor: "bg-green-500/20 text-green-300",
  },
  {
    icon: (
      <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    title: "Automated Revenue Sharing",
    desc: "0.5% of every transaction fee flows automatically to stakers. Stake A0GI, earn 5% APY plus a share of all platform activity.",
    badge: "0G Chain",
    badgeColor: "bg-yellow-500/20 text-yellow-300",
  },
  {
    icon: (
      <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
      </svg>
    ),
    title: "Immutable Transaction Receipts",
    desc: "Every optimization is uploaded to 0G Storage Log layer. The Merkle root is committed on-chain — a permanent, tamper-proof audit trail.",
    badge: "0G Storage",
    badgeColor: "bg-cyan-500/20 text-cyan-300",
  },
  {
    icon: (
      <svg className="w-7 h-7 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
    title: "AI Route Optimization",
    desc: "TensorFlow model with 6 features — amount, priority, congestion, time-of-day — finds the cheapest, fastest, or most secure route for every transaction.",
    badge: "TensorFlow",
    badgeColor: "bg-rose-500/20 text-rose-300",
  },
];

const steps = [
  { n: "01", title: "Connect Wallet", desc: "Connect MetaMask to 0G Galileo Testnet. Your wallet becomes your agent's sovereign identity." },
  { n: "02", title: "Mint Agent ID", desc: "Mint your soulbound NFT on 0G Chain. Non-transferable. Stores your model hash, memory root, and reputation." },
  { n: "03", title: "Optimize Transactions", desc: "Enter an amount. The AI runs inside a TEE on 0G Compute and returns the optimal route with a cryptographic proof." },
  { n: "04", title: "Earn & Stake", desc: "Every optimization earns revenue. Stake A0GI to earn 5% APY plus a share of all platform fees." },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>SmartChain Hub | Sovereign AI Agents on 0G</title>
        <meta name="description" content="Decentralized AI commerce platform with soulbound Agent ID, TEE-verified inference, and persistent memory on 0G." />
      </Head>

      {/* ── HERO ── */}
      <section className="relative bg-gray-950 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"/>
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-3xl"/>

        <div className="relative container mx-auto px-6 max-w-6xl pt-24 pb-32">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left */}
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold mb-6">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"/>
                0G APAC Hackathon 2026 — Track 3
              </div>
              <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-6">
                Your AI Agent.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Sovereign on 0G.
                </span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                SmartChain Hub gives every user a sovereign AI agent with soulbound identity, persistent memory, and TEE-verified intelligence — all powered by the full 0G modular stack.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/signup"
                  className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/25 text-sm">
                  Launch App →
                </Link>
                <a href="https://scan-testnet.0g.ai/address/0x69C619374c6B901b99941Df7238fceb80d7DCd08"
                  target="_blank" rel="noreferrer"
                  className="px-7 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all text-sm">
                  View on ChainScan ↗
                </a>
              </div>

              {/* Contract badges */}
              <div className="flex flex-wrap gap-2 mt-8">
                {[
                  { label: "AgentID", addr: "0x69C6...Cd08" },
                  { label: "Transaction", addr: "0xf95A...C52" },
                  { label: "Payments", addr: "0x540a...7eB" },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"/>
                    <span className="text-xs text-gray-400 font-mono">{c.label}: {c.addr}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Agent ID Card mockup */}
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-sm">
                {/* Agent ID Card */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/50 mb-4">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                      </div>
                      <span className="text-white font-bold text-sm">0G Agent ID</span>
                    </div>
                    <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">Soulbound</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[["Reputation","42"],["Optimizations","42"],["Since","Apr 2026"]].map(([l,v]) => (
                      <div key={l} className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-xs text-white/60 mb-1">{l}</p>
                        <p className="text-sm font-bold text-white">{v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 mb-3">
                    <p className="text-xs text-white/60 mb-1">Memory Root (0G KV)</p>
                    <p className="text-xs font-mono text-white/80 truncate">0x7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c...</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs text-white/60 mb-1">Model Hash (TF Weights)</p>
                    <p className="text-xs font-mono text-white/80 truncate">0x9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a...</p>
                  </div>
                </div>

                {/* TEE Badge */}
                <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-400">✓ Verified inside TEE — TeeML</p>
                    <p className="text-xs text-gray-500">Provider: 0g-compute-node-sg-01</p>
                    <p className="text-xs font-mono text-gray-600 truncate">Proof: 0x4a7f2b9c1d3e...</p>
                  </div>
                  <span className="ml-auto text-xs px-2 py-1 bg-blue-600 text-white rounded-full font-bold shrink-0">0G Compute</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-gray-900 border-y border-gray-800">
        <div className="container mx-auto px-6 max-w-6xl py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl mb-1">{s.icon}</div>
                <div className="text-3xl font-black text-white mb-1">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-gray-950 py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Full 0G Stack</span>
            <h2 className="text-4xl font-black text-white mt-3 mb-4">Built different. Not just ChatGPT with a tip jar.</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Every feature is powered by a specific 0G primitive — not a centralized database pretending to be Web3.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-white font-bold text-base">{f.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.badgeColor}`}>{f.badge}</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-gray-900 py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">How It Works</span>
            <h2 className="text-4xl font-black text-white mt-3">From wallet to sovereign agent in 4 steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.n} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-blue-600/50 to-transparent z-10"/>
                )}
                <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
                  <div className="text-4xl font-black text-blue-600/30 mb-4">{s.n}</div>
                  <h3 className="text-white font-bold mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLYWHEEL ── */}
      <section className="bg-gray-950 py-24">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Economic Flywheel</span>
          <h2 className="text-4xl font-black text-white mt-3 mb-6">3 on-chain interactions per user action</h2>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              "Optimize Transaction",
              "→ 0G Compute TEE",
              "→ 0G Storage Receipt",
              "→ Agent ID Update",
              "→ Revenue Share",
              "→ Stake & Earn",
              "→ Loop",
            ].map((step, i) => (
              <span key={i} className={`px-4 py-2 rounded-full text-sm font-semibold ${
                step.startsWith("→") ? "text-gray-500" :
                i === 0 ? "bg-blue-600 text-white" :
                "bg-gray-800 text-gray-300 border border-gray-700"
              }`}>{step}</span>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-2xl p-10">
            <h3 className="text-3xl font-black text-white mb-4">Ready to launch your sovereign agent?</h3>
            <p className="text-gray-400 mb-8">Connect your wallet, mint your Agent ID, and start optimizing transactions on 0G.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/signup"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/25">
                Get Started Free →
              </Link>
              <a href="https://github.com/mokwathedeveloper/SmartChain-Hub" target="_blank" rel="noreferrer"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                View Source
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
