import Head from "next/head";
import React, { useState } from "react";
import AIOptimizationWidget from "@/components/AIOptimizationWidget";
import OptimizationAnalytics from "@/components/OptimizationAnalytics";

const FeaturesPage = () => {
  const [selectedAgent, setSelectedAgent] = useState('efficiency');

  const agents = [
    {
      id: 'efficiency',
      name: 'Efficiency Agent',
      description: 'Prioritizes lowest possible gas fees and optimal routing.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'blue'
    },
    {
      id: 'speed',
      name: 'Speed Agent',
      description: 'Prioritizes fastest finality and network confirmation times.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green'
    },
    {
      id: 'security',
      name: 'Security Agent',
      description: 'Maximizes decentralization and validation nodes for sensitive transfers.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'indigo'
    }
  ];

  return (
    <>
      <Head>
        <title>AI Optimization | SmartChain Hub</title>
        <meta name="description" content="Configure and run AI-driven transaction optimizations." />
      </Head>

      <div className="bg-gray-50 min-h-screen pb-20">
        <div className="bg-blue-900 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">Transaction Optimization</h1>
            <p className="text-blue-200">Configure your AI agents and optimize your digital commerce flow.</p>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar: Agent Configuration */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up">
                <h2 className="text-lg font-bold text-gray-800 mb-6">Select AI Agent</h2>
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedAgent === agent.id
                          ? `border-blue-500 bg-blue-50`
                          : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`mr-3 p-2 rounded-lg ${
                          selectedAgent === agent.id ? `bg-blue-500 text-white` : 'bg-gray-200 text-gray-500'
                        }`}>
                          {agent.icon}
                        </div>
                        <span className={`font-bold ${selectedAgent === agent.id ? `text-blue-700` : 'text-gray-700'}`}>
                          {agent.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">{agent.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Advanced Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Slippage Tolerance</label>
                    <div className="flex gap-2">
                      {['0.1%', '0.5%', '1.0%'].map((val) => (
                        <button key={val} className="flex-1 py-2 text-sm font-semibold bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100">{val}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-gray-600">Flash Loans Enabled</span>
                    <div className="w-10 h-5 bg-green-500 rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content: Optimization Widget */}
            <div className="lg:col-span-2 space-y-8">
              <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <AIOptimizationWidget />
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <OptimizationAnalytics />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeaturesPage;
