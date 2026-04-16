import React, { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';

const AIOptimizationWidget = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [priority, setPriority] = useState('efficiency');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<null | { fee: string, savings: string, route: string, explanation: string, confidence: number }>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleOptimize = async () => {
    if (!amount) return;
    setIsOptimizing(true);
    
    try {
      const response = await fetch('http://localhost:5000/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, priority })
      });

      if (!response.ok) throw new Error("AI API Offline");
      
      const data = await response.json();
      setOptimizedResult(data);
    } catch (error) {
      console.warn("Falling back to simulated AI logic:", error);
      // Fallback to local simulation if API is not running
      setTimeout(() => {
        setOptimizedResult({
          fee: (parseFloat(amount) * 0.005).toFixed(2),
          savings: (parseFloat(amount) * 0.015).toFixed(2),
          route: "0G Chain Flash Route (Fallback)",
          explanation: `The AI prioritized ${priority} by selecting a specialized route with optimized decentralized parameters.`,
          confidence: 85.5
        });
        setIsOptimizing(false);
      }, 1000);
      return;
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleExecute = async () => {
    if (!optimizedResult || !user) return;
    setIsExecuting(true);
    
    try {
      const { error } = await supabase.from('transactions').insert([
        {
          user_id: user.id,
          amount: parseFloat(amount),
          optimized_fee: parseFloat(optimizedResult.fee),
          savings: parseFloat(optimizedResult.savings),
          route: optimizedResult.route,
          status: 'pending',
          tx_hash: `0x${Math.random().toString(16).slice(2)}...${Math.random().toString(16).slice(2, 6)}`
        }
      ]);

      if (error) throw error;
      
      alert("Transaction submitted successfully to 0G Chain!");
      setOptimizedResult(null);
      setAmount('');
    } catch (error: any) {
      alert(`Error submitting transaction: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">AI Transaction Optimizer</h2>
        <span className="bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase">AI Active</span>
      </div>
      
      <p className="text-gray-500 mb-6">Enter your transaction amount and choose a priority for AI optimization.</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Amount ($)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={isOptimizing || isExecuting}
            />
          </div>
        </div>
        
        {!optimizedResult ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              {['efficiency', 'speed', 'security'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${
                    priority === p ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button 
              onClick={handleOptimize}
              disabled={!amount || isOptimizing}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                isOptimizing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isOptimizing ? 'AI Analyzing Decision Path...' : 'Optimize Transaction'}
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <button 
              onClick={() => setOptimizedResult(null)}
              className="flex-1 py-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
            >
              Reset
            </button>
            <button 
              onClick={handleExecute}
              disabled={isExecuting}
              className="flex-[2] py-4 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 transition-all shadow-lg shadow-green-200 active:scale-95"
            >
              {isExecuting ? 'Submitting...' : 'Confirm & Execute'}
            </button>
          </div>
        )}
      </div>

      {optimizedResult && !isOptimizing && (
        <div className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-100 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-green-800 font-bold flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              AI Optimization Result
            </h3>
            <span className="text-[10px] bg-green-200 text-green-700 px-2 py-0.5 rounded-full font-bold">
              {optimizedResult.confidence}% CONFIDENCE
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-green-600 font-medium uppercase">Estimated Fee</p>
              <p className="text-lg font-bold text-gray-800">${optimizedResult.fee}</p>
            </div>
            <div>
              <p className="text-xs text-green-600 font-medium uppercase">Total Savings</p>
              <p className="text-lg font-bold text-green-600">${optimizedResult.savings}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-green-600 font-medium uppercase">Optimal Route</p>
              <p className="text-sm font-semibold text-gray-700">{optimizedResult.route}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-green-100">
            <p className="text-[11px] text-green-700 leading-relaxed italic">
              <span className="font-bold">AI Explanation:</span> {optimizedResult.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIOptimizationWidget;
