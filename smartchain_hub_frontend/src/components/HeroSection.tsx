import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';
import Tooltip from './Tooltip';

const HeroSection = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string; balance: number } | null>(null);
  const [stats, setStats] = useState({ optimizedToday: 0, pendingTransactions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchProfileAndStats = async () => {
      setLoading(true);
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, balance')
          .eq('id', user.id)
          .single();

        if (profileData) setProfile(profileData);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count: optimizedToday } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString());

        const { count: pendingTransactions } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'pending');

        setStats({
          optimizedToday: optimizedToday || 0,
          pendingTransactions: pendingTransactions || 0,
        });
      } catch (error) {
        console.error("Error fetching hero stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndStats();
  }, [user]);

  if (authLoading || loading) {
    return (
      <section className="relative overflow-hidden rounded-2xl mb-6 bg-gray-900 border border-gray-800 p-7 sm:p-10">
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/8 rounded-full blur-3xl -mr-24 -mt-24" />
        </div>
        <div className="relative animate-pulse">
          <div className="h-4 w-32 bg-gray-800 rounded-full mb-3" />
          <div className="h-9 w-64 bg-gray-800 rounded-xl mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-800/60 rounded-2xl" />)}
          </div>
        </div>
      </section>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Agent';

  return (
    <section className="relative overflow-hidden rounded-2xl mb-6 border border-gray-800">
      {/* Gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-blue-950/40" />

      {/* Ambient glow orbs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-56 h-56 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-purple-500/6 rounded-full blur-2xl pointer-events-none" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="relative px-6 sm:px-8 py-7 sm:py-10">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">0G Galileo Testnet</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              Welcome back,{' '}
              <span className="text-gradient">{firstName}</span>!
            </h1>
            <p className="mt-2 text-sm text-gray-500 max-w-md leading-relaxed">
              Your{' '}
              <Tooltip text="Our TensorFlow neural network that predicts the best route for your funds.">
                <span className="border-b border-blue-500/40 border-dotted cursor-help text-gray-400">AI agent</span>
              </Tooltip>{' '}
              is live on{' '}
              <Tooltip text="A modular blockchain designed for high-performance AI and decentralized storage.">
                <span className="border-b border-blue-500/40 border-dotted cursor-help text-gray-400">0G Chain</span>
              </Tooltip>.
            </p>
          </div>

          {/* Network live badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-green-500/8 border border-green-500/20 rounded-xl shrink-0 self-start">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-green-400 tracking-wide">0G LIVE</span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-7">
          {/* Balance */}
          <div className="group relative overflow-hidden bg-blue-500/[0.07] border border-blue-500/20 rounded-2xl p-5 transition-all duration-300 hover:border-blue-500/40 hover:bg-blue-500/[0.1]">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/5 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-blue-400/70 uppercase tracking-widest">Available Balance</p>
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-white tabular-nums">
              ${profile?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </p>
            <p className="text-xs text-blue-400/50 mt-1 font-medium">Platform balance</p>
          </div>

          {/* Optimized today */}
          <div className="group relative overflow-hidden bg-purple-500/[0.07] border border-purple-500/20 rounded-2xl p-5 transition-all duration-300 hover:border-purple-500/40 hover:bg-purple-500/[0.1]">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/5 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-purple-400/70 uppercase tracking-widest">Optimized Today</p>
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-white tabular-nums">{stats.optimizedToday}</p>
            <p className="text-xs text-purple-400/50 mt-1 font-medium">Transactions today</p>
          </div>

          {/* Network status */}
          <div className="group relative overflow-hidden bg-green-500/[0.07] border border-green-500/20 rounded-2xl p-5 transition-all duration-300 hover:border-green-500/40 hover:bg-green-500/[0.1]">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/5 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-green-400/70 uppercase tracking-widest">Network Status</p>
              <div className="w-7 h-7 rounded-lg bg-green-500/15 border border-green-500/20 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse shrink-0" />
              <p className="text-3xl font-black text-green-400">LIVE</p>
            </div>
            <p className="text-xs text-green-400/50 mt-1 font-medium">Chain ID 16602</p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-3">
          <Link href="/transactions"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-px">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            New Optimization
          </Link>
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all text-sm hover:-translate-y-px">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            View Analytics
          </Link>
          {stats.pendingTransactions > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500/8 border border-yellow-500/20 rounded-xl text-sm text-yellow-400 font-medium">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
              {stats.pendingTransactions} pending
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
