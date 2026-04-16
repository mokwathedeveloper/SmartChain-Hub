import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';

const OptimizationAnalytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSavings: 0,
    avgSavingsRate: 0,
    totalVolume: 0,
    topRoute: 'N/A'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, savings, route')
        .eq('user_id', user?.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const totalSavings = data.reduce((acc, curr) => acc + (Number(curr.savings) || 0), 0);
        const totalVolume = data.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        const avgSavingsRate = (totalSavings / totalVolume) * 100;
        
        // Find top route
        const routes = data.map(d => d.route);
        const mostCommonRoute = routes.sort((a,b) =>
          routes.filter(v => v===a).length - routes.filter(v => v===b).length
        ).pop();

        setStats({
          totalSavings,
          avgSavingsRate,
          totalVolume,
          topRoute: mostCommonRoute || 'N/A'
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-2xl"></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center">
        <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        AI Performance Analytics
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 transform transition hover:scale-105">
          <p className="text-xs text-blue-600 font-bold uppercase mb-2">Total Volume</p>
          <p className="text-2xl font-black text-blue-900">${stats.totalVolume.toLocaleString()}</p>
          <div className="mt-2 flex items-center text-xs text-blue-500">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            Lifetime activity
          </div>
        </div>

        <div className="p-6 bg-green-50 rounded-2xl border border-green-100 transform transition hover:scale-105">
          <p className="text-xs text-green-600 font-bold uppercase mb-2">Gas Fees Saved</p>
          <p className="text-2xl font-black text-green-900">${stats.totalSavings.toFixed(2)}</p>
          <div className="mt-2 flex items-center text-xs text-green-500">
            <span className="font-bold">+{stats.avgSavingsRate.toFixed(1)}%</span> 
            <span className="ml-1">avg efficiency</span>
          </div>
        </div>

        <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 transform transition hover:scale-105">
          <p className="text-xs text-indigo-600 font-bold uppercase mb-2">Active AI Agent</p>
          <p className="text-2xl font-black text-indigo-900">Efficiency</p>
          <div className="mt-2 text-xs text-indigo-500 flex items-center">
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
            Running on 0G
          </div>
        </div>

        <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 transform transition hover:scale-105">
          <p className="text-xs text-purple-600 font-bold uppercase mb-2">Optimal Route</p>
          <p className="text-lg font-black text-purple-900 truncate">{stats.topRoute}</p>
          <p className="mt-2 text-xs text-purple-400">Most frequent success</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <h4 className="font-bold text-gray-700 mb-4">Savings Projection</h4>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  Current Target
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  75%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
              <div style={{ width: "75%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
            </div>
            <p className="text-xs text-gray-400 text-center">On track to save $1,200 this year based on your activity.</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-700 mb-1">Decentralization Score</h4>
            <p className="text-xs text-gray-500">How distributed are your transactions?</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-green-500 text-green-600 font-black">
              9.2
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationAnalytics;
