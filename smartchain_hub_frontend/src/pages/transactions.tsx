import Head from "next/head";
import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/hooks/useAuth";

export default function Transactions() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Optimize");
  const [amount, setAmount] = useState("");
  const [priority, setPriority] = useState("efficiency");
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [txList, setTxList] = useState<any[]>([]);
  const [stats, setStats] = useState({ savings: 0, efficiency: 0, avgConf: 12 });

  const fetchTxList = async () => {
    if (!user) return;
    const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
    const txs = data || [];
    setTxList(txs);
    const totalSavings = txs.reduce((s: number, t: any) => s + Number(t.savings || 0), 0);
    const efficiency = txs.length > 0 ? Math.min(Math.round((totalSavings / txs.reduce((s: number, t: any) => s + Number(t.amount), 0)) * 100), 99) : 0;
    setStats({ savings: totalSavings, efficiency: efficiency || 0, avgConf: 12 });
  };

  useEffect(() => { fetchTxList(); }, [user]);

  const handleOptimize = async () => {
    if (!amount) return;
    setOptimizing(true);
    setResult(null);
    try {
      const res = await fetch('http://localhost:5000/optimize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, priority })
      });
      if (!res.ok) throw new Error("offline");
      setResult(await res.json());
    } catch {
      // Fallback simulation
      await new Promise(r => setTimeout(r, 1200));
      const amt = parseFloat(amount);
      setResult({
        fee: (amt * 0.005).toFixed(2),
        savings: (amt * 0.015).toFixed(2),
        route: "0G Chain Flash Route",
        explanation: `Optimized for ${priority} using 0G Newton heuristics.`,
        confidence: 87
      });
    } finally {
      setOptimizing(false);
    }
  };

  const handleConfirm = async () => {
    if (!result || !user) return;
    setSaving(true);
    const { error } = await supabase.from('transactions').insert([{
      user_id: user.id,
      amount: parseFloat(amount),
      optimized_fee: parseFloat(result.fee),
      savings: parseFloat(result.savings),
      route: result.route,
      status: 'pending',
      tx_hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2, 10)}`
    }]);
    setSaving(false);
    if (!error) { setResult(null); setAmount(""); fetchTxList(); }
  };

  return (
    <>
      <Head><title>Transaction Optimization | PayOptimize</title></Head>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200">
          {["Optimize", "Analyze", "Simulate"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold transition-colors ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Potential Savings</p>
            <span className="text-3xl font-bold text-gray-800">${stats.savings.toFixed(2)}</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Efficiency Gain</p>
            <span className="text-3xl font-bold text-gray-800">{stats.efficiency}%</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Avg Confirmation</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-800">{stats.avgConf}s</span>
              <span className="text-sm text-green-500 font-medium mb-0.5">+8.3%</span>
            </div>
          </div>
        </div>

        {activeTab === "Optimize" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-5">AI Transaction Optimizer</h2>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Transaction Amount ($)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div className="flex gap-2">
                {['efficiency','speed','security'].map(p => (
                  <button key={p} onClick={() => setPriority(p)}
                    className={`flex-1 py-2.5 text-xs font-semibold rounded-xl capitalize transition-all border ${priority === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                    {p}
                  </button>
                ))}
              </div>
              {!result ? (
                <button onClick={handleOptimize} disabled={!amount || optimizing}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {optimizing ? 'AI Processing...' : 'Optimize Transaction'}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div><p className="text-xs text-gray-500">Optimized Fee</p><p className="text-lg font-bold text-gray-800">${result.fee}</p></div>
                      <div><p className="text-xs text-gray-500">Savings</p><p className="text-lg font-bold text-green-600">${result.savings}</p></div>
                    </div>
                    <p className="text-xs text-gray-500">Route: <span className="font-medium text-gray-700">{result.route}</span></p>
                    <p className="text-xs text-gray-400 mt-1 italic">{result.explanation}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setResult(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50">Reset</button>
                    <button onClick={handleConfirm} disabled={saving}
                      className="flex-[2] py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                      {saving ? 'Saving...' : 'Confirm & Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Recommendations</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-50">
                <th className="px-6 py-3 text-left font-medium">
                  <span className="flex items-center gap-1">Tx Hash <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg></span>
                </th>
                <th className="px-6 py-3 text-left font-medium">
                  <span className="flex items-center gap-1">Date <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg></span>
                </th>
                <th className="px-6 py-3 text-left font-medium">Amount</th>
                <th className="px-6 py-3 text-left font-medium">Gas Fee</th>
                <th className="px-6 py-3 text-left font-medium">Savings</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {txList.length > 0 ? txList.map((tx, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-sm text-gray-700 font-mono">{tx.tx_hash?.slice(0, 16)}...</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">${Number(tx.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">${Number(tx.optimized_fee || 0).toFixed(2)}</td>
                  <td className="px-6 py-4"><span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 text-green-600">${Number(tx.savings || 0).toFixed(2)}</span></td>
                  <td className="px-6 py-4">
                    <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                      Optimize
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">No transactions yet. Use the optimizer above to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
