import Head from "next/head";
import Link from "next/link";

const BlockIllustration = () => (
  <svg viewBox="0 0 280 220" className="w-full h-full">
    <defs>
      <linearGradient id="blk1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818CF8"/><stop offset="100%" stopColor="#3B82F6"/>
      </linearGradient>
      <linearGradient id="blk2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60A5FA"/><stop offset="100%" stopColor="#818CF8"/>
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="140" cy="185" rx="80" ry="18" fill="#818CF8" opacity="0.15"/>
    {/* Main large block */}
    <path d="M140 60 L200 92 L200 148 L140 180 L80 148 L80 92 Z" fill="url(#blk1)" opacity="0.85"/>
    <path d="M140 60 L200 92 L140 124 L80 92 Z" fill="#A5B4FC" opacity="0.9"/>
    <path d="M140 124 L200 92 L200 148 L140 180 Z" fill="#60A5FA" opacity="0.7"/>
    <path d="M140 124 L80 92 L80 148 L140 180 Z" fill="#818CF8" opacity="0.6"/>
    {/* Center icon */}
    <circle cx="140" cy="92" r="18" fill="white" opacity="0.95"/>
    <path d="M133 92l4 4 10-10" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Floating small blocks */}
    <path d="M210 55 L230 66 L230 88 L210 99 L190 88 L190 66 Z" fill="url(#blk2)" opacity="0.7"/>
    <path d="M210 55 L230 66 L210 77 L190 66 Z" fill="#93C5FD" opacity="0.8"/>
    <path d="M55 80 L70 88 L70 104 L55 112 L40 104 L40 88 Z" fill="#C4B5FD" opacity="0.6"/>
    <path d="M55 80 L70 88 L55 96 L40 88 Z" fill="#DDD6FE" opacity="0.8"/>
    {/* Particles */}
    <circle cx="220" cy="130" r="5" fill="#60A5FA" opacity="0.5"/>
    <circle cx="60" cy="145" r="4" fill="#818CF8" opacity="0.4"/>
    <circle cx="175" cy="40" r="3" fill="#C4B5FD" opacity="0.6"/>
  </svg>
);

const FeatureIllustration = ({ variant }: { variant: number }) => {
  const colors = [
    { c1: '#60A5FA', c2: '#818CF8', c3: '#93C5FD' },
    { c1: '#A78BFA', c2: '#818CF8', c3: '#C4B5FD' },
    { c1: '#34D399', c2: '#60A5FA', c3: '#6EE7B7' },
  ];
  const c = colors[variant % 3];
  return (
    <div className="w-full h-36 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden flex items-center justify-center">
      <svg viewBox="0 0 160 120" className="w-full h-full">
        <ellipse cx="80" cy="98" rx="50" ry="12" fill={c.c1} opacity="0.2"/>
        <path d="M80 28 L115 48 L115 78 L80 98 L45 78 L45 48 Z" fill={c.c2} opacity="0.75"/>
        <path d="M80 28 L115 48 L80 68 L45 48 Z" fill={c.c1} opacity="0.9"/>
        <path d="M80 68 L115 48 L115 78 L80 98 Z" fill={c.c3} opacity="0.6"/>
        <path d="M80 68 L45 48 L45 78 L80 98 Z" fill={c.c2} opacity="0.5"/>
        <circle cx="80" cy="48" r="11" fill="white" opacity="0.9"/>
        <circle cx="80" cy="48" r="6" fill={c.c2} opacity="0.8"/>
        <rect x="108" y="32" width="12" height="12" rx="2" fill={c.c1} opacity="0.6" transform="rotate(12 114 38)"/>
        <rect x="38" y="35" width="10" height="10" rx="2" fill={c.c3} opacity="0.5" transform="rotate(-8 43 40)"/>
      </svg>
    </div>
  );
};

export default function Features() {
  return (
    <>
      <Head><title>Features | SmartChain Hub</title></Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-10 pb-14 sm:pt-16 sm:pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 max-w-lg">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-4">Devgen Agents</h1>
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
              { title: "Decentralized Data", desc: "Securely store and manage transaction data across a decentralized network with full redundancy and availability.", variant: 0 },
              { title: "Formalization", desc: "Formalize business logic into smart contracts that execute automatically, removing the need for intermediaries.", variant: 1 },
              { title: "Promising Technology", desc: "Built on cutting-edge 0G Chain infrastructure with Rust-optimized WASM contracts for maximum performance.", variant: 2 },
            ].map((card) => (
              <div key={card.title} className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">{card.desc}</p>
                <FeatureIllustration variant={card.variant} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
