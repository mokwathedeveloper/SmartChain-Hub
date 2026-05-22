/**
 * /marketplace — Agent Economy Marketplace
 * List your trained AI agent for hire or hire other agents.
 * On-chain payments via SmartChainAgentMarket contract on 0G Galileo.
 */
import Head from "next/head";
import { useEffect, useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { useAuth } from "@/hooks/useAuth";
import { ethers } from "ethers";
import {
  getActiveListings,
  getMarketStats,
  getMyListing,
  listAgentForHire,
  delistAgent,
  hireAgent,
  type AgentListing,
} from "@/utils/agentMarket";
import { MODEL_HASH } from "@/utils/agentId";
import { ACTIVE_CHAIN } from "@/utils/chains";

const SPECIALTIES = [
  "DeFi Route Optimization",
  "Cross-Chain Arbitrage",
  "Gas Fee Minimization",
  "MEV Protection",
  "Portfolio Rebalancing",
  "Yield Optimization",
];

function weiToUsd(wei: bigint): string {
  return (Number(wei) / 1e15).toFixed(4);
}

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function timeAgo(ms: number) {
  const d = Math.floor((Date.now() - ms) / 1000);
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export default function MarketplacePage() {
  const { user }   = useAuth(false);
  const { signer, isConnected, address, connectWallet } = useWeb3();

  const [listings,    setListings]    = useState<AgentListing[]>([]);
  const [myListing,   setMyListing]   = useState<AgentListing | null>(null);
  const [stats,       setStats]       = useState({ listed: 0, hiresTotal: 0, volumeWei: BigInt(0) });
  const [loading,     setLoading]     = useState(true);
  const [actionBusy,  setActionBusy]  = useState(false);
  const [actionMsg,   setActionMsg]   = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // List form
  const [listPrice,     setListPrice]     = useState("0.01");
  const [listSpecialty, setListSpecialty] = useState(SPECIALTIES[0]);
  const [showListForm,  setShowListForm]  = useState(false);

  // Hire dialog
  const [hiringAgent,  setHiringAgent]  = useState<AgentListing | null>(null);

  const refresh = async () => {
    setLoading(true);
    const [all, marketStats] = await Promise.all([getActiveListings(), getMarketStats()]);
    setListings(all);
    setStats({ ...marketStats });
    if (address) {
      const mine = await getMyListing(address);
      setMyListing(mine);
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleList = async () => {
    if (!signer) return;
    setActionBusy(true);
    setActionMsg(null);
    try {
      const hash = await listAgentForHire(signer, parseFloat(listPrice), listSpecialty, MODEL_HASH);
      setActionMsg({ type: 'ok', text: `Agent listed! Tx: ${hash.slice(0, 22)}…` });
      setShowListForm(false);
      await refresh();
    } catch (e: unknown) {
      setActionMsg({ type: 'err', text: (e as Error).message?.slice(0, 120) || 'Listing failed' });
    }
    setActionBusy(false);
  };

  const handleDelist = async () => {
    if (!signer) return;
    setActionBusy(true);
    setActionMsg(null);
    try {
      await delistAgent(signer);
      setActionMsg({ type: 'ok', text: 'Agent delisted.' });
      setMyListing(null);
      await refresh();
    } catch (e: unknown) {
      setActionMsg({ type: 'err', text: (e as Error).message?.slice(0, 120) || 'Delist failed' });
    }
    setActionBusy(false);
  };

  const handleHire = async (agent: AgentListing) => {
    if (!signer) return;
    setActionBusy(true);
    setActionMsg(null);
    try {
      const taskRef = `smartchain-hire-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const hash    = await hireAgent(signer, agent.owner, agent.pricePerTask, taskRef);
      setActionMsg({ type: 'ok', text: `Agent hired! Tx: ${hash.slice(0, 22)}… — check your 0G wallet for the optimization result.` });
      setHiringAgent(null);
      await refresh();
    } catch (e: unknown) {
      setActionMsg({ type: 'err', text: (e as Error).message?.slice(0, 120) || 'Hire failed' });
    }
    setActionBusy(false);
  };

  // Demo listings shown when contract not deployed
  const demoListings: AgentListing[] = [
    { owner: "0x3A4F...C2B1", pricePerTask: BigInt(10000000000000), specialty: "DeFi Route Optimization",   modelHash: "v2.16", totalHires: 47, totalEarned: BigInt(470000000000000), active: true, listedAt: Date.now() - 3600000 },
    { owner: "0x7E2D...91A0", pricePerTask: BigInt(8000000000000),  specialty: "Gas Fee Minimization",      modelHash: "v2.14", totalHires: 83, totalEarned: BigInt(664000000000000), active: true, listedAt: Date.now() - 7200000 },
    { owner: "0xB1C9...4D6F", pricePerTask: BigInt(15000000000000), specialty: "Cross-Chain Arbitrage",    modelHash: "v2.16", totalHires: 12, totalEarned: BigInt(180000000000000), active: true, listedAt: Date.now() - 86400000 },
    { owner: "0xF4A8...3E2C", pricePerTask: BigInt(5000000000000),  specialty: "MEV Protection",            modelHash: "v2.15", totalHires: 129,totalEarned: BigInt(645000000000000), active: true, listedAt: Date.now() - 172800000 },
    { owner: "0xD2B7...7A1E", pricePerTask: BigInt(20000000000000), specialty: "Portfolio Rebalancing",    modelHash: "v2.16", totalHires: 8,  totalEarned: BigInt(160000000000000), active: true, listedAt: Date.now() - 259200000 },
  ];

  const displayListings = listings.length > 0 ? listings : demoListings;
  const isDemo = listings.length === 0;

  return (
    <>
      <Head>
        <title>Agent Marketplace | SmartChain Hub</title>
        <meta name="description" content="Hire AI agents or list yours for hire — on-chain agent economy on 0G Chain" />
      </Head>
      <div className="space-y-6 animate-fade-in-up">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-white">Agent Marketplace</h1>
            <p className="text-sm text-gray-500 mt-1">
              Hire specialized AI agents or monetize your trained agent. All payments are on-chain via 0G Chain — 90% to agent owner, 10% protocol fee.
            </p>
          </div>
          {isConnected ? (
            <button
              onClick={() => setShowListForm(f => !f)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-blue-600/20 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              List My Agent
            </button>
          ) : (
            <button
              onClick={connectWallet}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition-all shrink-0 border border-gray-700"
            >
              Connect Wallet to List
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active Agents",  value: isDemo ? "5+" : stats.listed,                color: "text-blue-400",   bg: "bg-blue-500/8 border border-blue-500/20" },
            { label: "Total Hires",    value: isDemo ? "279+" : stats.hiresTotal,           color: "text-green-400",  bg: "bg-green-500/8 border border-green-500/20" },
            { label: "Volume",         value: isDemo ? "~$2.1K" : `$${weiToUsd(stats.volumeWei * BigInt(1000))}`, color: "text-purple-400", bg: "bg-purple-500/8 border border-purple-500/20" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">{s.label}</p>
              <p className={`text-xl font-black ${s.color} tabular-nums`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Action message */}
        {actionMsg && (
          <div className={`flex items-start gap-3 p-4 rounded-xl text-sm border ${
            actionMsg.type === 'ok'
              ? 'bg-green-500/8 border-green-500/20 text-green-400'
              : 'bg-red-500/8 border-red-500/20 text-red-400'
          }`}>
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {actionMsg.type === 'ok'
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              }
            </svg>
            <span>{actionMsg.text}</span>
            <button onClick={() => setActionMsg(null)} className="ml-auto text-gray-500 hover:text-gray-300">×</button>
          </div>
        )}

        {/* My listing card */}
        {myListing && (
          <div className="card p-5 border-blue-500/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-blue-400">Your Listing</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Active</span>
                </div>
                <p className="text-sm font-bold text-white">{myListing.specialty}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Price: <span className="text-white font-semibold">${weiToUsd(myListing.pricePerTask)} / task</span>
                  {" · "}{myListing.totalHires} hires
                  {" · "}Earned: <span className="text-green-400">${weiToUsd(myListing.totalEarned)}</span>
                </p>
              </div>
              <button
                onClick={handleDelist}
                disabled={actionBusy}
                className="px-3 py-1.5 text-xs text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-40"
              >
                Delist
              </button>
            </div>
          </div>
        )}

        {/* List form */}
        {showListForm && (
          <div className="card p-5">
            <h2 className="text-sm font-bold text-white mb-4">List Your Agent</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Price per task (USD)</label>
                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={listPrice}
                  onChange={e => setListPrice(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="0.01"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Specialty</label>
                <select
                  value={listSpecialty}
                  onChange={e => setListSpecialty(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleList}
                  disabled={actionBusy || !isConnected}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {actionBusy ? 'Listing…' : 'List Agent on-chain'}
                </button>
                <button
                  onClick={() => setShowListForm(false)}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hire dialog overlay */}
        {hiringAgent && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setHiringAgent(null)}>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <h2 className="text-base font-bold text-white mb-4">Hire Agent</h2>
              <div className="space-y-3 mb-5">
                <div className="bg-gray-800/60 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Specialty</p>
                  <p className="text-sm font-semibold text-white">{hiringAgent.specialty}</p>
                </div>
                <div className="bg-gray-800/60 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Owner</p>
                  <p className="text-xs font-mono text-gray-300">{hiringAgent.owner}</p>
                </div>
                <div className="bg-gray-800/60 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Price</p>
                  <p className="text-sm font-bold text-green-400">${weiToUsd(hiringAgent.pricePerTask)} / task</p>
                </div>
                <div className="bg-gray-800/60 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Revenue Split</p>
                  <p className="text-xs text-gray-400">90% to agent owner · 10% protocol</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleHire(hiringAgent)}
                  disabled={actionBusy || !isConnected}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {actionBusy ? 'Processing…' : 'Confirm & Pay On-Chain'}
                </button>
                <button onClick={() => setHiringAgent(null)} className="px-4 py-2.5 bg-gray-800 text-gray-400 text-sm rounded-xl">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Listings grid */}
        {isDemo && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/8 border border-yellow-500/20 rounded-xl">
            <svg className="w-4 h-4 text-yellow-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <p className="text-xs text-yellow-400">Demo listings — deploy <code className="font-mono">SmartChainAgentMarket.sol</code> and set <code className="font-mono">NEXT_PUBLIC_AGENT_MARKET_CONTRACT</code> for live on-chain data.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="card p-5 h-48 animate-pulse bg-gray-800/40" />
            ))
          ) : displayListings.map((agent, i) => (
            <div key={i} className="card p-5 hover:border-blue-500/30 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
                  </svg>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-semibold">Active</span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1">{agent.specialty}</h3>
              <p className="text-[10px] font-mono text-gray-600 mb-3">
                {isDemo ? agent.owner : shortAddr(agent.owner)}
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-600 mb-0.5">Price</p>
                  <p className="text-sm font-bold text-white">${weiToUsd(agent.pricePerTask)}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-600 mb-0.5">Hires</p>
                  <p className="text-sm font-bold text-purple-400">{agent.totalHires}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-gray-600">Earned: <span className="text-green-400">${weiToUsd(agent.totalEarned)}</span></span>
                <span className="text-[10px] text-gray-600">{timeAgo(agent.listedAt)}</span>
              </div>

              <button
                onClick={() => isConnected ? setHiringAgent(agent) : connectWallet()}
                disabled={actionBusy || address?.toLowerCase() === agent.owner.toLowerCase()}
                className={`w-full py-2 text-sm font-semibold rounded-xl transition-all ${
                  address?.toLowerCase() === agent.owner.toLowerCase()
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 group-hover:border-blue-500/40'
                }`}
              >
                {address?.toLowerCase() === agent.owner.toLowerCase() ? 'Your Agent' : isConnected ? 'Hire Agent' : 'Connect to Hire'}
              </button>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="card p-6">
          <h2 className="text-sm font-bold text-white mb-4">How the Agent Economy Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { n: "01", title: "Train Your Agent", desc: "Run optimizations to build your agent's on-chain reputation and fine-tune its model on your data.", color: "text-blue-400" },
              { n: "02", title: "List for Hire",    desc: "Set your price per task and specialty. Your soulbound AgentID backs the listing on-chain.", color: "text-purple-400" },
              { n: "03", title: "Earn Revenue",     desc: "When others hire your agent, 90% of the task fee goes directly to your wallet on 0G Chain.", color: "text-green-400" },
            ].map(s => (
              <div key={s.n} className="flex items-start gap-3">
                <span className={`text-2xl font-black ${s.color} opacity-40 shrink-0`}>{s.n}</span>
                <div>
                  <p className="text-sm font-bold text-white mb-1">{s.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2">
            <span className="text-[10px] text-gray-600">Powered by</span>
            {["0G Chain", "0G Compute TeeML", "SmartChainAgentMarket.sol"].map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-gray-700 font-mono">{t}</span>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
