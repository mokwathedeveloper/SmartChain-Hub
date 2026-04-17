import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';

const RevenueSharingWidget = () => {
  const { user } = useAuth();
  const [revenue, setRevenue] = useState<{ total_platform_revenue: number; user_share: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRevenue();
    }
  }, [user]);

  const fetchRevenue = async () => {
    try {
      const { data, error } = await supabase
        .from('revenue_shares')
        .select('total_platform_revenue, user_share')
        .eq('user_id', user?.id)
        .eq('claimed', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setRevenue(data[0]);
      } else {
        setRevenue({ total_platform_revenue: 0, user_share: 0 });
      }
    } catch (error) {
      console.error("Error fetching revenue:", error);
      setRevenue({ total_platform_revenue: 0, user_share: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!user || !revenue || revenue.user_share <= 0) return;
    setClaiming(true);
    
    try {
      // 1. Mark shares as claimed
      const { error: updateError } = await supabase
        .from('revenue_shares')
        .update({ claimed: true })
        .eq('user_id', user.id)
        .eq('claimed', false);

      if (updateError) throw updateError;

      // 2. Update user profile balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();
      
      const newBalance = (profile?.balance || 0) + revenue.user_share;

      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      alert(`Successfully claimed $${revenue.user_share}!`);
      setRevenue({ total_platform_revenue: 0, user_share: 0 });
    } catch (error: any) {
      alert(`Error claiming revenue: ${error.message}`);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full animate-pulse"></div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Revenue Sharing</h2>
      
      <div className="bg-indigo-50 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-indigo-600 font-semibold text-sm uppercase">Your Earnings</p>
          <span className="text-indigo-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </div>
        <p className="text-4xl font-extrabold text-indigo-900">${revenue?.user_share?.toFixed(2) || '0.00'}</p>
        <p className="text-indigo-400 text-sm mt-2">from ${revenue?.total_platform_revenue?.toLocaleString() || '0'} total platform revenue</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-400 font-medium uppercase mb-1">Next Drop</p>
          <p className="font-bold text-gray-800">Every 24h</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-400 font-medium uppercase mb-1">Share Rate</p>
          <p className="font-bold text-gray-800">10.0%</p>
        </div>
      </div>
      
      <button 
        onClick={handleClaim}
        disabled={claiming || !revenue || revenue.user_share <= 0}
        className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 ${
          claiming || !revenue || revenue.user_share <= 0 ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {claiming ? 'Claiming...' : 'Claim Earnings'}
      </button>
      
      <p className="text-center text-xs text-gray-400 mt-4 italic">
        Earnings are distributed automatically via smart contracts.
      </p>
    </div>
  );
};

export default RevenueSharingWidget;
