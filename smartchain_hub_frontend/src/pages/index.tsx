import Head from "next/head";
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>SmartChain Hub | AI-Driven Decentralized Commerce</title>
        <meta name="description" content="Revolutionizing digital commerce with AI agents and 0G Chain technology." />
      </Head>

      <div className="bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-blue-900 pt-16 pb-32 lg:pt-32 lg:pb-48">
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block py-1 px-3 mb-6 text-xs font-semibold tracking-widest text-blue-300 uppercase bg-blue-800 rounded-full animate-fade-in">
                Powered by 0G Chain & AI
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-8 tracking-tight animate-fade-in-up">
                The Future of <span className="text-green-400">Digital Commerce</span> is Autonomous
              </h1>
              <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                SmartChain Hub uses AI-driven agents to optimize every transaction, ensuring maximum efficiency, security, and automated revenue sharing.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Link href="/signup" className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-2xl">
                  Launch App Now
                </Link>
                <Link href="/about" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all backdrop-blur-sm border border-white/20">
                  Read Whitepaper
                </Link>
              </div>
            </div>
          </div>
          
          {/* Animated Background Element */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150%] h-[300px] bg-gradient-to-t from-white to-transparent opacity-10 blur-3xl rounded-[100%]"></div>
        </section>

        {/* Feature Highlights */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why SmartChain Hub?</h2>
              <p className="text-lg text-gray-600">We bridge the gap between complex blockchain technology and seamless digital commerce through intelligent automation.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 transition-all hover:shadow-xl group">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Optimization</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our proprietary AI agents analyze network conditions and transaction routes in real-time to save you up to 40% on fees.
                </p>
              </div>
              
              <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 transition-all hover:shadow-xl group">
                <div className="w-14 h-14 bg-green-500 text-white rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">0G Security</h3>
                <p className="text-gray-600 leading-relaxed">
                  Leveraging 0G Chain's modular architecture for high-performance decentralized storage and verifiable compute.
                </p>
              </div>
              
              <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 transition-all hover:shadow-xl group">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Revenue Sharing</h3>
                <p className="text-gray-600 leading-relaxed">
                  Earn passive income through our decentralized revenue sharing model. Fees are distributed back to the community automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-blue-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-4xl lg:text-5xl font-extrabold text-blue-900 mb-2">$240M+</p>
                <p className="text-blue-600 font-medium uppercase tracking-wider text-sm">Volume Optimized</p>
              </div>
              <div>
                <p className="text-4xl lg:text-5xl font-extrabold text-blue-900 mb-2">12k+</p>
                <p className="text-blue-600 font-medium uppercase tracking-wider text-sm">Active Agents</p>
              </div>
              <div>
                <p className="text-4xl lg:text-5xl font-extrabold text-blue-900 mb-2">0.2s</p>
                <p className="text-blue-600 font-medium uppercase tracking-wider text-sm">Avg. Finality</p>
              </div>
              <div>
                <p className="text-4xl lg:text-5xl font-extrabold text-blue-900 mb-2">99.9%</p>
                <p className="text-blue-600 font-medium uppercase tracking-wider text-sm">Network Uptime</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-white overflow-hidden relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="bg-blue-600 rounded-[3rem] p-12 lg:p-20 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full -ml-32 -mb-32"></div>
              
              <h2 className="text-4xl lg:text-5xl font-bold mb-8">Ready to automate your commerce?</h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Join thousands of businesses and individuals who are already using SmartChain Hub to optimize their digital economy.
              </p>
              <Link href="/signup" className="px-10 py-5 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-colors shadow-xl">
                Get Started for Free
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
