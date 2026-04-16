import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';

const HeroSection = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string; balance: number } | null>(null);
  const [stats, setStats] = useState({ optimizedToday: 0, pendingTransactions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileAndStats();
    }
  }, [user]);

  const fetchProfileAndStats = async () => {
    setLoading(true);
    try {
      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, balance')
        .eq('id', user?.id)
        .single();
      
      if (profileData) setProfile(profileData);

      // Fetch Stats (Transactions)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: optimizedToday } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .gte('created_at', today.toISOString());

      const { count: pendingTransactions } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'pending');

      setStats({
        optimizedToday: optimizedToday || 0,
        pendingTransactions: pendingTransactions || 0
      });
    } catch (error) {
      console.error("Error fetching hero stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <section className="hero bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white py-16 px-4">
        <div className="container mx-auto animate-pulse">
          <div className="h-10 bg-white/20 rounded w-1/4 mb-4"></div>
          <div className="h-6 bg-white/20 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-24 bg-white/10 rounded-xl"></div>
            <div className="h-24 bg-white/10 rounded-xl"></div>
            <div className="h-24 bg-white/10 rounded-xl"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white py-16 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto md:mx-0">
            Optimize your digital commerce transactions with AI-driven intelligence and secure them on the 0G Chain.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <p className="text-blue-200 text-sm font-medium uppercase tracking-wider mb-1">Current Balance</p>
              <p className="text-3xl font-bold">${profile?.balance?.toLocaleString() || '0.00'}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <p className="text-blue-200 text-sm font-medium uppercase tracking-wider mb-1">Optimized Today</p>
              <p className="text-3xl font-bold">{stats.optimizedToday}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <p className="text-blue-200 text-sm font-medium uppercase tracking-wider mb-1">Pending Txns</p>
              <p className="text-3xl font-bold">{stats.pendingTransactions}</p>
            </div>
          </div>
          
          <button className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-xl">
            Start New Optimization
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
