import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

const BlockchainTransactionsWidget = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchTransactions();
    const sub = supabase
      .channel('widget:transactions')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'transactions',
        filter: `user_id=eq.${user.id}`,
      }, fetchTransactions)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (dateString: string) => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60)   return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="card p-6 h-full animate-pulse">
        <div className="h-5 bg-gray-800 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-800 rounded-full shrink-0" />
              <div className="flex-1 h-9 bg-gray-800 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-white">Recent Transactions</h2>
        <Link href="/history" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
          View All →
        </Link>
      </div>

      <div className="space-y-3">
        {transactions.length > 0 ? transactions.map(tx => (
          <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                tx.status === 'confirmed'
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-yellow-500/10 text-yellow-400'
              }`}>
                {tx.status === 'confirmed' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-mono text-gray-300 truncate max-w-[120px]">
                  {tx.tx_hash ? `${tx.tx_hash.slice(0, 14)}...` : '—'}
                </p>
                <p className="text-xs text-gray-600">{timeAgo(tx.created_at)}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-white">${Number(tx.amount).toLocaleString()}</p>
              <span className={tx.status === 'confirmed' ? 'badge-confirmed' : 'badge-pending'}>
                {tx.status}
              </span>
            </div>
          </div>
        )) : (
          <div className="text-center py-10">
            <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No transactions yet.</p>
            <p className="text-xs text-gray-600 mt-1">Use the AI Optimizer to get started.</p>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-800 flex items-center justify-between">
        <span className="text-xs text-gray-600">Network Status</span>
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-xs text-gray-400 font-medium">0G Chain Connected</span>
        </div>
      </div>
    </div>
  );
};

export default BlockchainTransactionsWidget;
