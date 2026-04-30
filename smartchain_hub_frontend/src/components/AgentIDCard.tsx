import React, { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "@/context/Web3Context";
import { useNotification } from "@/context/NotificationContext";
import { hasAgentID, mintAgentID, getAgentIdentity, resetMint } from "@/utils/agentId";

export default function AgentIDCard() {
  const { signer, isConnected, address, connectWallet } = useWeb3();
  const { addNotification } = useNotification();

  const [agent, setAgent]         = useState<any>(null);
  const [loading, setLoading]     = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [minting, setMinting]     = useState(false);
  const [resetting, setResetting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Refs to avoid stale closures and prevent duplicate fetches
  const signerRef   = useRef(signer);
  const fetchingRef = useRef(false);   // guard: only one fetch in-flight at a time
  const addressRef  = useRef<string | null>(null); // track which address we fetched for
  signerRef.current = signer;

  // ready = wallet connected AND signer available — no blank gap between the two
  const ready = isConnected && !!signer;

  const fetchAgent = useCallback(async (isRefresh = false) => {
    const s = signerRef.current;
    if (!s || fetchingRef.current) return;
    fetchingRef.current = true;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const exists = await hasAgentID(s);
      setAgent(exists ? await getAgentIdentity(s) : null);
    } catch (err) {
      // On error during refresh keep existing data; on first load leave agent null
      // hasFetched still set true in finally so UI shows mint button as fallback
      console.error('[AgentIDCard] fetchAgent error:', err);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
      setHasFetched(true); // always mark fetched so UI never stays blank
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!signer) {
      // True disconnect — full reset
      setAgent(null);
      setHasFetched(false);
      setLoading(false);
      fetchingRef.current = false;
      addressRef.current  = null;
      return;
    }
    // Signer available — only fetch if address changed (guards against signer object recreation)
    signer.getAddress().then((addr) => {
      const normalized = addr.toLowerCase();
      if (addressRef.current === normalized) return;
      addressRef.current = normalized;
      fetchAgent(false);
    }).catch(() => {});
  }, [signer, fetchAgent]);

  const handleMint = async () => {
    if (!signer) return;
    setMinting(true);
    try {
      const ethersProvider = signer.provider as ethers.Provider;
      const addr = await signer.getAddress();
      const balance = await ethersProvider.getBalance(addr);
      // Need at least 0.001 A0GI to cover gas
      if (balance < ethers.parseEther("0.001")) {
        addNotification("Insufficient A0GI — get tokens from hub.0g.ai/faucet", "error");
        return;
      }
      await mintAgentID(signer);
      addressRef.current = null;
      await fetchAgent(true);
      addNotification("Agent ID minted successfully! ✓", "success");
    } catch (e: any) {
      const msg = (e.reason || e.data?.message || e.message || "").toLowerCase();
      if (msg.includes("already minted")) {
        // Agent exists on-chain but UI hasn't fetched it yet — just refresh
        addressRef.current = null;
        await fetchAgent(true);
        addNotification("Agent ID already exists — loaded! ✓", "success");
      } else if (!msg.includes("denied") && !msg.includes("rejected") && !msg.includes("user rejected")) {
        addNotification(`Mint failed: ${e.reason || e.message}`, "error");
      }
    } finally {
      setMinting(false);
    }
  };

  const handleReset = async () => {
    if (!signer) return;
    if (!window.confirm("Reset your Agent ID? This will delete it on-chain so you can re-mint.")) return;
    setResetting(true);
    try {
      const addr = await signer.getAddress();
      await resetMint(signer, addr);
      addressRef.current = null;
      setAgent(null);
      setHasFetched(false);
      await fetchAgent(false);
      addNotification("Agent ID reset — you can now re-mint ✓", "success");
    } catch (e: any) {
      const msg = e.reason || e.message || "";
      if (!msg.toLowerCase().includes("denied") && !msg.toLowerCase().includes("rejected")) {
        addNotification(`Reset failed: ${msg}`, "error");
      }
    } finally {
      setResetting(false);
    }
  };

  const handleRefresh = async () => {
    await fetchAgent(true);
    addNotification("Agent data refreshed ✓", "success");
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gray-900 shadow-2xl">
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">0G Agent ID</p>
            <p className="text-[10px] text-gray-500 mt-0.5">On-chain sovereign identity</p>
          </div>
          <span className="ml-1 text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
            Soulbound
          </span>
        </div>
        {agent?.explorerUrl && (
          <a href={agent.explorerUrl} target="_blank" rel="noreferrer"
            className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
            ChainScan
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        )}
      </div>

      {/* Body */}
      <div className="relative px-6 py-5">

        {/* NOT CONNECTED or signer not yet ready */}
        {!ready && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-800 border border-white/[0.06] flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-white">Wallet not connected</p>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">Connect your wallet to view or mint your soulbound Agent ID on 0G Chain.</p>
            <button onClick={connectWallet}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20">
              Connect Wallet
            </button>
          </div>
        )}

        {/* LOADING — spinner while fetching, never shown on refresh */}
        {ready && loading && (
          <div className="flex items-center gap-3 py-6 justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
            <p className="text-sm text-gray-500">Loading agent identity...</p>
          </div>
        )}

        {/* AGENT EXISTS — stays visible during refresh */}
        {ready && hasFetched && agent && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Reputation",    value: agent.reputation },
                { label: "Optimizations", value: agent.reputation },
                { label: "Since",         value: new Date(agent.mintedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3 text-center">
                  <p className="text-[10px] text-gray-500 mb-1.5 uppercase tracking-wider">{label}</p>
                  <p className="text-xl font-bold text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3.5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Memory Root (0G KV)</p>
              <p className="text-xs font-mono text-gray-300 truncate">{agent.memoryRoot}</p>
            </div>

            <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3.5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Model Hash (TF Weights)</p>
              <p className="text-xs font-mono text-gray-300 truncate">{agent.modelHash}</p>
            </div>

            <div className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
              agent.teeVerified ? 'bg-emerald-500/[0.06] border-emerald-500/20' : 'bg-blue-500/[0.06] border-blue-500/20'
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${agent.teeVerified ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`}>
                  <svg className={`w-3.5 h-3.5 ${agent.teeVerified ? 'text-emerald-400' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  {agent.teeVerified ? (
                    <>
                      <p className="text-xs font-semibold text-emerald-400">✓ Verified inside TEE — {agent.teeMode || 'TeeML'}</p>
                      <p className="text-[10px] text-gray-500 truncate">Provider: {agent.providerId}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-semibold text-blue-400">✓ AI Inference Active — TensorFlow 2.16</p>
                      <p className="text-[10px] text-gray-500">Routes to 0G Compute TeeML when broker available</p>
                    </>
                  )}
                </div>
              </div>
              <span className={`shrink-0 ml-3 text-[10px] font-bold text-white px-2.5 py-1 rounded-lg ${agent.teeVerified ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                {agent.teeVerified ? '0G Compute' : 'Local AI'}
              </span>
            </div>

            <p className="text-[10px] text-gray-600 text-center pt-1">
              Non-transferable · Lives on 0G Chain · Updates on every optimization
            </p>

            {/* Refresh + Reset row */}
            <div className="flex gap-2">
              <button onClick={handleRefresh} disabled={refreshing || resetting}
                className="flex-1 flex items-center justify-center gap-2 py-2 border border-white/[0.06] rounded-xl text-xs text-gray-500 hover:text-gray-300 hover:border-white/[0.12] transition-all disabled:opacity-50">
                {refreshing ? (
                  <><div className="w-3 h-3 rounded-full border-2 border-gray-500/30 border-t-gray-400 animate-spin" />Refreshing...</>
                ) : (
                  <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>Refresh</>
                )}
              </button>
              <button onClick={handleReset} disabled={resetting || refreshing}
                className="flex items-center justify-center gap-1.5 px-4 py-2 border border-red-500/20 rounded-xl text-xs text-red-400 hover:text-red-300 hover:border-red-500/40 transition-all disabled:opacity-50">
                {resetting ? (
                  <><div className="w-3 h-3 rounded-full border-2 border-red-500/30 border-t-red-400 animate-spin" />Resetting...</>
                ) : (
                  <>Reset &amp; Re-mint</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* NO AGENT — MINT */}
        {ready && hasFetched && !agent && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-1">No Agent ID yet</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Mint your soulbound NFT on 0G Chain. Non-transferable. Stores your model hash, memory root, and reputation.
              </p>
            </div>
            <button onClick={handleMint} disabled={minting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20">
              {minting ? (
                <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Minting...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                </svg>Mint Agent ID</>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
