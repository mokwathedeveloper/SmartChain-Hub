import { useEffect, useState } from 'react';
import { errMsg } from '@/utils/errors';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/context/NotificationContext';

const RevenueSharingWidget = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [revenue, setRevenue] = useState<{ total_platform_revenue: number; user_share: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (user) fetchRevenue();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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
      setRevenue(data?.[0] ?? { total_platform_revenue: 0, user_share: 0 });
    } catch (err) {
      console.error('Error fetching revenue:', err);
      setRevenue({ total_platform_revenue: 0, user_share: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!user || !revenue || revenue.user_share <= 0) return;
    setClaiming(true);
    try {
      const { error: updateError } = await supabase
        .from('revenue_shares')
        .update({ claimed: true })
        .eq('user_id', user.id)
        .eq('claimed', false);
      if (updateError) throw updateError;

      const { data: profile } = await supabase
        .from('profiles').select('balance').eq('id', user.id).single();
      await supabase
        .from('profiles')
        .update({ balance: (profile?.balance || 0) + revenue.user_share })
        .eq('id', user.id);

      addNotification(`Claimed $${revenue.user_share.toFixed(2)} ✓`, 'success');
      setRevenue({ total_platform_revenue: 0, user_share: 0 });
    } catch (err: unknown) {
      addNotification(`Claim failed: ${errMsg(err)}`, 'error');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return <div className="card p-6 h-full animate-pulse" />;

  const hasFunds = revenue && revenue.user_share > 0;

  return (
    <div className="card p-6 h-full">
      <h2 className="text-base font-bold text-white mb-5">Revenue Sharing</h2>

      {/* Earnings panel */}
      <div className="card-indigo p-5 rounded-2xl mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Your Earnings</p>
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-3xl font-black text-white">${revenue?.user_share?.toFixed(2) ?? '0.00'}</p>
        <p className="text-xs text-gray-500 mt-1.5">
          from ${revenue?.total_platform_revenue?.toLocaleString() ?? '0'} total platform revenue
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-gray-800/50 rounded-xl p-3.5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Next Drop</p>
          <p className="text-sm font-bold text-white">Every 24h</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3.5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Share Rate</p>
          <p className="text-sm font-bold text-white">10.0%</p>
        </div>
      </div>

      {/* Claim button */}
      <button
        onClick={handleClaim}
        disabled={claiming || !hasFunds}
        className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-all ${
          hasFunds
            ? 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-[0.98]'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
        } disabled:opacity-60`}
      >
        {claiming ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Claiming...
          </span>
        ) : hasFunds ? `Claim $${revenue!.user_share.toFixed(2)}` : 'No Earnings Yet'}
      </button>

      <p className="text-center text-xs text-gray-600 mt-3">
        Distributed automatically via SmartChainRevenue contract.
      </p>
    </div>
  );
};

export default RevenueSharingWidget;
