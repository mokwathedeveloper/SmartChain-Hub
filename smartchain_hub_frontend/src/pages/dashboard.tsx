import Head from "next/head";
import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/hooks/useAuth";

const barHeights = [20,35,25,45,30,40,55,35,45,50,60,42,50,38,58,48,55,65,52,62,44,55,58,48,52,62,55,58,48,65];

const staticActivity = [
  { description: "Optimization Payout", type: "Received", amount: "$1,200", status: "Paid", statusCls: "bg-green-100 text-green-700" },
  { description: "Node Fee Collected",  type: "Received", amount: "$150",   status: "Received", statusCls: "bg-yellow-100 text-yellow-700" },
  { description: "Revenue Share",       type: "Received", amount: "$1,850", status: "Paid",     statusCls: "bg-green-100 text-green-700" },
  { description: "Gas Fee Reduction",   type: "Received", amount: "$45",    status: "Saved",    statusCls: "bg-blue-100 text-blue-700" },
];

const staticDatasource = [
  { name: "Payment",  bank: "Bankspeed", amount: "$8th", freq: "Paintedact day Farcrybers",      statusCls: "bg-blue-100 text-blue-700" },
  { name: "Bkld",     bank: "Bankybane", amount: "$8th", freq: "Randurfam doyy Facnyooes",       statusCls: "bg-blue-100 text-blue-700" },
  { name: "Dpyeut",   bank: "Bantybao",  amount: "$8th", freq: "donidonfect doyy Fannyooes",     statusCls: "bg-blue-100 text-blue-700" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalTx: 0, revenue: 0, nodescore: 0 });
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [txRes, revRes] = await Promise.all([
        supabase.from('transactions').select('amount,savings,status,created_at,tx_hash,route').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4),
        supabase.from('revenue_shares').select('user_share').eq('user_id', user.id),
      ]);
      const txs = txRes.data || [];
      const revs = revRes.data || [];
      const totalRevenue = revs.reduce((s, r) => s + Number(r.user_share), 0);
      const nodescore = txs.filter((t: any) => t.status === 'confirmed').length;
      setStats({ totalTx: txs.length, revenue: totalRevenue, nodescore });
      setActivity(txs);
      setLoading(false);
    };
    fetch();
    const sub = supabase.channel('dash').on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, fetch).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [user]);

  // Use real activity if available, else show static mockup rows
  const rows = activity.length > 0
    ? activity.map(tx => ({
        description: tx.tx_hash?.slice(0, 20) + '...',
        type: "Received",
        amount: `$${Number(tx.amount).toLocaleString()}`,
        status: tx.status === 'confirmed' ? 'Paid' : tx.status === 'pending' ? 'Received' : 'Saved',
        statusCls: tx.status === 'confirmed' ? 'bg-green-100 text-green-700' : tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700',
      }))
    : staticActivity;

  return (
    <>
      <Head><title>Dashboard | PayOptimize</title></Head>
      <div className="space-y-5">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Total Transactions</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-800">{stats.totalTx.toLocaleString()}</span>
              <span className="text-sm text-green-500 font-medium mb-0.5">+18.4%</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Revenue Earned</p>
            <span className="text-3xl font-bold text-gray-800">${stats.revenue.toLocaleString()}</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Active Nodescore</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-800">{stats.nodescore}</span>
              <span className="text-sm text-green-500 font-medium mb-0.5">+12.4%</span>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Transaction Volume</h2>
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-500 cursor-pointer">
              Last 30 Days
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>
          <div className="flex gap-3">
            {/* Y-axis */}
            <div className="flex flex-col justify-between text-right pr-2 text-xs text-gray-400 h-36 shrink-0">
              <span>300</span><span>100</span><span>$0</span><span>0</span>
            </div>
            {/* Bars */}
            <div className="flex-1 flex items-end gap-0.5 h-36">
              {barHeights.map((h, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{
                  height: `${h}%`,
                  background: i % 3 === 0 ? '#3B82F6' : i % 3 === 1 ? '#93C5FD' : '#BFDBFE'
                }}/>
              ))}
            </div>
          </div>
          {/* X-axis labels */}
          <div className="flex justify-between mt-1 ml-8 text-xs text-gray-400">
            {['$10','$20','$30','$40','$50','$60','$70','$80','$90','$100'].map(l => <span key={l}>{l}</span>)}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Recent Activity</h2>
            <button className="text-gray-300 hover:text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-50">
                <th className="px-6 py-3 text-left font-medium">Description</th>
                <th className="px-6 py-3 text-left font-medium">Type</th>
                <th className="px-6 py-3 text-left font-medium">Amount</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.description}</td>
                  <td className="px-6 py-4"><span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{row.type}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.amount}</td>
                  <td className="px-6 py-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${row.statusCls}`}>{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Datasource */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Datasource</h2>
            <button className="text-gray-300 hover:text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
          <table className="w-full">
            <tbody>
              {staticDatasource.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-sm text-blue-600 font-medium">{row.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.bank}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[180px]">{row.freq}</td>
                  <td className="px-6 py-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${row.statusCls}`}>Bankdu Reamoed</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}
