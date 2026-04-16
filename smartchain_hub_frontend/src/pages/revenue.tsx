import Head from "next/head";
import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/hooks/useAuth";

const DonutChart = ({ pct }: { pct: number }) => {
  const r = 70, cx = 100, cy = 100, circ = 2 * Math.PI * r;
  const segments = [
    { p: pct / 100, color: '#3B82F6' },
    { p: 0.18, color: '#8B5CF6' },
    { p: 0.12, color: '#22C55E' },
    { p: 0.10, color: '#EAB308' },
  ];
  const total = segments.reduce((s, x) => s + x.p, 0);
  segments.push({ p: Math.max(0, 1 - total), color: '#E5E7EB' });
  let offset = 0;
  return (
    <div className="flex items-center gap-8">
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {segments.map((seg, i) => {
            const da = seg.p * circ;
            const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth="28"
              strokeDasharray={`${da} ${circ - da}`} strokeDashoffset={circ - offset * circ}
              transform={`rotate(-90 ${cx} ${cy})`}/>;
            offset += seg.p;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-500">Your Share</span>
          <span className="text-xl font-bold text-gray-800">{pct.toFixed(1)}%</span>
        </div>
      </div>
      <div className="space-y-3">
        {[['Your Share','bg-blue-500'],['Partners','bg-purple-500'],['Staking Rewards','bg-green-500'],['Network Fees','bg-yellow-400']].map(([l,c]) => (
          <div key={l} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${c}`}/><span className="text-sm text-gray-600">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Revenue() {
  const { user } = useAuth();
  const [shares, setShares] = useState<any[]>([]);
  const [unclaimed, setUnclaimed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const fetchRevenue = async () => {
    if (!user) return;
    const { data } = await supabase.from('revenue_shares').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    const all = data || [];
    setShares(all);
    setUnclaimed(all.filter(r => !r.claimed));
    setLoading(false);
  };

  useEffect(() => { fetchRevenue(); }, [user]);

  const totalPool = shares.reduce((s, r) => s + Number(r.total_platform_revenue || 0), 0);
  const yourShare = shares.reduce((s, r) => s + Number(r.user_share || 0), 0);
  const unclaimedAmt = unclaimed.reduce((s, r) => s + Number(r.user_share || 0), 0);
  const sharePct = totalPool > 0 ? (yourShare / totalPool) * 100 : 22.8;

  const handleClaim = async () => {
    if (!user || unclaimedAmt <= 0) return;
    setClaiming(true);
    const { error } = await supabase.from('revenue_shares').update({ claimed: true }).eq('user_id', user.id).eq('claimed', false);
    if (!error) {
      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
      await supabase.from('profiles').update({ balance: (profile?.balance || 0) + unclaimedAmt }).eq('id', user.id);
      fetchRevenue();
    }
    setClaiming(false);
  };

  const nextPayout = new Date(); nextPayout.setDate(nextPayout.getDate() + 7);

  return (
    <>
      <Head><title>Revenue Sharing | PayOptimize</title></Head>
      <div className="space-y-6">
        <div className="flex gap-6 border-b border-gray-200">
          <button className="pb-3 text-sm font-semibold text-blue-600 border-b-2 border-blue-600">Total Pool</button>
          <span className="pb-3 text-sm text-gray-500">${totalPool.toLocaleString()}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Total Revenue Share</p>
            <span className="text-3xl font-bold text-gray-800">{loading ? '—' : `$${totalPool.toLocaleString()}`}</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Your Share</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-800">{loading ? '—' : `$${yourShare.toFixed(2)}`}</span>
              {unclaimedAmt > 0 && <span className="text-sm text-green-500 font-medium mb-0.5">+${unclaimedAmt.toFixed(2)} unclaimed</span>}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Next Payout</p>
            <span className="text-3xl font-bold text-gray-800">{nextPayout.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <DonutChart pct={sharePct} />
            {unclaimedAmt > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Available to claim</p>
                <p className="text-3xl font-bold text-gray-800 mb-4">${unclaimedAmt.toFixed(2)}</p>
                <button onClick={handleClaim} disabled={claiming}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {claiming ? 'Claiming...' : 'Claim Now'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Recent Payouts</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-50">
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-left font-medium">Amount</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {shares.length > 0 ? shares.map((r, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">{new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">${Number(r.user_share).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.claimed ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-600'}`}>
                      {r.claimed ? 'Claimed' : `$${Number(r.user_share).toFixed(2)}`}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-400">{loading ? 'Loading...' : 'No revenue records yet.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
