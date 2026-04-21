import React, { useState, useEffect } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { useNotification } from "@/context/NotificationContext";
import { hasAgentID, mintAgentID, getAgentIdentity } from "@/utils/agentId";

export default function AgentIDCard() {
  const { signer, isConnected, address } = useWeb3();
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
      await mintAgentID(signer);
      await fetchAgent();
    } catch (e: any) {
      addNotification(`Mint failed: ${e.message}`, "error");
    } finally { setMinting(false); }
  };

  if (!isConnected) return null;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-900/20 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <span className="font-bold text-sm">0G Agent ID</span>
          <span className="text-xs bg-gray-900/20 px-2 py-0.5 rounded-full">Soulbound</span>
        </div>
        {agent && (
          <a href={agent.explorerUrl} target="_blank" rel="noreferrer"
            className="text-xs text-white/70 hover:text-white underline">
            View on ChainScan ↗
          </a>
        )}
      </div>

      {loading ? (
        <p className="text-white/60 text-sm">Loading agent identity...</p>
      ) : agent ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-900/10 rounded-xl p-3 text-center">
              <p className="text-xs text-white/60 mb-1">Reputation</p>
              <p className="text-2xl font-bold">{agent.reputation}</p>
            </div>
            <div className="bg-gray-900/10 rounded-xl p-3 text-center">
              <p className="text-xs text-white/60 mb-1">Optimizations</p>
              <p className="text-2xl font-bold">{agent.reputation}</p>
            </div>
            <div className="bg-gray-900/10 rounded-xl p-3 text-center">
              <p className="text-xs text-white/60 mb-1">Since</p>
              <p className="text-sm font-bold">{new Date(agent.mintedAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="bg-gray-900/10 rounded-xl p-3">
            <p className="text-xs text-white/60 mb-1">Memory Root (0G Storage KV)</p>
            <p className="text-xs font-mono text-white/80 truncate">{agent.memoryRoot}</p>
          </div>
          <div className="bg-gray-900/10 rounded-xl p-3">
            <p className="text-xs text-white/60 mb-1">Model Hash (TF Weights)</p>
            <p className="text-xs font-mono text-white/80 truncate">{agent.modelHash}</p>
          </div>
          <p className="text-xs text-white/50 text-center">
            This agent identity is non-transferable and lives on 0G Chain
          </p>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-white/70 text-sm mb-4">
            Mint your soulbound Agent ID to unlock persistent memory and reputation tracking on 0G Chain.
          </p>
          <button onClick={handleMint} disabled={minting}
            className="px-6 py-2.5 bg-gray-900 text-blue-600 font-bold rounded-xl hover:bg-gray-900/90 transition-colors disabled:opacity-50">
            {minting ? "Minting..." : "Mint Agent ID"}
          </button>
        </div>
      )}
    </div>
  );
}
