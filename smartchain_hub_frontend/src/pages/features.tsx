import Head from "next/head";
import React, { useState } from "react";
import AIOptimizationWidget from "@/components/AIOptimizationWidget";
import OptimizationAnalytics from "@/components/OptimizationAnalytics";
import AIDecisionTree from "@/components/AIDecisionTree";

const FeaturesPage = () => {
  const [selectedAgent, setSelectedAgent] = useState('efficiency');
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Sync state with the widget
  const handleOptimizationStateChange = (loading: boolean, result: any) => {
    setIsOptimizing(loading);
    if (result) setOptimizationResult(result);
  };

  return (
    <>
      <Head>
        <title>AI Optimization | SmartChain Hub</title>
      </Head>

      <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AIOptimizationWidget onStateChange={handleOptimizationStateChange} />
            <OptimizationAnalytics />
          </div>

          <div className="lg:col-span-1 space-y-8">
            <AIDecisionTree 
              isOptimizing={isOptimizing} 
              result={optimizationResult} 
              priority={selectedAgent} 
            />
            
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-200/50">
              <h3 className="font-black text-deep-blue mb-6">Agent Configuration</h3>
              <div className="space-y-4">
                {['efficiency', 'speed', 'security'].map(agent => (
                  <button 
                    key={agent}
                    onClick={() => setSelectedAgent(agent)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all capitalize font-bold text-sm ${selectedAgent === agent ? 'border-electric-purple bg-purple-50 text-electric-purple' : 'border-gray-50 text-gray-400 hover:border-gray-100'}`}
                  >
                    {agent} Mode
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeaturesPage;
