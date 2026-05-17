import Head from "next/head";
import { errMsg } from "@/utils/errors";
import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useWeb3 } from "@/context/Web3Context";
import { useNotification } from "@/context/NotificationContext";
import { ethers } from "ethers";

const CLAIM_ABI = ["function claimEarnings() external", "function pendingEarnings(address) external view returns (uint256)"];
const OG_NETWORK = ethers.Network.from({ chainId: 16602, name: 'og-galileo' });
const OG_RPC = 'https://evmrpc-testnet.0g.ai';
const READ_PROVIDER = typeof window !== 'undefined'
  ? new ethers.JsonRpcProvider(OG_RPC, OG_NETWORK, { staticNetwork: OG_NETWORK })
  : null;

const DonutChart = ({ pct }: { pct: number }) => {
  const r = 70, cx = 100, cy = 100, circ = 2 * Math.PI * r;
  const segments = [
    { p: pct / 100, color: '#3B82F6' },
    { p: 0.18, color: '#8B5CF6' },
    { p: 0.12, color: '#22C55E' },
    { p: 0.10, color: '#EAB308' },
  ];
  const total = segments.reduce((s, x) => s + x.p, 0);
  segments.push({ p: Math.max(0, 1 - total), color: '#374151' });
  let offset = 0;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8 w-full">
      {/* SVG fills its container — max 180px on mobile, 200px on desktop */}
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 shrink-0">
        <svg viewBox="0 0 200 200" className="w-full h-full">
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
          <span className="text-xl font-bold text-white">{pct.toFixed(1)}%</span>
        </div>
      </div>
      <div className="space-y-3">
        {[['Your Share','bg-blue-500'],['Partners','bg-purple-500'],['Staking Rewards','bg-green-500'],['Network Fees','bg-yellow-400']].map(([l,c]) => (
          <div key={l} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full shrink-0 ${c}`}/><span className="text-sm text-gray-500">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Revenue() {
  const { user } = useAuth(false); // false = don't redirect if no session
  const { signer, isConnected, address } = useWeb3();
  const { addNotification } = useNotification();
  const [shares, setShares] = useState<any[]>([]);
  const [unclaimed, setUnclaimed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [onChainEarnings, setOnChainEarnings] = useState("0");
  const [onChainStake, setOnChainStake] = useState("0");
  const [onChainReward, setOnChainReward] = useState("0");

  // Fetch on-chain pending earnings, stake and reward
  useEffect(() => {
    if (!address) return;
    const contractAddr = process.env.NEXT_PUBLIC_PAYMENTS_CONTRACT;
    if (!contractAddr || !READ_PROVIDER) return;
    const STAKE_ABI = [
      'function claimEarnings() external',
      'function pendingEarnings(address) external view returns (uint256)',
      'function getStake(address user) external view returns (uint256 amount, uint256 reward)',
    ];
    const c = new ethers.Contract(contractAddr, STAKE_ABI, READ_PROVIDER);
    c.pendingEarnings(address).then((v: bigint) => setOnChainEarnings(ethers.formatEther(v))).catch(() => {});
    c.getStake(address).then(([amt, rew]: [bigint, bigint]) => {
      setOnChainStake(ethers.formatEther(amt));
      setOnChainReward(ethers.formatEther(rew));
    }).catch(() => {});
  }, [address]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetchRevenue();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRevenue = async () => {
    if (!user) return;
    const { data } = await supabase.from('revenue_shares').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    const all = data || [];
    setShares(all);
    setUnclaimed(all.filter(r => !r.claimed));
    setLoading(false);
  };

  const totalPool = shares.reduce((s, r) => s + Number(r.total_platform_revenue || 0), 0);
  const yourShare = shares.reduce((s, r) => s + Number(r.user_share || 0), 0);
  const unclaimedAmt = unclaimed.reduce((s, r) => s + Number(r.user_share || 0), 0);
  const sharePct = totalPool > 0 ? (yourShare / totalPool) * 100 : 22.8;

  const handleClaim = async () => {
    setClaiming(true);
    try {
      if (isConnected && signer && process.env.NEXT_PUBLIC_PAYMENTS_CONTRACT) {
        const c = new ethers.Contract(process.env.NEXT_PUBLIC_PAYMENTS_CONTRACT, CLAIM_ABI, signer);
        const tx = await c.claimEarnings();
        await tx.wait();
        setOnChainEarnings("0");
        addNotification('Earnings claimed successfully ✓', 'success');
      }
      if (user && unclaimedAmt > 0) {
        await supabase.from('revenue_shares').update({ claimed: true }).eq('user_id', user.id).eq('claimed', false);
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
        await supabase.from('profiles').update({ balance: (profile?.balance || 0) + unclaimedAmt }).eq('id', user.id);
        fetchRevenue();
      }
    } catch (e: unknown) {
      addNotification(`Claim failed: ${errMsg(e)}`, 'error');
    } finally { setClaiming(false); }
  };

  const nextPayout = new Date(); nextPayout.setDate(nextPayout.getDate() + 7);

  return (
    <>
      <Head><title>Revenue Sharing | SmartChain Hub</title></Head>
      <div className="space-y-6">
        {/* On-chain stats — always visible when wallet connected */}
        {address && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-2xl p-6">
              <p className="text-xs text-gray-500 mb-1">Claimable Earnings (On-chain)</p>
              <span className="text-3xl font-bold text-emerald-400">{parseFloat(onChainEarnings).toFixed(6)} A0GI</span>
              <p className="text-xs text-gray-600 mt-1">Claim via Payments → Withdraw</p>
            </div>
            <div className="bg-blue-500/[0.06] border border-blue-500/20 rounded-2xl p-6">
              <p className="text-xs text-gray-500 mb-1">Your Stake (On-chain)</p>
              <span className="text-3xl font-bold text-blue-400">{parseFloat(onChainStake).toFixed(6)} A0GI</span>
              <p className="text-xs text-gray-600 mt-1">5% APY · Earning rewards</p>
            </div>
            <div className="bg-purple-500/[0.06] border border-purple-500/20 rounded-2xl p-6">
              <p className="text-xs text-gray-500 mb-1">Staking Reward (On-chain)</p>
              <span className="text-3xl font-bold text-purple-400">{parseFloat(onChainReward).toFixed(9)} A0GI</span>
              <p className="text-xs text-gray-600 mt-1">Accruing continuously</p>
            </div>
          </div>
        )}

        {/* Supabase revenue records */}
        <div className="flex gap-6 border-b border-gray-700">
          <button className="pb-3 text-sm font-semibold text-blue-600 border-b-2 border-blue-600">Total Pool</button>
          <span className="pb-3 text-sm text-gray-500">${totalPool.toLocaleString()}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Total Revenue Share</p>
            <span className="text-3xl font-bold text-white">{loading ? '—' : `$${totalPool.toLocaleString()}`}</span>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Your Share</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{loading ? '—' : `$${yourShare.toFixed(2)}`}</span>
              {unclaimedAmt > 0 && <span className="text-sm text-green-500 font-medium mb-0.5">+${unclaimedAmt.toFixed(2)} unclaimed</span>}
            </div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Next Payout</p>
            <span className="text-3xl font-bold text-white">{nextPayout.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <DonutChart pct={sharePct} />
            {(unclaimedAmt > 0 || parseFloat(onChainEarnings) > 0) && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Available to claim</p>
                <p className="text-3xl font-bold text-white mb-1">
                  {parseFloat(onChainEarnings) > 0 ? `${parseFloat(onChainEarnings).toFixed(6)} A0GI` : `$${unclaimedAmt.toFixed(2)}`}
                </p>
                {parseFloat(onChainEarnings) > 0 && <p className="text-xs text-gray-500 mb-4">on-chain claimable</p>}
                <button onClick={handleClaim} disabled={claiming || (!isConnected && unclaimedAmt <= 0)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {claiming ? 'Claiming...' : `Claim Now`}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h2 className="text-base font-bold text-white">Recent Payouts</h2>
          </div>
          <div className="overflow-x-auto"><table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800">
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-left font-medium">Amount</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {shares.length > 0 ? shares.map((r, i) => (
                <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-200">{new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">${Number(r.user_share).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.claimed ? 'bg-gray-800 text-gray-500' : 'bg-green-500/10 text-green-400'}`}>
                      {r.claimed ? 'Claimed' : `$${Number(r.user_share).toFixed(2)}`}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500">{loading ? 'Loading...' : 'No revenue records yet.'}</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </>
  );
}
