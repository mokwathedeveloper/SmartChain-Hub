import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';

const BlockchainTransactionsWidget = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
      
      // Subscribe to real-time updates for transactions
      const subscription = supabase
        .channel('public:transactions')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('Real-time update:', payload);
          fetchTransactions(); // Refresh list on change
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user]);

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
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-1/3 mb-8"></div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between">
              <div className="h-10 w-10 bg-gray-100 rounded-full"></div>
              <div className="flex-1 ml-4 h-10 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Recent Transactions</h2>
        <button className="text-blue-600 font-semibold text-sm hover:underline">View All</button>
      </div>
      
      <div className="space-y-6">
        {transactions.length > 0 ? (
          transactions.map((tx, index) => (
            <div key={tx.id} className="flex items-center justify-between group">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                  tx.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {tx.status === 'confirmed' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-800 font-mono text-sm">{tx.tx_hash}</p>
                  <p className="text-xs text-gray-400">{getTimeAgo(tx.created_at)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">${tx.amount.toLocaleString()}</p>
                <p className={`text-xs font-bold uppercase ${
                  tx.status === 'confirmed' ? 'text-green-500' : 'text-yellow-500'
                }`}>{tx.status}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No transactions yet.</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Network Status</span>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span className="text-gray-700 font-medium">0G Chain Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainTransactionsWidget;
