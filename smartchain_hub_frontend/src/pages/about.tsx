import Head from "next/head";
import Link from "next/link";

const milestones = [
  { year: "Mar 2026", title: "Project Started", desc: "SmartChain Hub conceived for 0G APAC Hackathon Track 3." },
  { year: "Apr 2026", title: "Contracts Deployed", desc: "4 smart contracts live on 0G Galileo Testnet including soulbound AgentID." },
  { year: "Apr 2026", title: "Full Stack Live", desc: "Frontend on Vercel, AI agent with TF model, 0G Storage + Compute integrated." },
  { year: "May 2026", title: "Hackathon Submission", desc: "Submitted to 0G APAC Hackathon — Track 3: Agentic Economy." },
];

const stack = [
  { label: "0G Chain", desc: "4 contracts: AgentID, Transaction, Revenue, Payments", color: "blue", icon: "⛓️" },
  { label: "0G Compute", desc: "TeeML inference via broker SDK — LLaMA 3.1 8B", color: "purple", icon: "🧠" },
  { label: "0G Storage", desc: "Log layer for receipts, KV layer for agent memory", color: "green", icon: "💾" },
  { label: "Next.js 16", desc: "Frontend with TypeScript, Tailwind CSS, ethers.js", color: "gray", icon: "⚡" },
  { label: "Flask + TensorFlow", desc: "AI agent server with 6-feature neural network", color: "orange", icon: "🤖" },
  { label: "Supabase", desc: "Auth, real-time DB, Row Level Security", color: "teal", icon: "🗄️" },
];

export default function About() {
  return (
    <>
      <Head><title>About | SmartChain Hub</title></Head>

      {/* Hero */}
      <section className="bg-gray-950 pt-14 sm:pt-20 pb-10 sm:pb-16 border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold mb-6">
                0G APAC Hackathon 2026
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white mb-5 leading-tight">
                Built for the<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Agentic Economy</span>
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                SmartChain Hub is a decentralized AI commerce platform where every user has a sovereign AI agent with on-chain identity, persistent memory, and verifiable intelligence — powered by the full 0G modular stack.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/signup" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors text-sm">
                  Launch App →
                </Link>
                <a href="https://scan-testnet.0g.ai/address/0x69C619374c6B901b99941Df7238fceb80d7DCd08"
                  target="_blank" rel="noreferrer"
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-colors text-sm">
                  View on ChainScan ↗
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              {[
                { label: "Contracts Deployed", value: "4", sub: "0G Galileo Testnet" },
                { label: "0G Components", value: "5", sub: "Chain + Compute + Storage + KV + AgentID" },
                { label: "TF Model Features", value: "6", sub: "amount, priority, congestion, time..." },
                { label: "On-chain Interactions", value: "3×", sub: "per user action" },
              ].map(s => (
                <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <div className="text-3xl font-black text-white mb-1">{s.value}</div>
                  <div className="text-sm font-semibold text-gray-300 mb-1">{s.label}</div>
                  <div className="text-xs text-gray-600">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-12 sm:py-20 bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Our Mission</span>
              <h2 className="text-3xl font-black text-white mt-3 mb-5">
                Agents that own themselves. Not just wallets with prompts.
              </h2>
              <p className="text-gray-400 leading-relaxed mb-5">
                Most "AI + Web3" projects are ChatGPT with a tip jar. SmartChain Hub is different. We believe AI agents should have sovereign identity — an on-chain record of their intelligence, memory, and behavior that cannot be copied by stealing a private key.
              </p>
              <p className="text-gray-400 leading-relaxed">
                We built on 0G because it's the only modular stack that provides all the primitives needed: Agent ID for identity, Storage KV for memory, Compute for verifiable inference, and Chain for settlement. Everything else is just a database with a wallet.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { title: "Agent Sovereignty", desc: "Your agent's identity lives on 0G Chain as a soulbound NFT. It cannot be cloned, transferred, or impersonated.", icon: "🔐" },
                { title: "Verifiable Intelligence", desc: "Every AI inference is TEE-verified via 0G Compute. You can prove the model ran inside a trusted enclave.", icon: "✅" },
                { title: "Persistent Memory", desc: "Agent memory survives browser resets because it lives on 0G Storage KV — not in your browser.", icon: "🧠" },
                { title: "Economic Alignment", desc: "Revenue flows automatically to stakers. No manual payouts. No trust required. Pure on-chain logic.", icon: "💰" },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-4 p-4 bg-gray-950 border border-gray-800 rounded-xl">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-12 sm:py-20 bg-gray-950 border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Technology</span>
            <h2 className="text-3xl font-black text-white mt-3">Built with the full 0G stack</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stack.map(s => (
              <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all">
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="text-white font-bold mb-1">{s.label}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 sm:py-20 bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Timeline</span>
            <h2 className="text-3xl font-black text-white mt-3">From idea to deployment</h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-800"/>
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="relative z-10 w-16 h-16 rounded-full bg-blue-600/10 border border-blue-600/30 flex items-center justify-center shrink-0">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"/>
                  </div>
                  <div className="flex-1 bg-gray-950 border border-gray-800 rounded-2xl p-5">
                    <span className="text-xs text-blue-400 font-bold">{m.year}</span>
                    <h3 className="text-white font-bold mt-1 mb-1">{m.title}</h3>
                    <p className="text-gray-500 text-sm">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contracts */}
      <section className="py-12 sm:py-20 bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">On-Chain</span>
            <h2 className="text-3xl font-black text-white mt-3">Deployed contracts</h2>
          </div>
          <div className="space-y-3">
            {[
              { name: "SmartChainAgentID", addr: "0x69C619374c6B901b99941Df7238fceb80d7DCd08", desc: "Soulbound Agent ID — stores memoryRoot, modelHash, reputation" },
              { name: "SmartChainTransaction", addr: "0xf95A1610be22046c334E3bD1b11D2B88519E6C52", desc: "Records AI-optimized transactions on-chain" },
              { name: "SmartChainRevenue", addr: "0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08", desc: "Automated 10% revenue distribution to stakeholders" },
              { name: "SmartChainPayments", addr: "0x540aFf6B167F8B5889d852d124C545F5f876A7eB", desc: "Send, stake (5% APY), and claim earnings" },
            ].map(c => (
              <div key={c.name} className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-all">
                <span className="w-2 h-2 bg-green-400 rounded-full shrink-0"/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white font-bold text-sm">{c.name}</span>
                  </div>
                  <p className="text-gray-500 text-xs">{c.desc}</p>
                </div>
                <a href={`https://scan-testnet.0g.ai/address/${c.addr}`} target="_blank" rel="noreferrer"
                  className="text-xs font-mono text-blue-400 hover:text-blue-300 shrink-0 hidden sm:block">
                  {c.addr.slice(0, 10)}...{c.addr.slice(-6)} ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
