import Head from "next/head";
import HeroSection from "@/components/HeroSection";
import AIOptimizationWidget from "@/components/AIOptimizationWidget";
import BlockchainTransactionsWidget from "@/components/BlockchainTransactionsWidget";
import RevenueSharingWidget from "@/components/RevenueSharingWidget";
import AIDecisionFeed from "@/components/AIDecisionFeed";

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard | SmartChain Hub</title>
        <meta name="description" content="AI-driven digital commerce optimization on 0G Chain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex flex-col min-h-screen">
        <HeroSection />

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <AIOptimizationWidget />
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <RevenueSharingWidget />
                </div>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <BlockchainTransactionsWidget />
              </div>
            </div>

            {/* Sidebar: AI Activity */}
            <div className="lg:col-span-1 space-y-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <AIDecisionFeed />

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full py-3 bg-blue-50 text-blue-600 font-bold rounded-xl text-sm hover:bg-blue-100 transition-colors">
                    Withdraw Balance
                  </button>
                  <button className="w-full py-3 bg-gray-50 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-100 transition-colors">
                    Export Tx History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
...

        {/* Additional Features Quick Links */}
        <section className="bg-gray-100 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why SmartChain Hub?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 transform transition hover:-translate-y-1">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">AI Intelligence</h3>
                <p className="text-gray-500">Self-learning agents that optimize your commerce flow in real-time.</p>
              </div>
              <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 transform transition hover:-translate-y-1">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">0G Security</h3>
                <p className="text-gray-500">Tamper-proof transactions backed by decentralized storage and compute.</p>
              </div>
              <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 transform transition hover:-translate-y-1">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Fair Sharing</h3>
                <p className="text-gray-500">Automated revenue distribution to all stakeholders via smart contracts.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
