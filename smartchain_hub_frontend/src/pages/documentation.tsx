import Head from "next/head";
import Link from "next/link";

const DocIllustration = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full">
    <defs>
      <linearGradient id="docGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818CF8"/><stop offset="100%" stopColor="#3B82F6"/>
      </linearGradient>
    </defs>
    <rect x="65" y="20" width="55" height="55" rx="8" fill="url(#docGrad)" opacity="0.8" transform="rotate(12 92 47)"/>
    <rect x="90" y="40" width="50" height="50" rx="8" fill="#60A5FA" opacity="0.55" transform="rotate(-10 115 65)"/>
    <rect x="60" y="65" width="80" height="45" rx="8" fill="#818CF8" opacity="0.45"/>
    <circle cx="100" cy="75" r="16" fill="white" opacity="0.9"/>
    <circle cx="100" cy="75" r="9" fill="url(#docGrad)" opacity="0.75"/>
  </svg>
);

export default function Documentation() {
  return (
    <>
      <Head><title>Documentation | SmartChain Hub</title></Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-16 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 max-w-lg">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-4">Developer Resources</h1>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Everything you need to integrate SmartChain Hub into your application. Explore our guides, API references, and GitHub repositories.
              </p>
              <Link href="/signup" className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">
                Get Started
              </Link>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-72 h-64">
                <DocIllustration />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg viewBox="0 0 40 40" className="w-10 h-10">
                    <circle cx="20" cy="20" r="20" fill="#3B82F6" opacity="0.15"/>
                    <path d="M12 14h16M12 20h12M12 26h10" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="28" cy="26" r="5" fill="#3B82F6" opacity="0.8"/>
                    <path d="M26 26l1.5 1.5L30 24" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                title: "Integration Guide",
                desc: "Step-by-step instructions to integrate SmartChain Hub APIs into your existing application stack.",
                cta: "Get Started", href: "#"
              },
              {
                icon: (
                  <svg viewBox="0 0 40 40" className="w-10 h-10">
                    <circle cx="20" cy="20" r="20" fill="#818CF8" opacity="0.15"/>
                    <path d="M20 8C13.4 8 8 13.4 8 20s5.4 12 12 12 12-5.4 12-12S26.6 8 20 8zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm3 14h-6v-2h2v-6h-2v-2h4v8h2v2z" fill="#818CF8" opacity="0.8"/>
                  </svg>
                ),
                title: "GitHub Repository",
                desc: "Browse our open-source codebase, submit issues, and contribute to the SmartChain Hub ecosystem.",
                cta: "View Repo", href: "https://github.com"
              },
              {
                icon: (
                  <svg viewBox="0 0 40 40" className="w-10 h-10">
                    <circle cx="20" cy="20" r="20" fill="#A78BFA" opacity="0.15"/>
                    <rect x="11" y="10" width="18" height="22" rx="3" fill="none" stroke="#A78BFA" strokeWidth="2" opacity="0.8"/>
                    <path d="M15 16h10M15 20h10M15 24h6" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
                  </svg>
                ),
                title: "Documentation",
                desc: "Full API reference, SDK documentation, and architecture guides for building on SmartChain Hub.",
                cta: "Get Started", href: "#"
              },
            ].map((card) => (
              <div key={card.title} className="border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all flex flex-col">
                <div className="mb-5">{card.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">{card.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">{card.desc}</p>
                <Link href={card.href} className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors w-fit">
                  {card.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
