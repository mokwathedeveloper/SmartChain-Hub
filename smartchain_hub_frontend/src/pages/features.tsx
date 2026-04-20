import Head from "next/head";
import Link from "next/link";

const features = [
  {
    category: "0G Chain",
    color: "blue",
    items: [
      {
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
        title: "Soulbound Agent ID",
        desc: "Every user gets a non-transferable NFT on 0G Chain. Stores your model hash, memory Merkle root, and reputation score. Cannot be copied or transferred — your agent is truly sovereign.",
        badge: "SmartChainAgentID.sol",
      },
      {
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
        title: "Automated Revenue Sharing",
        desc: "0.5% of every transaction fee is automatically distributed to stakers via SmartChainPayments. No manual payouts. No trust required. Pure on-chain logic.",
        badge: "SmartChainRevenue.sol",
      },
      {
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
        title: "On-Chain Transaction Records",
        desc: "Every AI-optimized transaction is recorded on 0G Chain with its route, fee, and Merkle root. Fully auditable. Fully immutable.",
        badge: "SmartChainTransaction.sol",
      },
    ],
  },
  {
    category: "0G Compute",
    color: "purple",
    items: [
      {
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/></svg>,
        title: "TEE-Verified AI Inference",
        desc: "Transaction optimization runs inside a Trusted Execution Environment via 0G Compute TeeML mode. Every result is cryptographically signed by the TEE — not just a black box.",
        badge: "TeeML Mode",
      },
      {
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
        title: "LLaMA 3.1 8B Optimization",
        desc: "When 0G Compute is available, LLaMA 3.1 8B analyzes your transaction and returns the optimal route. Falls back to local TensorFlow model automatically.",
        badge: "llama-3.1-8b-instruct",
      },
      {
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>,
        title: "TensorFlow Fallback Model",
        desc: "6-feature neural network (amount, priority, congestion, time-of-day) trained on synthetic data. Runs locally when 0G Compute broker is unavailable.",
        badge: "TF v2.16 · 6 features",
      },
    ],
  },
  {
    category: "0G Storage",
    color: "green",
    items: [
      {
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>,
        title: "Persistent Agent Memory",
        desc: "Agent memory is stored on 0G Storage KV layer — not localStorage. Reset your browser, switch devices, clear cookies. Your agent still remembers your preferences.",
        badge: "KV Layer",
      },
      {
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
        title: "Immutable Transaction Receipts",
        desc: "Every optimization is uploaded to 0G Storage Log layer using MemData. The Merkle root is committed on-chain — a permanent, tamper-proof audit trail.",
        badge: "Log Layer",
      },
      {
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>,
        title: "Merkle Root On-Chain",
        desc: "After every storage upload, the Merkle root hash is committed to the Agent ID contract on 0G Chain. Proves the agent's memory state at any point in time.",
        badge: "@0glabs/0g-ts-sdk",
      },
    ],
  },
];

const colorMap: Record<string, string> = {
  blue: "border-blue-500/20 bg-blue-500/5",
  purple: "border-purple-500/20 bg-purple-500/5",
  green: "border-green-500/20 bg-green-500/5",
};
const iconColorMap: Record<string, string> = {
  blue: "text-blue-400 bg-blue-500/10",
  purple: "text-purple-400 bg-purple-500/10",
  green: "text-green-400 bg-green-500/10",
};
const badgeColorMap: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  green: "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function Features() {
  return (
    <>
      <Head><title>Features | SmartChain Hub</title></Head>

      {/* Hero */}
      <section className="bg-gray-950 pt-20 pb-16 border-b border-gray-800">
        <div className="container mx-auto px-6 max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"/>
            Full 0G Modular Stack
          </div>
          <h1 className="text-5xl font-black text-white mb-5">
            Every feature powered by<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">a specific 0G primitive</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Not a centralized database pretending to be Web3. Every integration is verifiable, immutable, and sovereign.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/signup" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors text-sm">
              Launch App →
            </Link>
            <a href="https://github.com/mokwathedeveloper/SmartChain-Hub" target="_blank" rel="noreferrer"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-colors text-sm">
              View Source ↗
            </a>
          </div>
        </div>
      </section>

      {/* Feature sections */}
      {features.map((section) => (
        <section key={section.category} className="py-20 bg-gray-950 border-b border-gray-800">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="flex items-center gap-3 mb-10">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeColorMap[section.color]}`}>
                {section.category}
              </span>
              <div className="flex-1 h-px bg-gray-800"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {section.items.map((item) => (
                <div key={item.title} className={`rounded-2xl p-6 border ${colorMap[section.color]} hover:border-opacity-50 transition-all`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconColorMap[section.color]}`}>
                    {item.icon}
                  </div>
                  <h3 className="text-white font-bold text-base mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{item.desc}</p>
                  <span className={`text-xs px-2 py-1 rounded-lg border font-mono ${badgeColorMap[section.color]}`}>
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Comparison table */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-black text-white text-center mb-3">How we compare</h2>
          <p className="text-gray-500 text-center mb-12">Most "AI + Web3" projects are just ChatGPT with a tip jar.</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-4 text-gray-500 text-sm font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-gray-500 text-sm font-medium">Most Projects</th>
                  <th className="text-center py-4 px-4 text-blue-400 text-sm font-bold">SmartChain Hub</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Agent identity", "EOA wallet (copyable)", "Soulbound NFT on 0G Chain"],
                  ["Agent memory", "localStorage / DB", "0G Storage KV layer"],
                  ["Inference proof", "None", "TEE-signed via 0G Compute"],
                  ["Transaction receipts", "Centralized DB", "0G Storage Log + Merkle root"],
                  ["Revenue sharing", "Manual / none", "Automated on-chain"],
                  ["Model hash", "Unknown", "Stored in Agent ID on-chain"],
                ].map(([feature, them, us]) => (
                  <tr key={feature} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-4 text-gray-300 text-sm font-medium">{feature}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-gray-600 text-sm">{them}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-green-400 text-sm font-semibold">{us}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-4xl font-black text-white mb-4">Ready to build on the full 0G stack?</h2>
          <p className="text-gray-500 mb-8">Connect your wallet and mint your sovereign Agent ID in under 2 minutes.</p>
          <Link href="/signup" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors inline-block">
            Get Started Free →
          </Link>
        </div>
      </section>
    </>
  );
}
