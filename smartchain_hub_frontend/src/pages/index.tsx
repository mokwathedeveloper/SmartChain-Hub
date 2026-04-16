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

const IllustrationCard = ({ color }: { color: string }) => (
  <div className={`w-full h-32 rounded-xl ${color} flex items-end justify-center overflow-hidden`}>
    <svg viewBox="0 0 200 100" className="w-full">
      <defs>
        <linearGradient id={`illGrad${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4"/>
        </linearGradient>
      </defs>
      <rect x="60" y="20" width="40" height="40" rx="4" fill={`url(#illGrad${color})`} transform="rotate(15 80 40)"/>
      <rect x="100" y="30" width="35" height="35" rx="4" fill="#818CF8" opacity="0.5" transform="rotate(-10 117 47)"/>
      <rect x="75" y="50" width="50" height="30" rx="4" fill="#60A5FA" opacity="0.6"/>
      <circle cx="100" cy="45" r="12" fill="white" opacity="0.8"/>
    </svg>
  </div>
);

export default function Home() {
  return (
    <>
      <Head>
        <title>SmartChain Hub | AI-Powered Smart Contracts</title>
        <meta name="description" content="Decentralize Commerce with AI-Powered Smart Contracts" />
      </Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-16 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 max-w-xl">
              <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
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

      {/* Decentralized Marketplace */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-14">Decentralized Marketplace</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🏛️", title: "Blockchain-Powered", desc: "Leverage secure blockchain technology to seamlessly process transactions" },
              { icon: "🤖", title: "Intelligent Agents", desc: "Utilize AI agents to automate and optimize business processes" },
              { icon: "🔒", title: "Secure & Decentralized", desc: "Ensure trust and security with decentralized protocols" },
            ].map((item) => (
              <div key={item.title} className="p-8 border border-gray-100 rounded-2xl hover:shadow-lg transition-all text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
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
              { title: "Decentralized Marketplace", desc: "Buy and sell securely at scale on a decentralized platform", color: "bg-blue-50" },
              { title: "AI-Driven Automation", desc: "Automate workflows using integrations with intelligent AI agents", color: "bg-purple-50" },
              { title: "Secure Transactions", desc: "Conduct safe, transparent transactions on decentralized platforms", color: "bg-indigo-50" },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{item.desc}</p>
                </div>
                <IllustrationCard color={item.color} />
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
