import Head from "next/head";
import { errMsg } from "@/utils/errors";
import { capSavings } from "@/utils/format";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/hooks/useAuth";
import AgentIDCard from "@/components/AgentIDCard";
import { hydrateAgentMemory } from "@/utils/agentMemory";
import { triggerFineTune } from "@/utils/api";
import type { FineTuneResult } from "@/utils/api";
import StatCard from "@/components/StatCard";
import OgNetworkStatus from "@/components/OgNetworkStatus";
import ProtocolStats from "@/components/ProtocolStats";

type TxActivity = { amount?: number; savings?: number; status?: string; created_at?: string; tx_hash?: string; route?: string };

export default function Dashboard() {
  const { user } = useAuth(false);
  const [stats, setStats] = useState({ totalTx: 0, revenue: 0, nodescore: 0, prevTx: 0, prevReputation: 0 });
  const [activity, setActivity] = useState<TxActivity[]>([]);
  const [barData, setBarData] = useState<number[]>(Array(30).fill(0));
  const [fineTuning, setFineTuning] = useState(false);
  const [fineTuneResult, setFineTuneResult] = useState<FineTuneResult | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      hydrateAgentMemory(user.id, session?.access_token ?? "").catch(() => {});
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const sixtyDaysAgo  = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

        const txRes     = await supabase.from('transactions').select('amount,savings,status,created_at,tx_hash,route').eq('user_id', user.id).gte('created_at', thirtyDaysAgo).order('created_at', { ascending: false });
        const revRes    = await supabase.from('revenue_shares').select('user_share').eq('user_id', user.id);
        const prevTxRes = await supabase.from('transactions').select('id,status').eq('user_id', user.id).gte('created_at', sixtyDaysAgo).lt('created_at', thirtyDaysAgo);

        const txs     = (txRes.data     || []) as TxActivity[];
        const revs    = revRes.data    || [];
        const prevTxs = (prevTxRes.data || []) as { status?: string }[];

        const totalRevenue  = revs.reduce((s, r) => s + Number(r.user_share), 0);
        const nodescore     = txs.filter(t => t.status === 'confirmed').length;
        const prevReputation = prevTxs.filter(t => t.status === 'confirmed').length;

        const buckets = Array(30).fill(0);
        txs.forEach(tx => {
          const daysAgo = Math.floor((Date.now() - new Date(tx.created_at ?? 0).getTime()) / (24 * 60 * 60 * 1000));
          if (daysAgo >= 0 && daysAgo < 30) buckets[29 - daysAgo] += Number(tx.amount || 0);
        });
        const maxBucket = Math.max(...buckets, 1);
        setBarData(buckets.map(v => Math.round((v / maxBucket) * 85) + 5));

        setStats({ totalTx: txs.length, revenue: totalRevenue, nodescore, prevTx: prevTxs.length, prevReputation });
        setActivity(txs.slice(0, 5));
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
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? "";
      const result = await triggerFineTune([], false, token);
      setFineTuneResult(result);
    } catch (e: unknown) {
      setFineTuneResult({ ok: false, reason: errMsg(e) });
    } finally {
      setFineTuning(false);
    }
  };

  const rows = activity.map(tx => ({
    description: tx.tx_hash ? `${tx.tx_hash.slice(0, 10)}...${tx.tx_hash.slice(-6)}` : '—',
    amount: `$${Number(tx.amount).toLocaleString()}`,
    savings: `$${capSavings(Number(tx.savings || 0), tx.amount ?? null).toFixed(2)}`,
    status: tx.status === 'confirmed' ? 'Confirmed' : tx.status === 'pending' ? 'Pending' : (tx.status ?? 'Unknown'),
    statusCls: tx.status === 'confirmed'
      ? 'badge-confirmed'
      : tx.status === 'pending'
      ? 'badge-pending'
      : 'bg-gray-500/10 text-gray-400 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-500/20',
    route: tx.route || '—',
  }));

  const txGrowth   = stats.prevTx > 0 ? (((stats.totalTx - stats.prevTx) / stats.prevTx) * 100).toFixed(1) : null;
  const repGrowth  = stats.prevReputation > 0 ? (((stats.nodescore - stats.prevReputation) / stats.prevReputation) * 100).toFixed(1) : null;

  return (
    <>
      <Head><title>Dashboard | SmartChain Hub</title><meta name="robots" content="noindex,nofollow" /></Head>
      <div className="space-y-6 animate-fade-in-up">

        {/* Page header */}
        <div>
          <h1 className="text-xl font-black text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your agent activity and 0G network performance.</p>
        </div>

        {/* Agent ID Card */}
        <AgentIDCard />

        {/* Fine-tune AI Model */}
        <div className="card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">AI Model Fine-tuning</h2>
                <p className="text-xs text-gray-500 mt-0.5">Retrain on your transaction data stored in 0G Storage</p>
              </div>
            </div>
            <button
              onClick={handleFineTune}
              disabled={fineTuning}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50 sm:shrink-0 shadow-sm shadow-blue-600/20">
              {fineTuning ? (
                <><div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />Fine-tuning...</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>Fine-tune Model</>
              )}
            </button>
          </div>
          {fineTuneResult && (
            <div className={`mt-4 p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              fineTuneResult.ok
                ? 'bg-emerald-500/8 border border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/8 border border-red-500/20 text-red-400'
            }`}>
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {fineTuneResult.ok
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                }
              </svg>
              <span>
                {fineTuneResult.ok
                  ? `Fine-tuned on ${fineTuneResult.samples} samples · Loss: ${fineTuneResult.final_loss?.toFixed(6)} · Hash: ${fineTuneResult.model_hash?.slice(0, 18)}...`
                  : `${fineTuneResult.reason || 'Fine-tune failed'} (${fineTuneResult.samples ?? 0} samples)`
                }
              </span>
            </div>
          )}
        </div>

        {/* 0G Network Status */}
        <ProtocolStats />
        <OgNetworkStatus />

        {/* Stats Cards — use StatCard component */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Transactions (30d)"
            value={stats.totalTx.toLocaleString()}
            change={txGrowth !== null ? `${Number(txGrowth) >= 0 ? '+' : ''}${txGrowth}%` : undefined}
            changePositive={txGrowth !== null && Number(txGrowth) >= 0}
            accent="blue"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            }
            sub="vs. prior 30 days"
          />
          <StatCard
            label="Revenue Earned"
            value={`$${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            accent="green"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            }
            sub="Cumulative revenue share"
          />
          <StatCard
            label="Agent Reputation"
            value={stats.nodescore.toString()}
            change={repGrowth !== null ? `${Number(repGrowth) >= 0 ? '+' : ''}${repGrowth}%` : undefined}
            changePositive={repGrowth !== null && Number(repGrowth) >= 0}
            accent="purple"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            }
            sub="Confirmed optimizations"
          />
        </div>

        {/* Bar Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-white">Transaction Volume</h2>
              <p className="text-xs text-gray-500 mt-0.5">Daily volume over the last 30 days</p>
            </div>
            <div className="flex items-center gap-1.5 border border-gray-700/80 rounded-lg px-3 py-1.5 text-xs text-gray-500 select-none">
              Last 30 Days
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <div className="flex gap-3">
            {/* Y-axis */}
            <div className="flex flex-col justify-between text-right pr-2 text-[10px] text-gray-600 h-40 shrink-0 select-none">
              <span>High</span><span>Mid</span><span>Low</span>
            </div>
            {/* Bars with gradient */}
            <div className="flex-1 flex items-end gap-0.5 h-40">
              {barData.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${h}%`,
                    background: h > 60
                      ? 'linear-gradient(to top, #2563EB, #60A5FA)'
                      : h > 30
                      ? 'linear-gradient(to top, #1D4ED8, #93C5FD)'
                      : 'linear-gradient(to top, #1e3a5f, #BFDBFE40)',
                  }}
                />
              ))}
            </div>
          </div>
          {/* X-axis labels */}
          <div className="flex justify-between mt-2 ml-8 text-[10px] text-gray-600 select-none">
            {['1','5','10','15','20','25','30'].map(l => <span key={l}>{l}</span>)}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div>
              <h2 className="text-sm font-bold text-white">Recent Activity</h2>
              <p className="text-xs text-gray-500 mt-0.5">Your latest optimization transactions</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-[10px] text-gray-600 border-b border-gray-800/60 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left font-semibold">Tx Hash</th>
                  <th className="px-6 py-3 text-left font-semibold">Route</th>
                  <th className="px-6 py-3 text-left font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold">Savings</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {rows.length > 0 ? rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-xs text-gray-400 font-mono">{row.description}</td>
                    <td className="px-6 py-4 text-xs text-blue-400 font-medium truncate max-w-[120px]">{row.route}</td>
                    <td className="px-6 py-4 text-sm text-white font-semibold tabular-nums">{row.amount}</td>
                    <td className="px-6 py-4 text-sm text-green-400 font-semibold tabular-nums">{row.savings}</td>
                    <td className="px-6 py-4"><span className={row.statusCls}>{row.status}</span></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        <p className="text-sm text-gray-500">No transactions in the last 30 days</p>
                        <p className="text-xs text-gray-600">Run your first optimization to see activity here</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Route Performance */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div>
              <h2 className="text-sm font-bold text-white">Route Performance</h2>
              <p className="text-xs text-gray-500 mt-0.5">Savings breakdown by optimization route</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-[10px] text-gray-600 border-b border-gray-800/60 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left font-semibold">Route</th>
                  <th className="px-6 py-3 text-left font-semibold">Transactions</th>
                  <th className="px-6 py-3 text-left font-semibold">Total Savings</th>
                  <th className="px-6 py-3 text-left font-semibold">Avg Savings</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {(() => {
                  const routeMap: Record<string, { count: number; savings: number }> = {};
                  activity.forEach(tx => {
                    const r = tx.route || 'Unknown';
                    if (!routeMap[r]) routeMap[r] = { count: 0, savings: 0 };
                    routeMap[r].count++;
                    routeMap[r].savings += capSavings(Number(tx.savings || 0), tx.amount ?? null);
                  });
                  const routes = Object.entries(routeMap);
                  return routes.length > 0 ? routes.map(([route, data], i) => (
                    <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-blue-400 font-medium max-w-[160px] truncate">{route}</td>
                      <td className="px-6 py-4 text-sm text-gray-400 tabular-nums">{data.count}</td>
                      <td className="px-6 py-4 text-sm text-green-400 font-semibold tabular-nums">${data.savings.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-400 tabular-nums">${(data.savings / data.count).toFixed(2)}</td>
                      <td className="px-6 py-4"><span className="badge-confirmed">Active</span></td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-600">No route data yet.</td>
                    </tr>
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
