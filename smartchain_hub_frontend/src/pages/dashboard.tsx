import Head from "next/head";
import { errMsg } from "@/utils/errors";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/hooks/useAuth";
import AgentIDCard from "@/components/AgentIDCard";
import { hydrateAgentMemory } from "@/utils/agentMemory";
import { triggerFineTune } from "@/utils/api";
import type { FineTuneResult } from "@/utils/api";

type TxActivity = { amount?: number; savings?: number; status?: string; created_at?: string; tx_hash?: string; route?: string };

export default function Dashboard() {
  const { user } = useAuth(false); // false = don't redirect if no Supabase session — AgentIDCard works wallet-only
  const [stats, setStats] = useState({ totalTx: 0, revenue: 0, nodescore: 0, prevTx: 0, prevReputation: 0 });
  const [activity, setActivity] = useState<TxActivity[]>([]);
  const [barData, setBarData] = useState<number[]>(Array(30).fill(0));
  const [fineTuning, setFineTuning] = useState(false);
  const [fineTuneResult, setFineTuneResult] = useState<FineTuneResult | null>(null);

  // Hydrate agent memory from 0G KV on mount
  useEffect(() => {
    if (user) hydrateAgentMemory(user.id).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const sixtyDaysAgo  = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

        // Sequential queries to avoid HTTP2 stream exhaustion
        const txRes     = await supabase.from('transactions').select('amount,savings,status,created_at,tx_hash,route').eq('user_id', user.id).gte('created_at', thirtyDaysAgo).order('created_at', { ascending: false });
        const revRes    = await supabase.from('revenue_shares').select('user_share').eq('user_id', user.id);
        const prevTxRes = await supabase.from('transactions').select('id,status').eq('user_id', user.id).gte('created_at', sixtyDaysAgo).lt('created_at', thirtyDaysAgo);

        const txs     = (txRes.data     || []) as TxActivity[];
        const revs    = revRes.data    || [];
        const prevTxs = (prevTxRes.data || []) as { status?: string }[];

        const totalRevenue = revs.reduce((s, r) => s + Number(r.user_share), 0);
        const nodescore    = txs.filter(t => t.status === 'confirmed').length;
        const prevReputation = prevTxs.filter(t => t.status === 'confirmed').length;

        const buckets = Array(30).fill(0);
        txs.forEach(tx => {
          const daysAgo = Math.floor((Date.now() - new Date(tx.created_at ?? 0).getTime()) / (24 * 60 * 60 * 1000));
          if (daysAgo >= 0 && daysAgo < 30) buckets[29 - daysAgo] += Number(tx.amount || 0);
        });
        const maxBucket = Math.max(...buckets, 1);
        setBarData(buckets.map(v => Math.round((v / maxBucket) * 90) + 5));

        setStats({ totalTx: txs.length, revenue: totalRevenue, nodescore, prevTx: prevTxs.length, prevReputation });
        setActivity(txs.slice(0, 4));
      } catch {
        // Supabase unavailable — show empty state
      }
    };
    fetch();
    const sub = supabase.channel('dash').on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, fetch).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [user]);

  const handleFineTune = async () => {
    setFineTuning(true);
    setFineTuneResult(null);
    try {
      const result = await triggerFineTune([], false);
      setFineTuneResult(result);
    } catch (e: unknown) {
      setFineTuneResult({ ok: false, reason: errMsg(e) });
    } finally {
      setFineTuning(false);
    }
  };

  const rows = activity.map(tx => ({
    description: tx.tx_hash?.slice(0, 20) + '...',
    type: "Optimization",
    amount: `$${Number(tx.amount).toLocaleString()}`,
    status: tx.status === 'confirmed' ? 'Confirmed' : tx.status === 'pending' ? 'Pending' : tx.status,
    statusCls: tx.status === 'confirmed' ? 'bg-green-500/10 text-green-400' : tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-blue-500/10 text-blue-400',
    route: tx.route || '—',
    savings: Number(tx.savings || 0).toFixed(2),
  }));

  const txGrowth = stats.prevTx > 0 ? (((stats.totalTx - stats.prevTx) / stats.prevTx) * 100).toFixed(1) : null;
  const repGrowth = stats.prevReputation > 0 ? (((stats.nodescore - stats.prevReputation) / stats.prevReputation) * 100).toFixed(1) : null;

  return (
    <>
      <Head><title>Dashboard | SmartChain Hub</title></Head>
      <div className="space-y-5">

        {/* Agent ID Card */}
        <AgentIDCard />

        {/* Fine-tune AI Model Panel */}
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">AI Model Fine-tuning</h2>
              <p className="text-xs text-gray-500 mt-0.5">Retrain the TF model on your real transaction data stored in 0G Storage</p>
            </div>
            <button
              onClick={handleFineTune}
              disabled={fineTuning}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50 sm:shrink-0">
              {fineTuning ? (
                <><div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />Fine-tuning...</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>Fine-tune Model</>
              )}
            </button>
          </div>
          {fineTuneResult && (
            <div className={`mt-3 p-3 rounded-xl text-xs ${
              fineTuneResult.ok ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {fineTuneResult.ok
                ? `✓ Fine-tuned on ${fineTuneResult.samples} samples · Loss: ${fineTuneResult.final_loss?.toFixed(6)} · Hash: ${fineTuneResult.model_hash?.slice(0, 18)}...`
                : `✗ ${fineTuneResult.reason || 'Fine-tune failed'} (${fineTuneResult.samples ?? 0} samples)`
              }
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Transactions (30d)</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{stats.totalTx.toLocaleString()}</span>
              {txGrowth !== null && (
                <span className={`text-sm font-medium mb-0.5 ${Number(txGrowth) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Number(txGrowth) >= 0 ? '+' : ''}{txGrowth}%
                </span>
              )}
            </div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Revenue Earned</p>
            <span className="text-3xl font-bold text-white">${stats.revenue.toLocaleString()}</span>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Agent Reputation</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{stats.nodescore}</span>
              {repGrowth !== null && (
                <span className={`text-sm font-medium mb-0.5 ${Number(repGrowth) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Number(repGrowth) >= 0 ? '+' : ''}{repGrowth}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Transaction Volume</h2>
            <div className="flex items-center gap-1 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-500 cursor-pointer">
              Last 30 Days
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>
          <div className="flex gap-3">
            {/* Y-axis */}
            <div className="flex flex-col justify-between text-right pr-2 text-xs text-gray-500 h-36 shrink-0">
              <span>300</span><span>100</span><span>$0</span><span>0</span>
            </div>
            {/* Bars */}
            <div className="flex-1 flex items-end gap-0.5 h-36">
              {barData.map((h, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{
                  height: `${h}%`,
                  background: h > 50 ? '#3B82F6' : h > 20 ? '#93C5FD' : '#BFDBFE'
                }}/>
              ))}
            </div>
          </div>
          {/* X-axis labels */}
          <div className="flex justify-between mt-1 ml-8 text-xs text-gray-500">
            {['1','5','10','15','20','25','30'].map(l => <span key={l}>{l}</span>)}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h2 className="text-base font-bold text-white">Recent Activity</h2>
            <button className="text-gray-400 hover:text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800">
                <th className="px-6 py-3 text-left font-medium">Description</th>
                <th className="px-6 py-3 text-left font-medium">Type</th>
                <th className="px-6 py-3 text-left font-medium">Amount</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? rows.map((row, i) => (
                <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-6 py-4 text-sm text-gray-200 font-mono">{row.description}</td>
                  <td className="px-6 py-4"><span className="text-xs bg-gray-800 text-gray-500 px-2.5 py-1 rounded-full">{row.type}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-200 font-medium">{row.amount}</td>
                  <td className="px-6 py-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${row.statusCls}`}>{row.status}</span></td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">No transactions in the last 30 days.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Route Performance */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-base font-bold text-white">Route Performance</h2>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800">
                <th className="px-6 py-3 text-left font-medium">Route</th>
                <th className="px-6 py-3 text-left font-medium">Transactions</th>
                <th className="px-6 py-3 text-left font-medium">Total Savings</th>
                <th className="px-6 py-3 text-left font-medium">Avg Savings</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const routeMap: Record<string, { count: number; savings: number }> = {};
                activity.forEach(tx => {
                  const r = tx.route || 'Unknown';
                  if (!routeMap[r]) routeMap[r] = { count: 0, savings: 0 };
                  routeMap[r].count++;
                  routeMap[r].savings += Number(tx.savings || 0);
                });
                const routes = Object.entries(routeMap);
                return routes.length > 0 ? routes.map(([route, data], i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-6 py-4 text-sm text-blue-400 font-medium">{route}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{data.count}</td>
                    <td className="px-6 py-4 text-sm text-green-400 font-semibold">${data.savings.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">${(data.savings / data.count).toFixed(2)}</td>
                    <td className="px-6 py-4"><span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-500/10 text-green-400">Active</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">No route data yet.</td></tr>
                );
              })()}
            </tbody>
          </table>
          </div>
        </div>

      </div>
    </>
  );
}
