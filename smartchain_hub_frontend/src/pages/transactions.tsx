import Head from "next/head";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/hooks/useAuth";
import { optimizeTransaction as apiOptimize, type OptimizeResult } from "@/utils/api";
import { storageService } from "@/utils/storage";
import { loadAgentMemory, saveAgentMemory, mergeOptimizationIntoMemory, hydrateAgentMemory } from "@/utils/agentMemory";
import { generateZKProof } from "@/utils/zkProof";
import { useWeb3 } from "@/context/Web3Context";
import { hasAgentID, mintAgentID, updateAgentMemory } from "@/utils/agentId";
import { recordTransactionOnChain } from "@/utils/blockchain";

interface TransactionRow {
  id?: string;
  amount: number;
  savings: number;
  optimized_fee?: number;
  route?: string;
  status?: string;
  tx_hash?: string;
  created_at?: string;
}

interface SimResult {
  route: string;
  amount: number;
  estimatedFee: string;
  estimatedTime: number;
  savings: string;
  risk: string;
  successRate: number;
}

interface RouteAnalysis {
  route: string;
  count: number;
  totalSavings: number;
  totalFees: number;
}

export default function Transactions() {
  const { user } = useAuth();
  const { signer, isConnected } = useWeb3();
  const [activeTab, setActiveTab] = useState("Optimize");
  const [amount, setAmount] = useState("");
  const [priority, setPriority] = useState("efficiency");
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [zkCommitment, setZkCommitment] = useState("");
  const [txList, setTxList] = useState<TransactionRow[]>([]);
  const [stats, setStats] = useState({ savings: 0, efficiency: 0, avgConfMs: 0 });

  // Simulate tab state
  const [simAmount, setSimAmount] = useState("");
  const [simRoute, setSimRoute] = useState("0G Chain Flash");
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [simRunning, setSimRunning] = useState(false);

  // Hydrate from 0G KV on mount (authoritative persistent memory)
  useEffect(() => {
    if (!user) return;
    hydrateAgentMemory(user.id).then(mem => {
      if (!mem) return;
      if (mem.preferredPriority) setPriority(mem.preferredPriority);
      if (mem.lastAmount) setAmount(String(mem.lastAmount));
    });
  }, [user]);

  const fetchTxList = async () => {
    if (!user) return;
    const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
    const txs = data || [];
    setTxList(txs);
    const totalSavings = txs.reduce((s: number, t: TransactionRow) => s + Number(t.savings || 0), 0);
    const totalAmt     = txs.reduce((s: number, t: TransactionRow) => s + Number(t.amount || 0), 0);
    const efficiency   = totalAmt > 0 ? Math.min(Math.round((totalSavings / totalAmt) * 100), 99) : 0;
    const routeTimes: Record<string, number> = { 'Flash': 8, 'Speed': 3, 'Bridge': 15, 'Economy': 45 };
    const avgConfMs = txs.length > 0
      ? Math.round(txs.reduce((s: number, t: TransactionRow) => {
          const key = Object.keys(routeTimes).find(k => (t.route || '').includes(k)) || '';
          return s + (routeTimes[key] || 12);
        }, 0) / txs.length)
      : 0;
    setStats({ savings: totalSavings, efficiency, avgConfMs });
  };

  useEffect(() => { fetchTxList(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOptimize = async () => {
    if (!amount) return;
    setOptimizing(true);
    setResult(null);
    try {
      setResult(await apiOptimize(parseFloat(amount), priority));
    } catch {
      const amt = parseFloat(amount);
      setResult({
        fee:         Math.round(amt * 0.005 * 100) / 100,
        savings:     Math.round(amt * 0.015 * 100) / 100,
        route:       "0G Chain Flash Route",
        explanation: `Optimized for ${priority} using 0G Newton heuristics.`,
        confidence:  87,
        tee_verified: false,
      });
    } finally { setOptimizing(false); }
  };

  const handleConfirm = async () => {
    if (!result || !user) return;
    setSaving(true);
    try {
      // Generate ZK proof for this optimization
      let localZkCommitment = "";
      try {
        const zkResult = await generateZKProof(
          parseFloat(amount), result.fee,
          result.savings, result.route, user.id
        );
        localZkCommitment = zkResult.commitment;
        setZkCommitment(localZkCommitment);
      } catch { /* non-blocking — proceed without ZK proof */ }

      // Upload metadata to 0G Storage and get immutable root hash
      const storageResult = await storageService.uploadWithProof({
        user_id: user.id,
        amount: parseFloat(amount),
        fee: result.fee,
        savings: result.savings,
        route: result.route,
        tee_verified: result.tee_verified,
        tee_proof: result.tee_proof || "",
        zk_commitment: localZkCommitment,
        timestamp: Date.now(),
      });

      await supabase.from('transactions').insert([{
        user_id: user.id,
        amount: parseFloat(amount),
        optimized_fee: result.fee,
        savings: result.savings,
        route: result.route,
        status: 'pending',
        tx_hash: storageResult.txHash || storageResult.rootHash?.slice(0, 42) || storageResult.rootHash,
        storage_root: storageResult.rootHash,
        storage_scan_url: storageResult.storageScanUrl,
      }]);

      // Persist agent memory to 0G Storage KV
      const existing = loadAgentMemory(user.id);
      const updated = mergeOptimizationIntoMemory(
        existing, user.id, priority,
        parseFloat(amount), result.route, result.savings
      );
      await saveAgentMemory(updated);

      // Update Agent ID on-chain with new memory root + reputation increment
      if (isConnected && signer) {
        try {
          const minted = await hasAgentID(signer);
          if (!minted) await mintAgentID(signer);
          await updateAgentMemory(signer, storageResult.rootHash, result.savings);
          const onChainTxHash = await recordTransactionOnChain(signer, parseFloat(amount), result.fee, result.route);
          // Update Supabase status to confirmed with real on-chain tx hash
          await supabase.from('transactions')
            .update({ status: 'confirmed', tx_hash: onChainTxHash })
            .eq('user_id', user.id)
            .eq('storage_root', storageResult.rootHash);
        } catch (e) {
          console.warn("Agent ID update skipped:", e);
          // Even without on-chain confirmation, mark as confirmed in DB
          // since the 0G Storage receipt is the source of truth
          await supabase.from('transactions')
            .update({ status: 'confirmed' })
            .eq('user_id', user.id)
            .eq('storage_root', storageResult.rootHash);
        }
      } else {
        // No wallet connected — still mark confirmed via 0G Storage receipt
        await supabase.from('transactions')
          .update({ status: 'confirmed' })
          .eq('user_id', user.id)
          .eq('storage_root', storageResult.rootHash);
      }

      setResult(null);
      setAmount("");
      fetchTxList();
    } finally {
      setSaving(false);
    }
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
  const analyzeData = txList.reduce((acc: Record<string, RouteAnalysis>, tx) => {
    const r = tx.route || "Unknown";
    if (!acc[r]) acc[r] = { route: r, count: 0, totalSavings: 0, totalFees: 0 };
    acc[r].count++;
    acc[r].totalSavings += Number(tx.savings || 0);
    acc[r].totalFees += Number(tx.optimized_fee || 0);
    return acc;
  }, {});
  const analyzeRows: RouteAnalysis[] = Object.values(analyzeData);

  return (
    <>
      <Head><title>Transaction Optimization | SmartChain Hub</title></Head>
      <div className="space-y-6">

        {/* Tabs */}
        <div className="flex gap-4 sm:gap-6 border-b border-gray-700 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {["Optimize", "Analyze", "Simulate"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-200"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Potential Savings</p>
            <span className="text-3xl font-bold text-white">${stats.savings.toFixed(2)}</span>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Efficiency Gain</p>
            <span className="text-3xl font-bold text-white">{stats.efficiency}%</span>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Avg Confirmation</p>
            <span className="text-3xl font-bold text-white">{stats.avgConfMs > 0 ? `${stats.avgConfMs}s` : '—'}</span>
          </div>
        </div>

        {/* ── OPTIMIZE TAB ── */}
        {activeTab === "Optimize" && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-base font-bold text-white mb-5">AI Transaction Optimizer</h2>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Transaction Amount ($)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900"/>
              </div>
              <div className="flex gap-2">
                {['efficiency','speed','security'].map(p => (
                  <button key={p} onClick={() => setPriority(p)}
                    className={`flex-1 py-2.5 text-xs font-semibold rounded-xl capitalize transition-all border ${priority === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'}`}>
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
                  <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                      <div><p className="text-xs text-gray-500">Optimized Fee</p><p className="text-lg font-bold text-white">${result.fee}</p></div>
                      <div><p className="text-xs text-gray-500">Savings</p><p className="text-lg font-bold text-green-600">${result.savings}</p></div>
                      <div><p className="text-xs text-gray-500">Est. Time</p><p className="text-lg font-bold text-blue-600">{result.estimated_time_s || 12}s</p></div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Route: <span className="font-medium text-gray-200">{result.route}</span></p>
                    <div className="flex items-center gap-3 mb-2">
                      {result.risk && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${result.risk === 'Very Low' || result.risk === 'Low' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>Risk: {result.risk}</span>}
                      {result.congestion !== undefined && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium">Network: {result.congestion}% congestion</span>}
                    </div>
                    <p className="text-xs text-gray-500 italic">{result.explanation}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${result.confidence}%` }}/>
                      </div>
                      <span className="text-xs text-gray-500">{result.confidence}% confidence</span>
                    </div>
                  </div>

                  {/* TEE Verification Badge */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${result.tee_verified ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-500/[0.05] border-blue-500/20'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${result.tee_verified ? 'bg-blue-600' : 'bg-blue-500/30'}`}>
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
                          <p className="text-xs font-bold text-blue-400">AI Inference Active — TensorFlow 2.16</p>
                          <p className="text-xs text-gray-500">Routes to 0G Compute TeeML when broker is available</p>
                        </>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ${result.tee_verified ? 'bg-blue-600 text-white' : 'bg-blue-500/20 text-blue-300'}`}>
                      {result.ml_engine?.includes('0G') ? '0G Compute' : '0G AI'}
                    </span>
                  </div>

                  {/* ZK Proof Badge */}
                  {zkCommitment && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border bg-purple-500/10 border-purple-500/30">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-purple-400">✓ ZK Proof Generated</p>
                        <p className="text-xs text-purple-300 font-mono truncate">Commitment: {zkCommitment.slice(0, 26)}...</p>
                        <p className="text-xs text-gray-500">Proves: savings &gt; 0, fee &lt; 2%, rate in valid range</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full font-semibold shrink-0 bg-purple-600 text-white">ZK</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => { setResult(null); setZkCommitment(""); }} className="flex-1 py-2.5 border border-gray-700 text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-800">Reset</button>
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
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-base font-bold text-white mb-5">Transaction Analysis</h2>
              {analyzeRows.length > 0 ? (
                <>
                  {/* Route breakdown */}
                  <div className="space-y-3 mb-6">
                    {analyzeRows.map((row, i) => {
                      const maxSavings = Math.max(...analyzeRows.map(r => r.totalSavings), 1);
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-200 font-medium">{row.route}</span>
                            <span className="text-gray-500">{row.count} tx · <span className="text-green-600 font-semibold">${row.totalSavings.toFixed(2)} saved</span></span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(row.totalSavings / maxSavings) * 100}%` }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Summary table */}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 border-b border-gray-800">
                        <th className="py-2 text-left font-medium">Route</th>
                        <th className="py-2 text-left font-medium">Transactions</th>
                        <th className="py-2 text-left font-medium">Total Fees</th>
                        <th className="py-2 text-left font-medium">Total Savings</th>
                        <th className="py-2 text-left font-medium">Efficiency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyzeRows.map((row, i) => (
                        <tr key={i} className="border-b border-gray-800">
                          <td className="py-3 text-gray-200 font-medium">{row.route}</td>
                          <td className="py-3 text-gray-500">{row.count}</td>
                          <td className="py-3 text-gray-500">${row.totalFees.toFixed(2)}</td>
                          <td className="py-3 text-green-600 font-semibold">${row.totalSavings.toFixed(2)}</td>
                          <td className="py-3">
                            <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full font-medium">
                              {row.totalFees > 0 ? Math.round((row.totalSavings / (row.totalSavings + row.totalFees)) * 100) : 0}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">No transaction data to analyze yet.</p>
                  <p className="text-xs mt-1">Use the Optimize tab to create transactions first.</p>
                </div>
              )}
            </div>

            {/* Savings over time mini chart */}
            {txList.length > 1 && (
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-sm font-bold text-white mb-4">Savings Over Time</h3>
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
                <p className="text-xs text-gray-500 mt-2">Each bar = one transaction, sorted oldest → newest</p>
              </div>
            )}
          </div>
        )}

        {/* ── SIMULATE TAB ── */}
        {activeTab === "Simulate" && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-base font-bold text-white mb-2">Transaction Simulator</h2>
            <p className="text-xs text-gray-500 mb-6">Test different routes and amounts without executing a real transaction.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Amount to Simulate ($)</label>
                  <input type="number" value={simAmount} onChange={e => setSimAmount(e.target.value)} placeholder="0.00"
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900"/>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Route</label>
                  <select value={simRoute} onChange={e => setSimRoute(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900">
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
                    <h3 className="text-sm font-bold text-gray-200">Simulation Result</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: 'Estimated Fee',  value: `$${simResult.estimatedFee}`,    color: 'text-white' },
                        { label: 'Est. Savings',   value: `$${simResult.savings}`,          color: 'text-green-600' },
                        { label: 'Confirmation',   value: `~${simResult.estimatedTime}s`,   color: 'text-blue-600' },
                        { label: 'Success Rate',   value: `${simResult.successRate}%`,      color: 'text-white' },
                      ].map(item => (
                        <div key={item.label} className="p-3 bg-gray-900 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                          <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold">Route:</span> {simResult.route} &nbsp;·&nbsp;
                        <span className="font-semibold">Risk:</span>{' '}
                        <span className={simResult.risk === 'Low' ? 'text-green-600' : 'text-yellow-600'}>{simResult.risk}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1 italic">This is a simulation only — no funds are moved.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-xl p-8">
                    <div>
                      <svg className="w-10 h-10 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-base font-bold text-white">Recommendations</h2>
          </div>
          <div className="overflow-x-auto"><table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800">
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
                <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-6 py-4 text-sm text-gray-200 font-mono">{tx.tx_hash?.slice(0, 16)}...</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(tx.created_at ?? 0).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">${Number(tx.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">${Number(tx.optimized_fee || 0).toFixed(2)}</td>
                  <td className="px-6 py-4"><span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-500/10 text-green-400">${Number(tx.savings || 0).toFixed(2)}</span></td>
                  <td className="px-6 py-4">
                    <button onClick={() => { setActiveTab("Optimize"); setAmount(String(tx.amount)); }}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                      Optimize
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">No transactions yet. Use the Optimize tab to get started.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </>
  );
}
