import Head from "next/head";
import Link from "next/link";

const BlockIllustration = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full">
    <defs>
      <linearGradient id="blk1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818CF8"/><stop offset="100%" stopColor="#3B82F6"/>
      </linearGradient>
    </defs>
    <rect x="70" y="30" width="60" height="60" rx="8" fill="url(#blk1)" opacity="0.85" transform="rotate(15 100 60)"/>
    <rect x="90" y="50" width="55" height="55" rx="8" fill="#60A5FA" opacity="0.6" transform="rotate(-10 117 77)"/>
    <rect x="60" y="70" width="80" height="50" rx="8" fill="#818CF8" opacity="0.5"/>
    <circle cx="100" cy="80" r="18" fill="white" opacity="0.9"/>
    <circle cx="100" cy="80" r="10" fill="url(#blk1)" opacity="0.7"/>
  </svg>
);

const FeatureIllustration = ({ color }: { color: string }) => (
  <div className={`w-full h-36 rounded-xl ${color} overflow-hidden flex items-center justify-center`}>
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <defs>
        <linearGradient id={`fg${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4"/>
        </linearGradient>
      </defs>
      <rect x="65" y="15" width="45" height="45" rx="6" fill={`url(#fg${color})`} transform="rotate(12 87 37)"/>
      <rect x="95" y="25" width="40" height="40" rx="6" fill="#818CF8" opacity="0.5" transform="rotate(-8 115 45)"/>
      <rect x="70" y="55" width="60" height="35" rx="6" fill="#60A5FA" opacity="0.55"/>
      <circle cx="100" cy="50" r="14" fill="white" opacity="0.85"/>
    </svg>
  </div>
);

export default function Features() {
  return (
    <>
      <Head><title>Features | SmartChain Hub</title></Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-16 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 max-w-lg">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Devgen Agents</h1>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Empowering decentralized commerce through autonomous AI agents that optimize every transaction, reduce fees, and ensure security at scale.
              </p>
              <Link href="/signup" className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">
                Get Started
              </Link>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-72 h-72">
                <BlockIllustration />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Feature Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Decentralized Data", desc: "Securely store and manage transaction data across a decentralized network with full redundancy and availability.", color: "bg-blue-50" },
              { title: "Formalization", desc: "Formalize business logic into smart contracts that execute automatically, removing the need for intermediaries.", color: "bg-purple-50" },
              { title: "Promising Technology", desc: "Built on cutting-edge 0G Chain infrastructure with Rust-optimized WASM contracts for maximum performance.", color: "bg-indigo-50" },
            ].map((card) => (
              <div key={card.title} className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">{card.desc}</p>
                <FeatureIllustration color={card.color} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
