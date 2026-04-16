import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';
import Tooltip from './Tooltip';

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
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, balance')
        .eq('id', user?.id)
        .single();
      
      if (profileData) setProfile(profileData);

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
      <section className="bg-deep-blue text-white py-16 px-4 rounded-[2.5rem] mb-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-electric-purple/10 rounded-full blur-3xl"></div>
        <div className="container mx-auto animate-pulse relative z-10">
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
    <section className="bg-deep-blue text-white py-16 px-10 rounded-[3rem] mb-12 shadow-2xl shadow-deep-blue/20 overflow-hidden relative">
      {/* Visual background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-electric-purple/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -ml-32 -mb-32"></div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-black mb-6 animate-fade-in tracking-tighter">
            Welcome back, <span className="text-electric-purple">{profile?.full_name?.split(' ')[0] || 'User'}</span>!
          </h1>
          <p className="text-xl text-blue-100/80 mb-10 max-w-2xl font-medium leading-relaxed">
            Optimize your digital commerce transactions with{' '}
            <Tooltip text="Our TensorFlow neural network that predicts the best route for your funds.">
              <span className="border-b border-electric-purple/50 border-dotted cursor-help text-white">AI-driven intelligence</span>
            </Tooltip>{' '}
            and secure them on the{' '}
            <Tooltip text="A modular blockchain designed for high-performance AI and decentralized storage.">
              <span className="border-b border-electric-purple/50 border-dotted cursor-help text-white">0G Chain</span>
            </Tooltip>.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="glass-dark rounded-3xl p-8 border border-white/5 group hover:border-white/10 transition-all">
              <p className="text-blue-300/60 text-[10px] font-black uppercase tracking-widest mb-2">Available Balance</p>
              <p className="text-3xl font-black tracking-tight">${profile?.balance?.toLocaleString() || '0.00'}</p>
            </div>
            <div className="glass-dark rounded-3xl p-8 border border-white/5 group hover:border-white/10 transition-all">
              <p className="text-blue-300/60 text-[10px] font-black uppercase tracking-widest mb-2">Optimized (24h)</p>
              <p className="text-3xl font-black tracking-tight">{stats.optimizedToday}</p>
            </div>
            <div className="glass-dark rounded-3xl p-8 border border-white/5 group hover:border-white/10 transition-all">
              <p className="text-blue-300/60 text-[10px] font-black uppercase tracking-widest mb-2">Network Status</p>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-xl font-black tracking-tight text-green-400">0G LIVE</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button className="px-8 py-4 bg-electric-purple hover:bg-purple-600 text-white font-black rounded-2xl transition-all transform hover:scale-105 shadow-xl shadow-electric-purple/20">
              New Optimization
            </button>
            <button className="px-8 py-4 glass-dark border-white/10 hover:bg-white/5 text-white font-black rounded-2xl transition-all">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
