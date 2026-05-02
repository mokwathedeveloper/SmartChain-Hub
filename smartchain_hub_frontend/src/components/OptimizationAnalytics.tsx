import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';

const OptimizationAnalytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSavings: 0,
    avgSavingsRate: 0,
    totalVolume: 0,
    topRoute: 'N/A',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAnalytics();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, savings, route')
        .eq('user_id', user?.id);
      if (error) throw error;
      if (data && data.length > 0) {
        const totalSavings = data.reduce((a, c) => a + (Number(c.savings) || 0), 0);
        const totalVolume  = data.reduce((a, c) => a + (Number(c.amount)  || 0), 0);
        const avgSavingsRate = totalVolume > 0 ? (totalSavings / totalVolume) * 100 : 0;
        const routes = data.map(d => d.route);
        const topRoute = routes.sort((a, b) =>
          routes.filter(v => v === a).length - routes.filter(v => v === b).length
        ).pop() || 'N/A';
        setStats({ totalSavings, avgSavingsRate, totalVolume, topRoute });
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-800 rounded-2xl" />;

  const statCards = [
    {
      label: 'Total Volume',
      value: `$${stats.totalVolume.toLocaleString()}`,
      sub: 'Lifetime activity',
      accent: 'card-blue',
      textAccent: 'text-blue-400',
      icon: (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      label: 'Gas Fees Saved',
      value: `$${stats.totalSavings.toFixed(2)}`,
      sub: `+${stats.avgSavingsRate.toFixed(1)}% avg efficiency`,
      accent: 'card-green',
      textAccent: 'text-green-400',
      icon: (
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Active AI Agent',
      value: 'Efficiency',
      sub: 'Running on 0G Compute',
      accent: 'card-indigo',
      textAccent: 'text-indigo-400',
      icon: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
        </svg>
      ),
    },
    {
      label: 'Optimal Route',
      value: stats.topRoute,
      sub: 'Most frequent success',
      accent: 'card-purple',
      textAccent: 'text-purple-400',
      icon: (
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="card p-6 sm:p-8">
      <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        AI Performance Analytics
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className={`${card.accent} p-5 rounded-2xl hover:scale-[1.02] transition-transform`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{card.label}</p>
              {card.icon}
            </div>
            <p className={`text-2xl font-black ${card.textAccent} truncate`}>{card.value}</p>
            <p className="text-xs text-gray-600 mt-1.5">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Savings projection */}
        <div className="card p-5">
          <h4 className="text-sm font-bold text-white mb-4">Savings Projection</h4>
          <div className="flex items-center justify-between mb-2">
            <span className="badge-chain">Current Target</span>
            <span className="text-xs font-semibold text-blue-400">75%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }} />
          </div>
          <p className="text-xs text-gray-500 text-center">
            On track to save $1,200 this year based on your activity.
          </p>
        </div>

        {/* Decentralization score */}
        <div className="card p-5 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Decentralization Score</h4>
            <p className="text-xs text-gray-500">How distributed are your transactions?</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center shrink-0">
            <span className="text-green-400 font-black text-sm">9.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationAnalytics;
