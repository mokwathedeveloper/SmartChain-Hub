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

  // Simulate tab state
  const [simAmount, setSimAmount] = useState("");
  const [simRoute, setSimRoute] = useState("0G Chain Flash");
  const [simResult, setSimResult] = useState<any>(null);
  const [simRunning, setSimRunning] = useState(false);

  const fetchTxList = async () => {
    if (!user) return;
    const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
    const txs = data || [];
    setTxList(txs);
    const totalSavings = txs.reduce((s: number, t: any) => s + Number(t.savings || 0), 0);
    const totalAmt = txs.reduce((s: number, t: any) => s + Number(t.amount || 0), 0);
    const efficiency = totalAmt > 0 ? Math.min(Math.round((totalSavings / totalAmt) * 100), 99) : 0;
    setStats({ savings: totalSavings, efficiency, avgConf: 12 });
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
      await new Promise(r => setTimeout(r, 1200));
      const amt = parseFloat(amount);
      setResult({
        fee: (amt * 0.005).toFixed(2),
        savings: (amt * 0.015).toFixed(2),
        route: "0G Chain Flash Route",
        explanation: `Optimized for ${priority} using 0G Newton heuristics.`,
        confidence: 87
      });
    } finally { setOptimizing(false); }
  };

  const handleConfirm = async () => {
    if (!result || !user) return;
    setSaving(true);
    const { error } = await supabase.from('transactions').insert([{
      user_id: user.id, amount: parseFloat(amount),
      optimized_fee: parseFloat(result.fee), savings: parseFloat(result.savings),
      route: result.route, status: 'pending',
      tx_hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2, 10)}`
    }]);
    setSaving(false);
    if (!error) { setResult(null); setAmount(""); fetchTxList(); }
  };

  const handleSimulate = async () => {
    if (!simAmount) return;
    setSimRunning(true);
    setSimResult(null);
    await new Promise(r => setTimeout(r, 1000));
    const amt = parseFloat(simAmount);
    const routes: Record<string, { fee: number; time: number; risk: string }> = {
      "0G Chain Flash":    { fee: amt * 0.004, time: 8,  risk: "Low" },
      "Standard Route":   { fee: amt * 0.008, time: 22, risk: "Low" },
      "High Speed":       { fee: amt * 0.012, time: 4,  risk: "Medium" },
      "Economy Route":    { fee: amt * 0.002, time: 45, risk: "Low" },
    };
    const chosen = routes[simRoute] || routes["0G Chain Flash"];
    setSimResult({
      route: simRoute, amount: amt,
      estimatedFee: chosen.fee.toFixed(2),
      estimatedTime: chosen.time,
      savings: (amt * 0.015 - chosen.fee).toFixed(2),
      risk: chosen.risk,
      successRate: simRoute === "High Speed" ? 94 : 99,
    });
    setSimRunning(false);
  };

  // Analyze: group txs by route and compute stats
  const analyzeData = txList.reduce((acc: Record<string, any>, tx) => {
    const r = tx.route || "Unknown";
    if (!acc[r]) acc[r] = { route: r, count: 0, totalSavings: 0, totalFees: 0 };
    acc[r].count++;
    acc[r].totalSavings += Number(tx.savings || 0);
    acc[r].totalFees += Number(tx.optimized_fee || 0);
    return acc;
  }, {});
  const analyzeRows = Object.values(analyzeData) as any[];

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

        {/* ── OPTIMIZE TAB ── */}
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
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div><p className="text-xs text-gray-500">Optimized Fee</p><p className="text-lg font-bold text-gray-800">${result.fee}</p></div>
                      <div><p className="text-xs text-gray-500">Savings</p><p className="text-lg font-bold text-green-600">${result.savings}</p></div>
                      <div><p className="text-xs text-gray-500">Est. Time</p><p className="text-lg font-bold text-blue-600">{result.estimated_time_s || 12}s</p></div>
                    </div>
                    <p className="text-xs text-gray-500">Route: <span className="font-medium text-gray-700">{result.route}</span></p>
                    <p className="text-xs text-gray-400 mt-1 italic">{result.explanation}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${result.confidence}%` }}/>
                      </div>
                      <span className="text-xs text-gray-500">{result.confidence}% confidence</span>
                    </div>
                  </div>

                  {/* TEE Verification Badge */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${result.tee_verified ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${result.tee_verified ? 'bg-blue-600' : 'bg-gray-400'}`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      {result.tee_verified ? (
                        <>
                          <p className="text-xs font-bold text-blue-700">✓ Verified inside TEE — {result.tee_mode}</p>
                          <p className="text-xs text-blue-500 truncate">Provider: {result.provider_id}</p>
                          {result.tee_proof && (
                            <p className="text-xs text-blue-400 font-mono truncate">Proof: {result.tee_proof.slice(0, 32)}...</p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-bold text-gray-600">Local TensorFlow — No TEE</p>
                          <p className="text-xs text-gray-400">Set OG_COMPUTE_API_KEY to enable 0G Compute + TEE</p>
                        </>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ${result.tee_verified ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {result.ml_engine?.includes('0G') ? '0G Compute' : 'Local AI'}
                    </span>
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

        {/* ── ANALYZE TAB ── */}
        {activeTab === "Analyze" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-800 mb-5">Transaction Analysis</h2>
              {analyzeRows.length > 0 ? (
                <>
                  {/* Route breakdown */}
                  <div className="space-y-3 mb-6">
                    {analyzeRows.map((row, i) => {
                      const maxSavings = Math.max(...analyzeRows.map(r => r.totalSavings), 1);
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 font-medium">{row.route}</span>
                            <span className="text-gray-500">{row.count} tx · <span className="text-green-600 font-semibold">${row.totalSavings.toFixed(2)} saved</span></span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(row.totalSavings / maxSavings) * 100}%` }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Summary table */}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 border-b border-gray-100">
                        <th className="py-2 text-left font-medium">Route</th>
                        <th className="py-2 text-left font-medium">Transactions</th>
                        <th className="py-2 text-left font-medium">Total Fees</th>
                        <th className="py-2 text-left font-medium">Total Savings</th>
                        <th className="py-2 text-left font-medium">Efficiency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyzeRows.map((row, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-3 text-gray-700 font-medium">{row.route}</td>
                          <td className="py-3 text-gray-600">{row.count}</td>
                          <td className="py-3 text-gray-600">${row.totalFees.toFixed(2)}</td>
                          <td className="py-3 text-green-600 font-semibold">${row.totalSavings.toFixed(2)}</td>
                          <td className="py-3">
                            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
                              {row.totalFees > 0 ? Math.round((row.totalSavings / (row.totalSavings + row.totalFees)) * 100) : 0}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">No transaction data to analyze yet.</p>
                  <p className="text-xs mt-1">Use the Optimize tab to create transactions first.</p>
                </div>
              )}
            </div>

            {/* Savings over time mini chart */}
            {txList.length > 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Savings Over Time</h3>
                <div className="flex items-end gap-1 h-20">
                  {txList.slice().reverse().map((tx, i) => {
                    const maxS = Math.max(...txList.map(t => Number(t.savings || 0)), 1);
                    return (
                      <div key={i} className="flex-1 bg-blue-500 rounded-sm opacity-80 hover:opacity-100 transition-opacity"
                        style={{ height: `${(Number(tx.savings || 0) / maxS) * 100}%`, minHeight: 4 }}
                        title={`$${Number(tx.savings).toFixed(2)}`}/>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-2">Each bar = one transaction, sorted oldest → newest</p>
              </div>
            )}
          </div>
        )}

        {/* ── SIMULATE TAB ── */}
        {activeTab === "Simulate" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-2">Transaction Simulator</h2>
            <p className="text-xs text-gray-400 mb-6">Test different routes and amounts without executing a real transaction.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Amount to Simulate ($)</label>
                  <input type="number" value={simAmount} onChange={e => setSimAmount(e.target.value)} placeholder="0.00"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Route</label>
                  <select value={simRoute} onChange={e => setSimRoute(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option>0G Chain Flash</option>
                    <option>Standard Route</option>
                    <option>High Speed</option>
                    <option>Economy Route</option>
                  </select>
                </div>
                <button onClick={handleSimulate} disabled={!simAmount || simRunning}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {simRunning ? 'Simulating...' : 'Run Simulation'}
                </button>
              </div>

              {/* Result */}
              <div>
                {simResult ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-700">Simulation Result</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Estimated Fee',  value: `$${simResult.estimatedFee}`,    color: 'text-gray-800' },
                        { label: 'Est. Savings',   value: `$${simResult.savings}`,          color: 'text-green-600' },
                        { label: 'Confirmation',   value: `~${simResult.estimatedTime}s`,   color: 'text-blue-600' },
                        { label: 'Success Rate',   value: `${simResult.successRate}%`,      color: 'text-gray-800' },
                      ].map(item => (
                        <div key={item.label} className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                          <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold">Route:</span> {simResult.route} &nbsp;·&nbsp;
                        <span className="font-semibold">Risk:</span>{' '}
                        <span className={simResult.risk === 'Low' ? 'text-green-600' : 'text-yellow-600'}>{simResult.risk}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1 italic">This is a simulation only — no funds are moved.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-8">
                    <div>
                      <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                      <p className="text-sm">Enter an amount and run the simulation to see results</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations table — always visible */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Recommendations</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-50">
                <th className="px-6 py-3 text-left font-medium"><span className="flex items-center gap-1">Tx Hash <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg></span></th>
                <th className="px-6 py-3 text-left font-medium"><span className="flex items-center gap-1">Date <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg></span></th>
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
                    <button onClick={() => { setActiveTab("Optimize"); setAmount(String(tx.amount)); }}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                      Optimize
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">No transactions yet. Use the Optimize tab to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
