import Head from "next/head";
import HeroSection from "@/components/HeroSection";
import AIOptimizationWidget from "@/components/AIOptimizationWidget";
import BlockchainTransactionsWidget from "@/components/BlockchainTransactionsWidget";
import RevenueSharingWidget from "@/components/RevenueSharingWidget";
import AIDecisionFeed from "@/components/AIDecisionFeed";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/context/NotificationContext";

export default function Dashboard() {
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const handleExport = async () => {
    if (!user) return;
    addNotification("Generating export file...", "info");
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      addNotification("Export failed!", "error");
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Amount,Savings,Route,Status,Hash\n"
      + data.map(tx => `${tx.created_at},${tx.amount},${tx.savings},${tx.route},${tx.status},${tx.tx_hash}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `smartchain_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addNotification("History exported successfully!", "success");
  };

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

              <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-10 border border-gray-50">
                <h3 className="font-black text-deep-blue mb-6">Quick Actions</h3>
                <div className="space-y-4">
                  <button className="w-full py-4 bg-purple-50 text-electric-purple font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-purple-100 transition-all">
                    Withdraw Balance
                  </button>
                  <button 
                    onClick={handleExport}
                    className="w-full py-4 bg-gray-50 text-gray-400 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-gray-100 hover:text-gray-600 transition-all"
                  >
                    Export History (CSV)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features Quick Links */}
        <section className="bg-gray-50/50 py-24 rounded-[3.5rem]">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-black text-center text-deep-blue mb-16 tracking-tight">Why SmartChain Hub?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="p-10 bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/30 transform transition hover:-translate-y-2">
                <div className="w-16 h-16 bg-purple-100 text-electric-purple rounded-2xl flex items-center justify-center mx-auto mb-8 text-2xl">🧠</div>
                <h3 className="text-xl font-black mb-4 text-deep-blue">AI Intelligence</h3>
                <p className="text-gray-500 font-medium leading-relaxed">Self-learning agents that optimize your commerce flow in real-time.</p>
              </div>
              <div className="p-10 bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/30 transform transition hover:-translate-y-2">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 text-2xl">⛓️</div>
                <h3 className="text-xl font-black mb-4 text-deep-blue">0G Security</h3>
                <p className="text-gray-500 font-medium leading-relaxed">Tamper-proof transactions backed by decentralized storage and compute.</p>
              </div>
              <div className="p-10 bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/30 transform transition hover:-translate-y-2">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-8 text-2xl">💰</div>
                <h3 className="text-xl font-black mb-4 text-deep-blue">Fair Sharing</h3>
                <p className="text-gray-500 font-medium leading-relaxed">Automated revenue distribution to all stakeholders via smart contracts.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
