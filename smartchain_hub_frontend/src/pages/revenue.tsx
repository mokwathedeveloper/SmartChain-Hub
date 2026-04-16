import Head from "next/head";
import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/hooks/useAuth";

const RevenuePage = () => {
  const { user } = useAuth();
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRevenueHistory();
    }
  }, [user]);

  const fetchRevenueHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('revenue_shares')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setRevenueData(data || []);
    } catch (error) {
      console.error("Error fetching revenue history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Simple SVG Chart Component
  const RevenueChart = () => {
    const points = revenueData.map((d, i) => `${(i / (revenueData.length - 1)) * 100},${100 - (d.user_share / 100) * 100}`).join(' ');
    
    return (
      <div className="h-64 w-full bg-gray-50 rounded-3xl relative overflow-hidden p-8 border border-gray-100 shadow-inner">
        {revenueData.length > 1 ? (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <polyline
              fill="none"
              stroke="#9B4DFF"
              strokeWidth="2"
              points={points}
              className="animate-fade-in"
            />
            {/* Gradient Area */}
            <path
              d={`M0,100 L${points} L100,100 Z`}
              fill="url(#grad)"
              className="opacity-20"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#9B4DFF', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#9B4DFF', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
          </svg>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 font-bold text-sm italic">
            Insufficient data to generate chart. Complete more transactions.
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Revenue Analytics | SmartChain Hub</title>
      </Head>

      <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-10 border border-gray-50">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-black text-deep-blue tracking-tight">Earnings Growth</h2>
                <p className="text-sm text-gray-400 font-bold">Your cumulative revenue share performance.</p>
              </div>
              <div className="flex space-x-2">
                {['1W', '1M', '1Y', 'ALL'].map(t => (
                  <button key={t} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${t === 'ALL' ? 'bg-deep-blue text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{t}</button>
                ))}
              </div>
            </div>
            <RevenueChart />
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-electric-purple to-purple-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-electric-purple/20">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Total Earnings</p>
              <h3 className="text-5xl font-black mb-6 tracking-tighter">
                ${revenueData.reduce((acc, curr) => acc + (Number(curr.user_share) || 0), 0).toFixed(2)}
              </h3>
              <button className="w-full py-4 bg-white text-electric-purple font-black rounded-2xl shadow-xl hover:scale-105 transition-all">Claim Now</button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-lg shadow-gray-200/30">
              <h4 className="font-black text-deep-blue mb-6">Distribution Summary</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-sm text-gray-400 font-bold">Base Rate</span>
                  <span className="text-sm text-deep-blue font-black">10.0%</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-sm text-gray-400 font-bold">AI Multiplier</span>
                  <span className="text-sm text-green-500 font-black">x1.2</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-gray-400 font-bold">Network Status</span>
                  <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-lg font-black uppercase">Newton Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-lg border border-gray-50 overflow-hidden">
          <div className="p-10 border-b border-gray-50">
            <h3 className="text-xl font-black text-deep-blue">Earnings History</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-10 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-10 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Rev</th>
                <th className="px-10 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Share</th>
                <th className="px-10 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {revenueData.length > 0 ? [...revenueData].reverse().map((rev) => (
                <tr key={rev.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-10 py-6 text-sm text-gray-600 font-medium">{new Date(rev.created_at).toLocaleDateString()}</td>
                  <td className="px-10 py-6 text-sm text-deep-blue font-black">${Number(rev.total_platform_revenue).toLocaleString()}</td>
                  <td className="px-10 py-6 text-sm text-electric-purple font-black">${Number(rev.user_share).toFixed(2)}</td>
                  <td className="px-10 py-6 text-right">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${rev.claimed ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-600'}`}>
                      {rev.claimed ? 'Claimed' : 'Pending'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center text-gray-400 font-bold italic">No revenue records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default RevenuePage;
