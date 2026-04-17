import Head from "next/head";
import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/hooks/useAuth";

export default function HistoryPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setTransactions(data || []);
      setLoading(false);
    };
    fetch();
    const sub = supabase.channel('history')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [user]);

  const filtered = transactions.filter(tx =>
    (tx.tx_hash || '').toLowerCase().includes(search.toLowerCase()) ||
    (tx.route || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head><title>Blockchain | PayOptimize</title></Head>
      <div className="space-y-6">
        {/* Search + header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-800">On-Chain Activity</h2>
            <p className="text-xs text-gray-400 mt-0.5">Verifiable records of all AI-optimized transactions</p>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="Search by hash or route..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"/>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-3 text-left font-medium">Transaction Hash</th>
                  <th className="px-6 py-3 text-left font-medium">Amount</th>
                  <th className="px-6 py-3 text-left font-medium">Savings</th>
                  <th className="px-6 py-3 text-left font-medium">AI Route</th>
                  <th className="px-6 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map(tx => (
                  <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-blue-600 font-medium truncate max-w-[160px]">{tx.tx_hash}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(tx.created_at).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">${Number(tx.amount).toLocaleString()}</td>
                    <td className="px-6 py-4"><span className="text-sm font-medium text-green-600">${Number(tx.savings || 0).toFixed(2)}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{tx.route || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${tx.status === 'confirmed' ? 'bg-green-100 text-green-700' : tx.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-sm text-gray-400">
                      {loading ? 'Loading transactions...' : search ? 'No results found.' : 'No transactions yet. Use the AI Optimizer to get started.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Showing {filtered.length} of {transactions.length} records</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full"/>
              <span className="text-xs text-gray-500">0G Chain Connected</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
