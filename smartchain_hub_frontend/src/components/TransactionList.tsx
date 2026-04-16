import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';

const TransactionList = () => {
  const { user } = useAuth(false);
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5);
      setTxs(data || []);
    };
    fetch();
    const sub = supabase.channel('tx-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [user]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-800">Recent Transactions</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {txs.length > 0 ? txs.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between px-6 py-3">
            <div>
              <p className="text-xs font-mono text-gray-600 truncate max-w-[140px]">{tx.tx_hash}</p>
              <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">${Number(tx.amount).toLocaleString()}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tx.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {tx.status}
              </span>
            </div>
          </div>
        )) : (
          <p className="px-6 py-8 text-center text-xs text-gray-400">No transactions yet.</p>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
