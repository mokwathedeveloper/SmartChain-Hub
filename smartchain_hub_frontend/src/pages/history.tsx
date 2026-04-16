import Head from "next/head";
import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/hooks/useAuth";

const HistoryPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearch_term] = useState("");

  useEffect(() => {
    if (user) {
      fetchFullHistory();
    }
  }, [user]);

  const fetchFullHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.tx_hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Transaction History | SmartChain Hub</title>
      </Head>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-50 overflow-hidden animate-fade-in">
        <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-deep-blue tracking-tight">On-Chain Activity</h2>
            <p className="text-sm text-gray-400 font-bold">Verifiable records of all AI-optimized commerce.</p>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input 
              type="text"
              placeholder="Search by hash or route..."
              className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-electric-purple outline-none transition-all w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearch_term(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-10 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction Hash</th>
                <th className="px-10 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-10 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Savings</th>
                <th className="px-10 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Route</th>
                <th className="px-10 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
                <tr key={tx.id} className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                  <td className="px-10 py-6">
                    <p className="text-sm font-mono text-electric-purple font-bold truncate max-w-[150px]">{tx.tx_hash}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{new Date(tx.created_at).toLocaleString()}</p>
                  </td>
                  <td className="px-10 py-6 text-sm text-deep-blue font-black">${Number(tx.amount).toLocaleString()}</td>
                  <td className="px-10 py-6">
                    <span className="text-sm text-green-500 font-bold">${Number(tx.savings).toFixed(2)}</span>
                  </td>
                  <td className="px-10 py-6 text-sm text-gray-500 font-medium">{tx.route}</td>
                  <td className="px-10 py-6 text-right">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      tx.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center text-gray-400 font-bold italic">
                    {loading ? "Syncing with blockchain..." : "No transactions found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex justify-between items-center">
          <p className="text-xs text-gray-400 font-bold">Showing {filteredTransactions.length} of {transactions.length} records</p>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-400 cursor-not-allowed">Previous</button>
            <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-deep-blue shadow-sm hover:bg-gray-50 transition-all">Next</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoryPage;
