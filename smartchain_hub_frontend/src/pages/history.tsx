import Head from "next/head";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/hooks/useAuth";
import { capSavings } from "@/utils/format";

type TxRow = { id?: string; tx_hash?: string; amount?: number; savings?: number; optimized_fee?: number; status?: string; created_at?: string; route?: string; storage_root?: string; storage_scan_url?: string };

export default function HistoryPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setTransactions(data || []);
      setLoading(false);
    };
    fetch();
    const sub = supabase.channel('history')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [user]);

  const filtered = transactions.filter(tx => {
    const matchSearch =
      (tx.tx_hash || '').toLowerCase().includes(search.toLowerCase()) ||
      (tx.route || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || tx.status === filter;
    return matchSearch && matchFilter;
  });

  const totalSavings = transactions.reduce((s, t) => s + Number(t.savings || 0), 0);
  const confirmed = transactions.filter(t => t.status === 'confirmed').length;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      confirmed: 'bg-green-500/10 text-green-400 border border-green-500/20',
      pending:   'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
      failed:    'bg-red-500/10 text-red-400 border border-red-500/20',
    };
    return map[status] || 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
  };

  return (
    <>
      <Head><title>History | SmartChain Hub</title><meta name="robots" content="noindex,nofollow" /></Head>
      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs text-gray-500 mb-1">Total Transactions</p>
            <p className="text-3xl font-black text-white">{transactions.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs text-gray-500 mb-1">Total Savings</p>
            <p className="text-3xl font-black text-green-400">${totalSavings.toFixed(2)}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs text-gray-500 mb-1">Confirmed On-Chain</p>
            <p className="text-3xl font-black text-blue-400">{confirmed}</p>
          </div>
        </div>

        {/* Search + filter */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="Search by hash or route..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"/>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'confirmed', 'pending', 'failed'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500 hover:text-white'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-800 bg-gray-800/50">
                  <th className="px-5 py-3 text-left font-medium">Transaction</th>
                  <th className="px-5 py-3 text-left font-medium">Amount</th>
                  <th className="px-5 py-3 text-left font-medium">Fee</th>
                  <th className="px-5 py-3 text-left font-medium">Savings</th>
                  <th className="px-5 py-3 text-left font-medium">Route</th>
                  <th className="px-5 py-3 text-left font-medium">Storage</th>
                  <th className="px-5 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map(tx => (
                  <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {/* Only link if tx_hash is a real 64-char hex hash, not a zero/fallback hash */}
                        {tx.tx_hash && /^0x[a-fA-F0-9]{64}$/.test(tx.tx_hash) && !tx.tx_hash.match(/^0x0+$/) ? (
                          <a href={`https://scan-testnet.0g.ai/tx/${tx.tx_hash}`} target="_blank" rel="noreferrer"
                            className="text-xs font-mono text-blue-400 hover:text-blue-300 truncate max-w-[130px]">
                            {tx.tx_hash.slice(0, 14)}...
                          </a>
                        ) : (
                          <span className="text-xs font-mono text-gray-500 truncate max-w-[130px]">
                            {tx.tx_hash ? tx.tx_hash.slice(0, 14) + '...' : '—'}
                          </span>
                        )}
                        {tx.tx_hash && /^0x[a-fA-F0-9]{64}$/.test(tx.tx_hash) && !tx.tx_hash.match(/^0x0+$/) && (
                          <svg className="w-3 h-3 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{new Date(tx.created_at ?? 0).toLocaleString()}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-white">${Number(tx.amount).toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm text-gray-400">${Number(tx.optimized_fee || 0).toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-green-400">+${capSavings(Number(tx.savings || 0), tx.amount ?? null).toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 max-w-[120px] truncate">{tx.route || '—'}</td>
                    <td className="px-5 py-4">
                      {tx.storage_root ? (
                        <a href={tx.storage_scan_url || `https://storagescan-newton.0g.ai`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full"/>
                          0G Storage ↗
                        </a>
                      ) : (
                        <span className="text-xs text-gray-700">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(tx.status ?? '')}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-600">
                      {loading ? 'Loading...' : search ? 'No results found.' : 'No transactions yet. Use the AI Optimizer to get started.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-800 flex items-center justify-between">
            <p className="text-xs text-gray-600">Showing {filtered.length} of {transactions.length} records</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                0G Chain Live
              </span>
              <a href="https://scan-testnet.0g.ai/address/0xf95A1610be22046c334E3bD1b11D2B88519E6C52"
                target="_blank" rel="noreferrer"
                className="text-xs text-blue-500 hover:text-blue-400">
                ChainScan ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
