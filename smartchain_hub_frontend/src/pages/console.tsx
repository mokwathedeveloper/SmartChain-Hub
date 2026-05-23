import Head from "next/head";
import { useState, useEffect, useRef } from "react";

const SYSTEM_LOGS: { msg: string; type: 'wasm' | 'storage' | 'network' }[] = [
  { msg: "WASM: Executing verification proof for agent optimization...", type: 'wasm' },
  { msg: "STORAGE: Sharding metadata for user session on 0G KV layer", type: 'storage' },
  { msg: "NETWORK: Syncing with 0G Galileo node (evmrpc-testnet.0g.ai)", type: 'network' },
  { msg: "WASM: Rust layer optimization check PASSED", type: 'wasm' },
  { msg: "STORAGE: Merkle root generated for 0G Storage Log shard", type: 'storage' },
  { msg: "NETWORK: DA blob anchored on 0G Data Availability layer", type: 'network' },
  { msg: "WASM: TensorFlow 2.16 inference pipeline initialised", type: 'wasm' },
  { msg: "STORAGE: Agent memory root committed via hydrateAgentMemory()", type: 'storage' },
  { msg: "NETWORK: TEE attestation proof received from 0G Compute node", type: 'network' },
  { msg: "WASM: ZK commitment SHA-256 anchored on-chain", type: 'wasm' },
  { msg: "STORAGE: 0G Storage Log MemData upload complete — rootHash stored", type: 'storage' },
  { msg: "NETWORK: SmartChainAgentID.updateMemory() — reputation++", type: 'network' },
];

const ConsolePage = () => {
  const [logs, setLogs] = useState<{ id: number; msg: string; type: 'wasm' | 'storage' | 'network' }[]>([]);
  const cycleRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const entry = SYSTEM_LOGS[cycleRef.current % SYSTEM_LOGS.length];
      cycleRef.current += 1;
      setLogs(prev => [{ id: Date.now(), ...entry }, ...prev.slice(0, 14)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Developer Console | SmartChain Hub</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="space-y-6 animate-fade-in">
        <div className="bg-gray-900 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 lg:p-10 border border-white/5 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-10 relative z-10">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">System Console</h2>
              <p className="text-sm text-gray-500 font-bold">Live 0G modular layer activity feed.</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Node Online
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 relative z-10">
            <div className="lg:col-span-3 bg-black/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 font-mono text-[11px] leading-relaxed h-64 sm:h-96 lg:h-[500px] overflow-y-auto border border-white/5 scrollbar-hide">
              {logs.map(log => (
                <div key={log.id} className="mb-2 flex items-start animate-fade-in">
                  <span className="text-gray-600 shrink-0 mr-4">[{new Date(log.id).toLocaleTimeString()}]</span>
                  <span className={`shrink-0 mr-4 px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    log.type === 'wasm'    ? 'bg-orange-500/20 text-orange-400' :
                    log.type === 'storage' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-gray-300">{log.msg}</span>
                </div>
              ))}
              <div className="animate-pulse text-blue-400 mt-4">_</div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">WASM Status</p>
                <div className="flex items-center justify-between text-white">
                  <span className="text-xs font-bold">Runtime</span>
                  <span className="text-xs font-mono text-orange-400">Cosmwasm 1.5</span>
                </div>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">0G Storage</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-white">
                    <span className="text-xs font-bold">Log Layer</span>
                    <span className="text-xs font-mono text-blue-400">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <span className="text-xs font-bold">KV Layer</span>
                    <span className="text-xs font-mono text-blue-400">Active</span>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">AI Engine</p>
                <div className="flex items-center justify-between text-white">
                  <span className="text-xs font-bold">Framework</span>
                  <span className="text-xs font-mono text-purple-400">TensorFlow 2.16</span>
                </div>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">0G DA Layer</p>
                <div className="flex items-center justify-between text-white">
                  <span className="text-xs font-bold">Disperser</span>
                  <span className="text-xs font-mono text-cyan-400">da-rpc-testnet.0g.ai</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConsolePage;
