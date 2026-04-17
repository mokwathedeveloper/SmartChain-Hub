import Head from "next/head";
import Link from "next/link";

const HexagonSVG = () => (
  <svg viewBox="0 0 400 400" className="w-full max-w-md" fill="none">
    <defs>
      <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818CF8"/>
        <stop offset="100%" stopColor="#3B82F6"/>
      </linearGradient>
      <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C4B5FD"/>
        <stop offset="100%" stopColor="#60A5FA"/>
      </linearGradient>
    </defs>
    {/* Outer hexagon */}
    <polygon points="200,30 350,115 350,285 200,370 50,285 50,115" stroke="url(#hexGrad)" strokeWidth="3" fill="none" opacity="0.4"/>
    {/* Middle hexagon */}
    <polygon points="200,70 320,135 320,265 200,330 80,265 80,135" stroke="url(#hexGrad)" strokeWidth="2.5" fill="none" opacity="0.6"/>
    {/* Inner hexagon filled */}
    <polygon points="200,110 295,162 295,238 200,290 105,238 105,162" fill="url(#hexGrad)" opacity="0.85"/>
    {/* Center circle */}
    <circle cx="200" cy="200" r="45" fill="white" opacity="0.95"/>
    <circle cx="200" cy="200" r="30" fill="url(#innerGrad)" opacity="0.7"/>
    {/* Corner dots */}
    <circle cx="200" cy="30" r="8" fill="#818CF8"/>
    <circle cx="350" cy="115" r="8" fill="#818CF8"/>
    <circle cx="350" cy="285" r="8" fill="#818CF8"/>
    <circle cx="200" cy="370" r="8" fill="#818CF8"/>
    <circle cx="50" cy="285" r="8" fill="#818CF8"/>
    <circle cx="50" cy="115" r="8" fill="#818CF8"/>
    {/* Floating particles */}
    <circle cx="360" cy="80" r="4" fill="#C4B5FD" opacity="0.6"/>
    <circle cx="40" cy="200" r="3" fill="#93C5FD" opacity="0.5"/>
    <circle cx="370" cy="320" r="5" fill="#818CF8" opacity="0.4"/>
    <circle cx="100" cy="50" r="3" fill="#C4B5FD" opacity="0.5"/>
  </svg>
);

const IsometricIllustration = ({ type }: { type: 'marketplace' | 'automation' | 'secure' }) => {
  const configs = {
    marketplace: { c1: '#60A5FA', c2: '#818CF8', c3: '#93C5FD' },
    automation:  { c1: '#A78BFA', c2: '#818CF8', c3: '#C4B5FD' },
    secure:      { c1: '#38BDF8', c2: '#60A5FA', c3: '#7DD3FC' },
  };
  const c = configs[type];
  return (
    <div className="w-full h-36 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden flex items-center justify-center">
      <svg viewBox="0 0 160 120" className="w-full h-full">
        {/* Base platform */}
        <ellipse cx="80" cy="95" rx="55" ry="14" fill={c.c1} opacity="0.3"/>
        {/* Main block */}
        <path d="M80 30 L115 50 L115 80 L80 100 L45 80 L45 50 Z" fill={c.c2} opacity="0.75"/>
        <path d="M80 30 L115 50 L80 70 L45 50 Z" fill={c.c1} opacity="0.9"/>
        <path d="M80 70 L115 50 L115 80 L80 100 Z" fill={c.c3} opacity="0.6"/>
        <path d="M80 70 L45 50 L45 80 L80 100 Z" fill={c.c2} opacity="0.5"/>
        {/* Top circle */}
        <circle cx="80" cy="50" r="12" fill="white" opacity="0.9"/>
        <circle cx="80" cy="50" r="7" fill={c.c2} opacity="0.8"/>
        {/* Floating small blocks */}
        <rect x="108" y="35" width="14" height="14" rx="3" fill={c.c1} opacity="0.6" transform="rotate(15 115 42)"/>
        <rect x="38" y="38" width="12" height="12" rx="3" fill={c.c3} opacity="0.5" transform="rotate(-10 44 44)"/>
      </svg>
    </div>
  );
};

export default function Home() {
  return (
    <>
      <Head>
        <title>SmartChain Hub | AI-Powered Smart Contracts</title>
        <meta name="description" content="Decentralize Commerce with AI-Powered Smart Contracts" />
      </Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-10 pb-14 sm:pt-16 sm:pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 max-w-xl">
              <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                SmartChain Hub
              </h1>
              <p className="text-lg text-gray-500 mb-3">with AI-Powered Smart Contracts</p>
              <p className="text-gray-400 mb-8">with AI-powered Decentralized Marketplace</p>
              <Link href="/signup" className="inline-block px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-200">
                Get Started
              </Link>
            </div>
            <div className="flex-1 flex justify-center">
              <HexagonSVG />
            </div>
          </div>
        </div>
      </section>

      {/* Revolutionizing Digital Commerce */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-14">Revolutionizing Digital Commerce</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Blockchain-Powered",
                desc: "Leverage secure blockchain technology to seamlessly process transactions",
                icon: (
                  <svg viewBox="0 0 48 48" className="w-12 h-12 mx-auto mb-4" fill="none">
                    <rect x="8" y="8" width="14" height="14" rx="3" fill="#818CF8" opacity="0.8"/>
                    <rect x="26" y="8" width="14" height="14" rx="3" fill="#818CF8" opacity="0.5"/>
                    <rect x="8" y="26" width="14" height="14" rx="3" fill="#818CF8" opacity="0.5"/>
                    <rect x="26" y="26" width="14" height="14" rx="3" fill="#818CF8" opacity="0.3"/>
                    <path d="M22 15h4M15 22v4M33 22v4M22 33h4" stroke="#818CF8" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )
              },
              {
                title: "Intelligent Agents",
                desc: "Utilize AI agents to automate and optimize business processes",
                icon: (
                  <svg viewBox="0 0 48 48" className="w-12 h-12 mx-auto mb-4" fill="none">
                    <rect x="10" y="14" width="28" height="20" rx="4" fill="#818CF8" opacity="0.7"/>
                    <circle cx="18" cy="24" r="3" fill="white"/>
                    <circle cx="30" cy="24" r="3" fill="white"/>
                    <path d="M18 10v4M30 10v4M14 34l-4 4M34 34l4 4" stroke="#818CF8" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )
              },
              {
                title: "Secure & Decentralized",
                desc: "Ensure trust and security with decentralized protocols",
                icon: (
                  <svg viewBox="0 0 48 48" className="w-12 h-12 mx-auto mb-4" fill="none">
                    <path d="M24 6L8 13v10c0 9.4 6.8 18.2 16 20 9.2-1.8 16-10.6 16-20V13L24 6z" fill="#818CF8" opacity="0.7"/>
                    <path d="M16 24l5 5 11-11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )
              },
            ].map((item) => (
              <div key={item.title} className="p-8 border border-gray-100 rounded-2xl hover:shadow-lg transition-all text-center">
                {item.icon}
                <h3 className="text-lg font-bold text-gray-800 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-14">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Decentralized Marketplace", desc: "Buy and sell securely at scale on a decentralized platform", type: 'marketplace' as const },
              { title: "AI-Driven Automation",      desc: "Automate workflows using integrations with intelligent AI agents", type: 'automation' as const },
              { title: "Secure Transactions",       desc: "Conduct safe, transparent transactions on decentralized platforms", type: 'secure' as const },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{item.desc}</p>
                <IsometricIllustration type={item.type} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom illustration banner */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center">
        <svg viewBox="0 0 600 160" className="w-full max-w-2xl opacity-70">
          <defs>
            <linearGradient id="bannerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8"/>
              <stop offset="100%" stopColor="#3B82F6"/>
            </linearGradient>
          </defs>
          <rect x="220" y="20" width="80" height="80" rx="8" fill="url(#bannerGrad)" opacity="0.8" transform="rotate(10 260 60)"/>
          <rect x="310" y="40" width="70" height="70" rx="8" fill="#818CF8" opacity="0.6" transform="rotate(-8 345 75)"/>
          <rect x="150" y="50" width="65" height="65" rx="8" fill="#60A5FA" opacity="0.5" transform="rotate(5 182 82)"/>
          <circle cx="260" cy="60" r="20" fill="white" opacity="0.9"/>
          <circle cx="345" cy="75" r="16" fill="white" opacity="0.8"/>
        </svg>
      </section>
    </>
  );
}
