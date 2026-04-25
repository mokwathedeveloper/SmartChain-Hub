import React, { useState, useEffect } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { useNotification } from "@/context/NotificationContext";
import { hasAgentID, mintAgentID, getAgentIdentity } from "@/utils/agentId";

export default function AgentIDCard() {
  const { signer, isConnected, address, connectWallet } = useWeb3();
  const { addNotification } = useNotification();
  const [agent, setAgent]     = useState<any>(null);
  const [minting, setMinting] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAgent = async () => {
    if (!signer) return;
    setLoading(true);
    try {
      const exists = await hasAgentID(signer);
      if (exists) setAgent(await getAgentIdentity(signer));
      else setAgent(null);
    } catch (e: any) {
      console.warn("Agent ID fetch failed:", e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAgent(); }, [signer]);

  const handleMint = async () => {
    if (!signer) return;
    setMinting(true);
    try {
      // Check balance before attempting mint to give clear error
      const provider = (signer as any).provider;
      const addr = await signer.getAddress();
      const balance = await provider.getBalance(addr);
      if (balance === 0n) {
        addNotification("Insufficient A0GI - get testnet tokens from hub.0g.ai/faucet", "error");
        return;
      }
      await mintAgentID(signer);
      await fetchAgent();
      addNotification("Agent ID minted successfully!", "success");
    } catch (e: any) {
      const msg = e.reason || e.message || "Mint failed";
      addNotification(`Mint failed: ${msg}`, "error");
    } finally { setMinting(false); }
  };

  /* ── shared card shell ── */
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gray-900 shadow-2xl">

      {/* ambient glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* ── top bar ── */}
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

      {/* ── body ── */}
      <div className="relative px-6 py-5">

        {/* NOT CONNECTED */}
        {!isConnected && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-800 border border-white/[0.06] flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-1">Wallet not connected</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Connect your wallet to view or mint your soulbound Agent ID on 0G Chain.
              </p>
            </div>
            <button onClick={connectWallet}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
              Connect Wallet
            </button>
          </div>
        )}

        {/* LOADING */}
        {isConnected && loading && (
          <div className="flex items-center gap-3 py-6 justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
            <p className="text-sm text-gray-500">Loading agent identity...</p>
          </div>
        )}

        {/* AGENT EXISTS */}
        {isConnected && !loading && agent && (
          <div className="space-y-4">
            {/* stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Reputation",    value: agent.reputation },
                { label: "Optimizations", value: agent.reputation },
                { label: "Since",         value: new Date(Number(agent.mintedAt) * 1000).toLocaleDateString("en-US", { month: "short", year: "numeric" }) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3 text-center">
                  <p className="text-[10px] text-gray-500 mb-1.5 uppercase tracking-wider">{label}</p>
                  <p className="text-xl font-bold text-white">{value}</p>
                </div>
              ))}
            </div>

            {/* memory root */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3.5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Memory Root (0G KV)</p>
              <p className="text-xs font-mono text-gray-300 truncate">{agent.memoryRoot}</p>
            </div>

            {/* model hash */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3.5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Model Hash (TF Weights)</p>
              <p className="text-xs font-mono text-gray-300 truncate">{agent.modelHash}</p>
            </div>

            {/* TEE badge */}
            {agent.teeVerified && (
              <div className="flex items-center justify-between rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-emerald-400">✓ Verified inside TEE — {agent.teeMode || "TeeML"}</p>
                    <p className="text-[10px] text-gray-500 truncate">Provider: {agent.providerId}</p>
                    {agent.teeProof && (
                      <p className="text-[10px] font-mono text-gray-600 truncate">Proof: {agent.teeProof.slice(0, 18)}...</p>
                    )}
                  </div>
                </div>
                <span className="shrink-0 ml-3 text-[10px] font-bold text-white bg-blue-600 px-2.5 py-1 rounded-lg">
                  0G Compute
                </span>
              </div>
            )}

            <p className="text-[10px] text-gray-600 text-center pt-1">
              Non-transferable · Lives on 0G Chain · Updates on every optimization
            </p>
          </div>
        )}

        {/* NO AGENT — MINT */}
        {isConnected && !loading && !agent && (
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
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20">
              {minting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Minting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Mint Agent ID
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
