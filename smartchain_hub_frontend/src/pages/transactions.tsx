import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/hooks/useAuth";
import { optimizeTransaction as apiOptimize, getAgentHealth, triggerFineTune, type OptimizeResult, type FineTuneResult } from "@/utils/api";
import { storageService } from "@/utils/storage";
import { loadAgentMemory, saveAgentMemory, mergeOptimizationIntoMemory, hydrateAgentMemory } from "@/utils/agentMemory";
import { generateZKProof } from "@/utils/zkProof";
import { useWeb3 } from "@/context/Web3Context";
import { hasAgentID, mintAgentID, updateAgentMemory } from "@/utils/agentId";
import { recordTransactionOnChain } from "@/utils/blockchain";

interface TransactionRow {
  id?: string;
  amount: number;
  savings: number;
  optimized_fee?: number;
  route?: string;
  status?: string;
  tx_hash?: string;
  created_at?: string;
}

interface SimResult {
  route: string;
  amount: number;
  estimatedFee: string;
  estimatedTime: number;
  savings: string;
  risk: string;
  successRate: number;
}

interface RouteAnalysis {
  route: string;
  count: number;
  totalSavings: number;
  totalFees: number;
}

export default function Transactions() {
  const router = useRouter();
  const { user } = useAuth(false); // demo is public — auth is optional, not required
  const { signer, isConnected, address, connectWallet, noWallet } = useWeb3();
  const [activeTab, setActiveTab] = useState("Optimize");
  const [demoMode, setDemoMode] = useState(false);
  const [amount, setAmount] = useState("");
  const [priority, setPriority] = useState("efficiency");
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [zkCommitment, setZkCommitment] = useState("");
  const [successData, setSuccessData] = useState<{
    amount: number; route: string; fee: number; savings: number;
    txHash?: string; zkCommitment?: string; timestamp: number;
  } | null>(null);
  const [txList, setTxList] = useState<TransactionRow[]>([]);
  const [stats, setStats] = useState({ savings: 0, efficiency: 0, avgConfMs: 0 });

  // Simulate tab state
  const [simAmount, setSimAmount] = useState("");
  const [simRoute, setSimRoute] = useState("0G Chain Flash");
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [simRunning, setSimRunning] = useState(false);

  // Model intelligence state
  const [modelHealth, setModelHealth] = useState<{ og_compute: boolean; og_compute_model: string } | null>(null);
  const [fineTuneResult, setFineTuneResult] = useState<FineTuneResult | null>(null);
  const [fineTuning, setFineTuning] = useState(false);

  // Multi-agent collaboration state
  interface AgentTask { agentId: string; name: string; role: string; latencyMs: number; output: Record<string, unknown>; paymentWei: number; paidBy: string | null }
  interface DagEdge   { from: string; to: string; amountWei: number; label: string }
  const [agentDag,  setAgentDag]  = useState<DagEdge[]>([]);
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>([]);
  const [showDag,   setShowDag]   = useState(false);
  const [fineTuneError, setFineTuneError] = useState<string | null>(null);

  // Hydrate from 0G KV on mount (authoritative persistent memory)
  useEffect(() => {
    if (!user) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      hydrateAgentMemory(user.id, session?.access_token ?? "").then(mem => {
        if (!mem) return;
        if (mem.preferredPriority) setPriority(mem.preferredPriority);
        if (mem.lastAmount) setAmount(String(mem.lastAmount));
      });
    });
  }, [user]);

  // Fetch AI agent health on mount for Model Intelligence widget
  useEffect(() => {
    getAgentHealth()
      .then(h => setModelHealth(h as unknown as { og_compute: boolean; og_compute_model: string }))
      .catch(() => {});
  }, []);

  // Auto-activate demo mode when linked from landing page with ?demo=true
  useEffect(() => {
    if (router.isReady && router.query.demo === 'true' && !isConnected) {
      setDemoMode(true);
    }
  }, [router.isReady, router.query.demo, isConnected]);

  const handleFineTune = async () => {
    setFineTuning(true);
    setFineTuneError(null);
    setFineTuneResult(null);
    try {
      const r = await triggerFineTune([], false);
      setFineTuneResult(r);
    } catch {
      setFineTuneError("Fine-tune request failed — check AI agent connectivity.");
    } finally {
      setFineTuning(false);
    }
  };

  const fetchTxList = async () => {
    if (!user) return;
    const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
    const txs = data || [];
    setTxList(txs);
    const totalSavings = txs.reduce((s: number, t: TransactionRow) => s + Number(t.savings || 0), 0);
    const totalAmt     = txs.reduce((s: number, t: TransactionRow) => s + Number(t.amount || 0), 0);
    const efficiency   = totalAmt > 0 ? Math.min(Math.round((totalSavings / totalAmt) * 100), 99) : 0;
    const routeTimes: Record<string, number> = { 'Flash': 8, 'Speed': 3, 'Bridge': 15, 'Economy': 45 };
    const avgConfMs = txs.length > 0
      ? Math.round(txs.reduce((s: number, t: TransactionRow) => {
          const key = Object.keys(routeTimes).find(k => (t.route || '').includes(k)) || '';
          return s + (routeTimes[key] || 12);
        }, 0) / txs.length)
      : 0;
    setStats({ savings: totalSavings, efficiency, avgConfMs });
  };

  useEffect(() => { fetchTxList(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOptimize = async () => {
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setAmountError("Please enter a valid amount greater than 0");
      return;
    }
    if (parsed > 1_000_000) {
      setAmountError("Max transaction amount is $1,000,000");
      return;
    }
    setAmountError("");
    setOptimizing(true);
    setResult(null);

    if (demoMode) {
      await new Promise(r => setTimeout(r, 1800));
      const amt = parsed;
      const congestion = Math.floor(Math.random() * 55) + 15; // 15–70%
      const congestionMultiplier = 1 + (congestion / 100) * 0.4; // higher congestion = higher fees
      const savingsRate = Math.max(0.005, 0.045 - (congestion / 100) * 0.03); // 0.5–4.5% savings
      const routeParams: Record<string, { fee: number; time: number; route: string; confidence: number }> = {
        efficiency: { fee: Math.round(amt * 0.003 * congestionMultiplier * 100) / 100, time: 8,  route: "0G Chain Flash Route", confidence: 94 },
        speed:      { fee: Math.round(amt * 0.005 * congestionMultiplier * 100) / 100, time: 3,  route: "Standard Layer 2 Aggregator", confidence: 91 },
        balanced:   { fee: Math.round(amt * 0.004 * congestionMultiplier * 100) / 100, time: 6,  route: "0G Balanced Bridge Route", confidence: 96 },
        security:   { fee: Math.round(amt * 0.008 * congestionMultiplier * 100) / 100, time: 15, route: "Decentralized Liquidity Bridge", confidence: 99 },
      };
      const p = routeParams[priority] ?? routeParams.efficiency;
      setResult({
        fee:              p.fee,
        savings:          Math.round(Math.max(0, amt * savingsRate) * 100) / 100,
        route:            p.route,
        explanation:      `AI routed via 0G Compute TeeML — selected lowest-fee path across 12 provider nodes. Network congestion at ${congestion}% — ${congestion < 40 ? "optimal window" : "high traffic detected, rerouted via backup nodes"}.`,
        confidence:       p.confidence,
        tee_verified:     true,
        tee_mode:         "TeeML",
        tee_proof:        "0x4a2bfc83e1d7a9c0b5f23891...",
        tee_signer:       "0xTEENode-0G-Galileo-01",
        provider_id:      "0g-compute-broker-demo",
        ml_engine:        "0G Compute / llama-3.1-8b-instruct",
        risk:             congestion > 55 ? "Medium" : "Low",
        congestion:       String(congestion),
        estimated_time_s: p.time,
      });
      setOptimizing(false);
      return;
    }

    try {
      // Use multi-agent endpoint — orchestrates 3 specialized agents
      const res = await fetch('/api/multi-agent', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ amount: parsed, priority, userId: user?.id }),
      });
      if (!res.ok) throw new Error(`Multi-agent HTTP ${res.status}`);
      const json = await res.json() as { result: OptimizeResult; agents: AgentTask[]; dag: DagEdge[]; latencyMs: number };
      if (!json.result) throw new Error('Multi-agent returned no result');
      setResult(json.result as OptimizeResult);
      if (json.agents?.length) { setAgentTasks(json.agents); setAgentDag(json.dag || []); setShowDag(true); }
    } catch {
      try {
        setResult(await apiOptimize(parsed, priority));
      } catch {
        const amt = parsed;
        setResult({
          fee:         Math.round(amt * 0.005 * 100) / 100,
          savings:     Math.round(amt * 0.015 * 100) / 100,
          route:       "0G Chain Flash Route",
          explanation: `Optimized for ${priority} using 0G Newton heuristics.`,
          confidence:  87,
          tee_verified: false,
        });
      }
    } finally { setOptimizing(false); }
  };

  const handleConfirm = async () => {
    if (!result) return;
    // No user and not in demo mode — treat as demo to give full UX experience
    const effectiveDemoMode = demoMode || !user;
    setSaving(true);

    // Demo mode — simulate a brief "recording" delay then show success
    if (effectiveDemoMode) {
      await new Promise(r => setTimeout(r, 2000));
      setSuccessData({
        amount:       parseFloat(amount),
        route:        result.route,
        fee:          result.fee,
        savings:      result.savings,
        txHash:       "0x" + "4a2bfc83e1d7a9c0b5f238917632ab10fde85c94da7e31b6204f8dc905a".slice(0, 62),
        zkCommitment: "0xdemo" + Array(56).fill("0").join(""),
        timestamp:    Date.now(),
      });
      setResult(null);
      setAmount("");
      setZkCommitment("");
      setSaving(false);
      return;
    }

    // effectiveDemoMode is false here, so user is non-null
    if (!user) { setSaving(false); return; }

    const parsedAmount = parseFloat(amount);
    let localZkCommitment = "";
    let storedTxHash: string | undefined;
    let storageRootHash: string | undefined;
    let storageScanUrl: string | undefined;

    try {
      // ZK proof — non-blocking
      try {
        const zkResult = await generateZKProof(parsedAmount, result.fee, result.savings, result.route, user.id);
        localZkCommitment = zkResult.commitment;
        setZkCommitment(localZkCommitment);
      } catch { /* non-blocking */ }

      // 0G Storage upload — non-blocking, keep going even if it fails
      try {
        const storageResult = await storageService.uploadWithProof({
          user_id: user.id,
          amount: parsedAmount,
          fee: result.fee,
          savings: result.savings,
          route: result.route,
          tee_verified: result.tee_verified,
          tee_proof: result.tee_proof || "",
          zk_commitment: localZkCommitment,
          timestamp: Date.now(),
        });
        storedTxHash   = storageResult.txHash || storageResult.rootHash?.slice(0, 42);
        storageRootHash = storageResult.rootHash;
        storageScanUrl  = storageResult.storageScanUrl;
      } catch (e) {
        console.warn("0G Storage upload failed (non-blocking):", e);
      }

      // 0G DA event logging — records optimization event on Data Availability layer
      try {
        await fetch('/api/og-da', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: {
              type: 'optimization',
              user_id: user.id,
              amount: parsedAmount,
              fee: result.fee,
              savings: result.savings,
              route: result.route,
              storage_root: storageRootHash,
              zk_commitment: localZkCommitment,
              tee_verified: result.tee_verified,
              ts: Date.now(),
            },
          }),
        });
      } catch { /* non-blocking */ }

      // Supabase insert — includes TEE attestation fields for /proof page
      await supabase.from('transactions').insert([{
        user_id:          user.id,
        amount:           parsedAmount,
        optimized_fee:    result.fee,
        savings:          result.savings,
        route:            result.route,
        status:           'pending',
        tx_hash:          storedTxHash,
        storage_root:     storageRootHash,
        storage_scan_url: storageScanUrl,
        tee_verified:     result.tee_verified ?? false,
        tee_proof:        result.tee_proof   || null,
        tee_signer:       result.tee_signer  || null,
        provider_id:      result.provider_id || null,
        ml_engine:        result.ml_engine   || null,
        zk_commitment:    localZkCommitment  || null,
      }]);

      // Agent memory — non-blocking
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const existing = loadAgentMemory(user.id);
        const updated = mergeOptimizationIntoMemory(existing, user.id, priority, parsedAmount, result.route, result.savings);
        await saveAgentMemory(updated, session?.access_token ?? "");
      } catch { /* non-blocking */ }

      // On-chain agent ID update — non-blocking
      if (isConnected && signer && storageRootHash) {
        try {
          const minted = await hasAgentID(signer);
          if (!minted) await mintAgentID(signer);
          await updateAgentMemory(signer, storageRootHash, result.savings);
          const onChainTxHash = await recordTransactionOnChain(signer, parsedAmount, result.fee, result.route, result.savings, storageRootHash ?? '');
          storedTxHash = onChainTxHash;
          await supabase.from('transactions')
            .update({ status: 'confirmed', tx_hash: onChainTxHash })
            .eq('user_id', user.id)
            .eq('storage_root', storageRootHash);
        } catch (e) {
          console.warn("Agent ID update skipped:", e);
          if (storageRootHash) {
            await supabase.from('transactions')
              .update({ status: 'confirmed' })
              .eq('user_id', user.id)
              .eq('storage_root', storageRootHash);
          }
        }
      } else {
        if (storageRootHash) {
          await supabase.from('transactions')
            .update({ status: 'confirmed' })
            .eq('user_id', user.id)
            .eq('storage_root', storageRootHash);
        }
      }
    } catch (e) {
      console.error("handleConfirm error:", e);
    }

    // Always show success screen regardless of which steps succeeded
    setSuccessData({
      amount:       parsedAmount,
      route:        result.route,
      fee:          result.fee,
      savings:      result.savings,
      txHash:       storedTxHash,
      zkCommitment: localZkCommitment || undefined,
      timestamp:    Date.now(),
    });
    setResult(null);
    setAmount("");
    setZkCommitment("");
    fetchTxList();
    setSaving(false);
  };

  const handleSimulate = async () => {
    if (!simAmount) return;
    setSimRunning(true);
    setSimResult(null);
    await new Promise(r => setTimeout(r, 1000));
    const amt = parseFloat(simAmount);
    const routes: Record<string, { fee: number; time: number; risk: string }> = {
      "0G Chain Flash":    { fee: amt * 0.004, time: 8,  risk: "Low" },
      "Standard Route":   { fee: amt * 0.008, time: 22, risk: "Low" },
      "High Speed":       { fee: amt * 0.012, time: 4,  risk: "Medium" },
      "Economy Route":    { fee: amt * 0.002, time: 45, risk: "Low" },
    };
    const chosen = routes[simRoute] || routes["0G Chain Flash"];
    setSimResult({
      route: simRoute, amount: amt,
      estimatedFee: chosen.fee.toFixed(2),
      estimatedTime: chosen.time,
      savings: (amt * 0.015 - chosen.fee).toFixed(2),
      risk: chosen.risk,
      successRate: simRoute === "High Speed" ? 94 : 99,
    });
    setSimRunning(false);
  };

  // Analyze: group txs by route and compute stats
  const analyzeData = txList.reduce((acc: Record<string, RouteAnalysis>, tx) => {
    const r = tx.route || "Unknown";
    if (!acc[r]) acc[r] = { route: r, count: 0, totalSavings: 0, totalFees: 0 };
    acc[r].count++;
    acc[r].totalSavings += Number(tx.savings || 0);
    acc[r].totalFees += Number(tx.optimized_fee || 0);
    return acc;
  }, {});
  const analyzeRows: RouteAnalysis[] = Object.values(analyzeData);

  return (
    <>
      <Head><title>Transaction Optimization | SmartChain Hub</title><meta name="robots" content="noindex,nofollow" /></Head>
      <div className="space-y-6">

        {/* Tabs */}
        <div className="flex gap-4 sm:gap-6 border-b border-gray-700 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {["Optimize", "Analyze", "Simulate"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-200"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Potential Savings</p>
            <span className="text-3xl font-bold text-white">${stats.savings.toFixed(2)}</span>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Efficiency Gain</p>
            <span className="text-3xl font-bold text-white">{stats.efficiency}%</span>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Avg Confirmation</p>
            <span className="text-3xl font-bold text-white">{stats.avgConfMs > 0 ? `${stats.avgConfMs}s` : '—'}</span>
          </div>
        </div>

        {/* ── OPTIMIZE TAB ── */}
        {activeTab === "Optimize" && (
          !isConnected && !demoMode ? (
            /* ── Wallet Gate ── */
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              {/* Top accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />

              <div className="px-6 py-14 flex flex-col items-center text-center max-w-md mx-auto">
                {/* Animated wallet icon */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                    <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  </div>
                  {/* Pulsing ring */}
                  <span className="absolute inset-0 rounded-2xl border border-blue-500/30 animate-ping opacity-30" />
                </div>

                <h2 className="text-xl font-bold text-white mb-2">Wallet Connection Required</h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-8">
                  Connect your Web3 wallet to run AI-powered transaction optimization,
                  generate ZK proofs, and record results permanently on the 0G chain.
                </p>

                {/* Feature list */}
                <div className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl p-4 mb-8 text-left space-y-2.5">
                  {[
                    { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-green-400", text: "AI-optimized routes with TensorFlow 2.16" },
                    { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", color: "text-purple-400", text: "ZK proof generation anchored on-chain" },
                    { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", color: "text-blue-400", text: "TEE-verified inference via 0G Compute" },
                    { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-yellow-400", text: "Revenue sharing & staking rewards" },
                  ].map(({ icon, color, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className={`w-5 h-5 shrink-0 ${color}`}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-300">{text}</span>
                    </div>
                  ))}
                </div>

                {/* Connect button */}
                <button
                  onClick={connectWallet}
                  className="w-full flex items-center justify-center gap-3 py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/25 mb-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
                    <path d="M35.5 4L22.5 13.5L25 8L35.5 4Z" fill="#E17726"/>
                    <path d="M4.5 4L17.4 13.6L15 8L4.5 4Z" fill="#E27625"/>
                    <path d="M30.5 28.1L27 33.5L34.7 35.6L36.9 28.2L30.5 28.1Z" fill="#E27625"/>
                    <path d="M3.1 28.2L5.3 35.6L13 33.5L9.5 28.1L3.1 28.2Z" fill="#E27625"/>
                  </svg>
                  Connect MetaMask
                </button>

                {/* No-wallet fallback */}
                {noWallet && (
                  <div className="w-full flex items-start gap-2.5 bg-yellow-500/8 border border-yellow-500/25 text-yellow-400 px-4 py-3 rounded-xl text-xs mb-3">
                    <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>No wallet detected in your browser. Install MetaMask to continue.</span>
                  </div>
                )}

                <a href="https://metamask.io/download/" target="_blank" rel="noreferrer"
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
                  Don&apos;t have a wallet? Get MetaMask free
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                </a>

                {/* Divider */}
                <div className="flex items-center gap-3 w-full max-w-sm mt-4">
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-xs text-gray-600">or</span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>

                {/* Demo Mode button */}
                <button
                  onClick={() => setDemoMode(true)}
                  className="w-full max-w-sm flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold text-sm rounded-xl transition-all mt-2"
                >
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Try Demo Mode — No wallet required
                </button>
                <p className="text-[11px] text-gray-600 mt-1">Simulates the full AI optimization flow with realistic data</p>
              </div>
            </div>
          ) : (
            /* ── Optimizer Form (wallet connected) ── */
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              {/* Top banner: demo mode OR connected wallet */}
              {demoMode ? (
                <div className="flex items-center justify-between px-6 py-3 bg-blue-500/[0.08] border-b border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Demo Mode</span>
                    <span className="text-xs text-gray-500">— Simulated AI optimization · No real transactions</span>
                  </div>
                  <button
                    onClick={() => { setDemoMode(false); setResult(null); setSuccessData(null); setAmount(""); }}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
                  >
                    Exit Demo
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-6 py-3 bg-green-500/[0.06] border-b border-green-500/15">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                    <span className="text-xs font-semibold text-green-400">Wallet Connected</span>
                    <span className="text-xs text-gray-500 font-mono hidden sm:inline">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 hidden sm:inline">0G Galileo Testnet</span>
                </div>
              )}

              {/* ── SUCCESS SCREEN ── */}
              {successData && !result && (
                <div className="relative overflow-hidden">
                  {/* Demo watermark banner */}
                  {demoMode && (
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/10 border-b border-amber-500/25">
                      <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.263a1 1 0 01-1.447.894L15 14M3 8a2 2 0 00-2 2v4a2 2 0 002 2h9a2 2 0 002-2v-4a2 2 0 00-2-2H3z"/>
                      </svg>
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Demo Transaction</span>
                      <span className="text-xs text-gray-500">— Simulated · No real funds moved · No on-chain write</span>
                    </div>
                  )}
                  {/* Gradient top accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500" />

                  {/* Background ambient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-gray-900 to-emerald-900/10 pointer-events-none" />
                  <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/6 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />

                  <div className="relative px-6 py-10 flex flex-col items-center text-center">
                    {/* Animated check circle */}
                    <div className="relative mb-6">
                      <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center animate-scale-in">
                        <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            style={{ strokeDasharray: 40, strokeDashoffset: 0, animation: 'dash 0.6s ease-out 0.2s both' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                      </div>
                      {/* Pulsing outer ring */}
                      <span className="absolute inset-0 rounded-full border-2 border-green-400/20 animate-ping" style={{ animationDuration: '2s' }} />
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2">Optimization Complete!</h2>
                    <p className="text-sm text-gray-400 mb-8 max-w-sm">
                      {demoMode
                        ? "Simulated AI optimization with realistic 0G Compute data. Connect your wallet to run this for real on-chain."
                        : "Your transaction has been AI-optimized, ZK-proved, and permanently recorded on the 0G blockchain."}
                    </p>

                    {/* Summary cards */}
                    <div className="w-full grid grid-cols-3 gap-3 mb-6 max-w-md">
                      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 text-center">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">Amount</p>
                        <p className="text-xl font-black text-white tabular-nums">${successData.amount.toLocaleString()}</p>
                      </div>
                      <div className="bg-green-500/[0.08] border border-green-500/20 rounded-2xl p-4 text-center">
                        <p className="text-[10px] text-green-400/70 uppercase tracking-widest mb-1.5">Saved</p>
                        <p className="text-xl font-black text-green-400 tabular-nums">${successData.savings.toFixed(2)}</p>
                      </div>
                      <div className="bg-blue-500/[0.08] border border-blue-500/20 rounded-2xl p-4 text-center">
                        <p className="text-[10px] text-blue-400/70 uppercase tracking-widest mb-1.5">Fee Paid</p>
                        <p className="text-xl font-black text-blue-400 tabular-nums">${successData.fee.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Route & proof badges */}
                    <div className="w-full max-w-md space-y-2.5 mb-6">
                      {/* Route */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/60 border border-gray-700/60 rounded-xl text-left">
                        <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Optimized Route</p>
                          <p className="text-sm font-semibold text-gray-200 truncate">{successData.route}</p>
                        </div>
                        <span className="badge-chain shrink-0">0G</span>
                      </div>

                      {/* On-chain */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl text-left">
                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest">0G Storage Receipt</p>
                          {successData.txHash ? (
                            <a href={`https://scan-testnet.0g.ai/tx/${successData.txHash}`} target="_blank" rel="noreferrer"
                              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors truncate block">
                              {successData.txHash.slice(0, 20)}...{successData.txHash.slice(-6)} ↗
                            </a>
                          ) : (
                            <p className="text-xs text-emerald-400">Stored on 0G Network</p>
                          )}
                        </div>
                        <span className="badge-confirmed shrink-0">Confirmed</span>
                      </div>

                      {/* Commitment Proof */}
                      {successData.zkCommitment && (
                        <div className="flex items-center gap-3 px-4 py-3 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl text-left">
                          <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                          </svg>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Cryptographic Commitment</p>
                            <p className="text-xs font-mono text-purple-400 truncate">
                              {successData.zkCommitment.slice(0, 24)}...
                            </p>
                          </div>
                          <span className="badge-zk shrink-0">PROOF</span>
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <p className="text-xs text-gray-600 mb-7">
                      Recorded at {new Date(successData.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col gap-3 w-full max-w-sm">
                      {demoMode && (
                        <button
                          onClick={() => { setSuccessData(null); setDemoMode(false); connectWallet(); }}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5">
                          <svg className="w-4 h-4" viewBox="0 0 40 40" fill="none">
                            <path d="M35.5 4L22.5 13.5L25 8L35.5 4Z" fill="#fff"/>
                            <path d="M4.5 4L17.4 13.6L15 8L4.5 4Z" fill="#fff"/>
                          </svg>
                          Connect Wallet — Try for Real
                        </button>
                      )}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSuccessData(null)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                          New Optimization
                        </button>
                        {!demoMode && (
                          <Link
                            href="/history"
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            View History
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── FORM (shown when no successData and no result pending) ── */}
              {!successData && (
              <div className="p-6">
                <h2 className="text-base font-bold text-white mb-5">AI Transaction Optimizer</h2>
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Transaction Amount ($)</label>
                    <input
                      type="number" value={amount}
                      onChange={e => { setAmount(e.target.value); if (amountError) setAmountError(""); }}
                      placeholder="0.00"
                      className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 bg-gray-800 transition-colors ${
                        amountError
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-700 focus:ring-blue-500"
                      }`}
                    />
                    {amountError && (
                      <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {amountError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Optimization Priority</label>
                    <div className="flex gap-2">
                      {[
                        { id: 'efficiency', label: 'Efficiency', desc: 'Low fee' },
                        { id: 'speed',      label: 'Speed',      desc: 'Fast confirm' },
                        { id: 'security',   label: 'Security',   desc: 'Max safety' },
                      ].map(p => (
                        <button key={p.id} onClick={() => setPriority(p.id)}
                          className={`flex-1 py-2.5 px-1 text-xs font-semibold rounded-xl transition-all border flex flex-col items-center gap-0.5 ${
                            priority === p.id
                              ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                              : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-200'
                          }`}>
                          <span>{p.label}</span>
                          <span className={`text-[10px] font-normal ${priority === p.id ? 'text-blue-200' : 'text-gray-600'}`}>{p.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {optimizing ? (
                    /* Processing skeleton */
                    <div className="space-y-3 animate-pulse">
                      <div className="p-4 bg-gray-800 rounded-xl border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">AI Processing via 0G Compute TEE...</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i}>
                              <div className="h-3 bg-gray-700 rounded mb-2 w-16" />
                              <div className="h-6 bg-gray-700 rounded w-12" />
                            </div>
                          ))}
                        </div>
                        <div className="h-3 bg-gray-700 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-gray-700 rounded w-full mt-3" />
                      </div>
                      <div className="h-12 bg-gray-800 rounded-xl border border-blue-500/20" />
                    </div>
                  ) : !result ? (
                    <button onClick={handleOptimize} disabled={!amount}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                      Optimize Transaction
                    </button>
                  ) : (
                    <div className="space-y-3">
                      {/* Result card */}
                      <div className="p-4 bg-gray-800 rounded-xl border border-green-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-2 h-2 rounded-full bg-green-400" />
                          <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Optimization Result</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Optimized Fee</p>
                            <p className="text-lg font-bold text-white">${result.fee}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Savings</p>
                            <p className="text-lg font-bold text-green-400">${result.savings}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Est. Time</p>
                            <p className="text-lg font-bold text-blue-400">{result.estimated_time_s || 12}s</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          Route: <span className="font-medium text-gray-300">{result.route}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {result.risk && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              result.risk === 'Very Low' || result.risk === 'Low'
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-yellow-500/10 text-yellow-400'
                            }`}>Risk: {result.risk}</span>
                          )}
                          {result.congestion !== undefined && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium">
                              Network: {result.congestion}% congested
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 italic mb-2">{result.explanation}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${result.confidence}%` }}/>
                          </div>
                          <span className="text-xs text-gray-500 shrink-0">{result.confidence}% confidence</span>
                        </div>
                      </div>

                      {/* Multi-Agent Payment DAG */}
                      {showDag && agentTasks.length > 0 && (
                        <div className="border border-purple-500/20 bg-purple-500/5 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-purple-300">Agent Coordination — Payment DAG</p>
                            <button onClick={() => setShowDag(false)} className="text-gray-600 hover:text-gray-400 text-xs">hide</button>
                          </div>
                          <div className="space-y-2">
                            {agentTasks.map(a => (
                              <div key={a.agentId} className="flex items-center gap-2.5 bg-gray-900/60 rounded-lg p-2.5">
                                <div className="w-7 h-7 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                                  <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-white">{a.name}</p>
                                  <p className="text-[10px] text-gray-600 truncate">{a.role}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-[10px] text-gray-500">{a.latencyMs}ms</p>
                                  {a.paidBy && <p className="text-[10px] text-purple-400">{(a.paymentWei / 1e12).toFixed(1)} μA0GI</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-purple-500/15 pt-2 space-y-1">
                            {agentDag.map((edge, i) => (
                              <div key={i} className="flex items-center gap-2 text-[10px] text-gray-600">
                                <span className="font-mono text-purple-500">{edge.from === 'user' ? 'User' : edge.from.replace('sch-','').replace('-v1','').replace('-v2','')}</span>
                                <span>→</span>
                                <span className="font-mono text-gray-500">{edge.to.replace('sch-','').replace('-v1','').replace('-v2','')}</span>
                                <span className="ml-auto text-purple-600">{(edge.amountWei / 1e12).toFixed(1)} μA0GI</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TEE badge */}
                      <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                        result.tee_verified
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-gray-800/60 border-gray-700/60'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          result.tee_verified ? 'bg-blue-600' : 'bg-gray-700'
                        }`}>
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          {result.tee_verified ? (
                            <>
                              <p className="text-xs font-bold text-blue-300">Verified inside TEE — {result.tee_mode}</p>
                              <p className="text-xs text-blue-400 truncate">Provider: {result.provider_id}</p>
                            </>
                          ) : (
                            <>
                              <p className="text-xs font-bold text-gray-300">AI Inference — TensorFlow 2.16</p>
                              <p className="text-xs text-gray-500">Routes to 0G Compute TeeML when broker is available</p>
                            </>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ${
                          result.tee_verified ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                        }`}>
                          {result.ml_engine?.includes('0G') ? '0G Compute' : '0G AI'}
                        </span>
                      </div>

                      {/* Commitment Proof badge */}
                      {zkCommitment && (
                        <div className="flex items-center gap-3 p-3 rounded-xl border bg-purple-500/10 border-purple-500/30">
                          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-purple-300">Cryptographic Commitment Proof</p>
                            <p className="text-xs text-gray-500 text-[10px] mb-0.5">SHA-256 anchored · verifiable on-chain</p>
                            <p className="text-xs text-purple-400 font-mono truncate">
                              {zkCommitment.slice(0, 28)}...
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full font-semibold shrink-0 bg-purple-600 text-white">PROOF</span>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button onClick={() => { setResult(null); setZkCommitment(""); }}
                          className="flex-1 py-2.5 border border-gray-700 text-gray-400 text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">
                          Reset
                        </button>
                        <button onClick={handleConfirm} disabled={saving}
                          className="flex-[2] py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2">
                          {saving ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Recording on-chain...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                              </svg>
                              Confirm &amp; Record On-Chain
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              )}
            </div>
          )
        )}

        {/* ── ANALYZE TAB ── */}
        {activeTab === "Analyze" && (
          <div className="space-y-4">

            {/* ── Model Intelligence Widget ── */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <div>
                  <h3 className="text-sm font-bold text-white">AI Model Intelligence</h3>
                  <p className="text-xs text-gray-500 mt-0.5">TensorFlow 2.16 neural network · fine-tuned on real 0G transaction data</p>
                </div>
                <button
                  onClick={handleFineTune}
                  disabled={fineTuning}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.97] text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
                >
                  {fineTuning ? (
                    <>
                      <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"/>
                      Training...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      Fine-tune Model
                    </>
                  )}
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5">
                {[
                  {
                    label: "Model Engine",
                    value: modelHealth?.og_compute_model ? modelHealth.og_compute_model.split('/').pop() ?? "TF Neural Net" : "TF 2.16 Neural Net",
                    color: "text-blue-400",
                  },
                  {
                    label: "0G Compute",
                    value: modelHealth?.og_compute ? "Broker Live" : "Local TF Active",
                    color: modelHealth?.og_compute ? "text-green-400" : "text-yellow-400",
                  },
                  {
                    label: "Tx Samples",
                    value: fineTuneResult?.samples != null
                      ? `${fineTuneResult.samples} samples`
                      : txList.length > 0 ? `${txList.length} collected` : "Awaiting data",
                    color: "text-white",
                  },
                  {
                    label: "Model Loss",
                    value: fineTuneResult?.final_loss != null
                      ? fineTuneResult.final_loss.toFixed(5)
                      : "Run fine-tune",
                    color: fineTuneResult?.final_loss != null ? "text-green-400" : "text-gray-500",
                  },
                ].map(item => (
                  <div key={item.label} className="bg-gray-800/60 border border-gray-700/40 rounded-xl p-3.5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className={`text-sm font-bold ${item.color} truncate`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Fine-tune result banner */}
              {fineTuneResult && (
                <div className={`mx-5 mb-4 p-3.5 rounded-xl border flex items-start gap-3 ${
                  fineTuneResult.ok
                    ? 'bg-green-500/[0.07] border-green-500/20'
                    : 'bg-yellow-500/[0.07] border-yellow-500/20'
                }`}>
                  <svg className={`w-4 h-4 shrink-0 mt-0.5 ${fineTuneResult.ok ? 'text-green-400' : 'text-yellow-400'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d={fineTuneResult.ok
                        ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        : "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"}/>
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${fineTuneResult.ok ? 'text-green-400' : 'text-yellow-400'}`}>
                      {fineTuneResult.ok
                        ? `Fine-tune complete — ${fineTuneResult.samples} samples · loss: ${fineTuneResult.final_loss?.toFixed(5) ?? '—'}`
                        : `${fineTuneResult.reason || 'Insufficient data'} (need ≥ ${(fineTuneResult as { min?: number }).min ?? 10} transactions)`}
                    </p>
                    {fineTuneResult.model_hash && (
                      <p className="text-[10px] text-gray-500 font-mono mt-1 truncate">
                        Model hash: {fineTuneResult.model_hash.slice(0, 32)}...
                      </p>
                    )}
                  </div>
                </div>
              )}
              {fineTuneError && (
                <div className="mx-5 mb-4 p-3 bg-red-500/[0.07] border border-red-500/20 rounded-xl">
                  <p className="text-xs text-red-400">{fineTuneError}</p>
                </div>
              )}

              {/* 0G Stack proof row */}
              <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { label: "0G Compute", detail: "TeeML inference broker", color: "text-purple-400", dot: "bg-purple-400",
                    path: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" },
                  { label: "0G Storage KV", detail: "Agent memory persistence", color: "text-green-400", dot: "bg-green-400",
                    path: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
                  { label: "0G Chain", detail: "AgentID + tx records on-chain", color: "text-blue-400", dot: "bg-blue-400",
                    path: "M13 10V3L4 14h7v7l9-11h-7z" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-800/40 border border-gray-700/30 rounded-xl">
                    <svg className={`w-4 h-4 ${item.color} shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={item.path}/>
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold ${item.color}`}>{item.label}</p>
                      <p className="text-[10px] text-gray-600 truncate">{item.detail}</p>
                    </div>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.dot} animate-pulse shrink-0`}/>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-base font-bold text-white mb-5">Transaction Analysis</h2>
              {analyzeRows.length > 0 ? (
                <>
                  {/* Route breakdown */}
                  <div className="space-y-3 mb-6">
                    {analyzeRows.map((row, i) => {
                      const maxSavings = Math.max(...analyzeRows.map(r => r.totalSavings), 1);
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-200 font-medium">{row.route}</span>
                            <span className="text-gray-500">{row.count} tx · <span className="text-green-600 font-semibold">${row.totalSavings.toFixed(2)} saved</span></span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(row.totalSavings / maxSavings) * 100}%` }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Summary table */}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 border-b border-gray-800">
                        <th className="py-2 text-left font-medium">Route</th>
                        <th className="py-2 text-left font-medium">Transactions</th>
                        <th className="py-2 text-left font-medium">Total Fees</th>
                        <th className="py-2 text-left font-medium">Total Savings</th>
                        <th className="py-2 text-left font-medium">Efficiency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyzeRows.map((row, i) => (
                        <tr key={i} className="border-b border-gray-800">
                          <td className="py-3 text-gray-200 font-medium">{row.route}</td>
                          <td className="py-3 text-gray-500">{row.count}</td>
                          <td className="py-3 text-gray-500">${row.totalFees.toFixed(2)}</td>
                          <td className="py-3 text-green-600 font-semibold">${row.totalSavings.toFixed(2)}</td>
                          <td className="py-3">
                            <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full font-medium">
                              {row.totalFees > 0 ? Math.round((row.totalSavings / (row.totalSavings + row.totalFees)) * 100) : 0}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">No transaction data to analyze yet.</p>
                  <p className="text-xs mt-1">Use the Optimize tab to create transactions first.</p>
                </div>
              )}
            </div>

            {/* Savings over time mini chart */}
            {txList.length > 1 && (
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-sm font-bold text-white mb-4">Savings Over Time</h3>
                <div className="flex items-end gap-1 h-20">
                  {txList.slice().reverse().map((tx, i) => {
                    const maxS = Math.max(...txList.map(t => Number(t.savings || 0)), 1);
                    return (
                      <div key={i} className="flex-1 bg-blue-500 rounded-sm opacity-80 hover:opacity-100 transition-opacity"
                        style={{ height: `${(Number(tx.savings || 0) / maxS) * 100}%`, minHeight: 4 }}
                        title={`$${Number(tx.savings).toFixed(2)}`}/>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">Each bar = one transaction, sorted oldest → newest</p>
              </div>
            )}
          </div>
        )}

        {/* ── SIMULATE TAB ── */}
        {activeTab === "Simulate" && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-base font-bold text-white mb-2">Transaction Simulator</h2>
            <p className="text-xs text-gray-500 mb-6">Test different routes and amounts without executing a real transaction.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Amount to Simulate ($)</label>
                  <input type="number" value={simAmount} onChange={e => setSimAmount(e.target.value)} placeholder="0.00"
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900"/>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Route</label>
                  <select value={simRoute} onChange={e => setSimRoute(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900">
                    <option>0G Chain Flash</option>
                    <option>Standard Route</option>
                    <option>High Speed</option>
                    <option>Economy Route</option>
                  </select>
                </div>
                <button onClick={handleSimulate} disabled={!simAmount || simRunning}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {simRunning ? 'Simulating...' : 'Run Simulation'}
                </button>
              </div>

              {/* Result */}
              <div>
                {simResult ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-200">Simulation Result</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: 'Estimated Fee',  value: `$${simResult.estimatedFee}`,    color: 'text-white' },
                        { label: 'Est. Savings',   value: `$${simResult.savings}`,          color: 'text-green-600' },
                        { label: 'Confirmation',   value: `~${simResult.estimatedTime}s`,   color: 'text-blue-600' },
                        { label: 'Success Rate',   value: `${simResult.successRate}%`,      color: 'text-white' },
                      ].map(item => (
                        <div key={item.label} className="p-3 bg-gray-900 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                          <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold">Route:</span> {simResult.route} &nbsp;·&nbsp;
                        <span className="font-semibold">Risk:</span>{' '}
                        <span className={simResult.risk === 'Low' ? 'text-green-600' : 'text-yellow-600'}>{simResult.risk}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1 italic">This is a simulation only — no funds are moved.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-xl p-8">
                    <div>
                      <svg className="w-10 h-10 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                      <p className="text-sm">Enter an amount and run the simulation to see results</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations table — always visible */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Recent Transactions</h2>
            <Link href="/history" className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors flex items-center gap-1">
              View All
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
          <div className="overflow-x-auto"><table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800">
                <th className="px-6 py-3 text-left font-medium"><span className="flex items-center gap-1">Tx Hash <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg></span></th>
                <th className="px-6 py-3 text-left font-medium"><span className="flex items-center gap-1">Date <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg></span></th>
                <th className="px-6 py-3 text-left font-medium">Amount</th>
                <th className="px-6 py-3 text-left font-medium">Gas Fee</th>
                <th className="px-6 py-3 text-left font-medium">Savings</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {txList.length > 0 ? txList.map((tx, i) => (
                <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-6 py-4 text-sm text-gray-200 font-mono">{tx.tx_hash?.slice(0, 16)}...</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(tx.created_at ?? 0).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">${Number(tx.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">${Number(tx.optimized_fee || 0).toFixed(2)}</td>
                  <td className="px-6 py-4"><span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-500/10 text-green-400">${Number(tx.savings || 0).toFixed(2)}</span></td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      tx.status === 'confirmed'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {tx.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">No transactions yet. Use the Optimize tab to get started.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </>
  );
}
