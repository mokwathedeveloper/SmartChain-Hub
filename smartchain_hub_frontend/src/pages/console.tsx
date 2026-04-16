import Head from "next/head";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const ConsolePage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<{ id: number; msg: string; type: 'wasm' | 'storage' | 'network' }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const systemLogs: { msg: string; type: 'wasm' | 'storage' | 'network' }[] = [
        { msg: "WASM: Executing verification proof...", type: 'wasm' },
        { msg: "STORAGE: Sharding metadata for user session", type: 'storage' },
        { msg: "NETWORK: Syncing with 0G Newton Node...", type: 'network' },
        { msg: "WASM: Rust layer optimization check PASSED", type: 'wasm' },
        { msg: "STORAGE: Merkle root generated for storage sharding", type: 'storage' }
      ];
      const random = systemLogs[Math.floor(Math.random() * systemLogs.length)];
      setLogs(prev => [{ id: Date.now(), ...random }, ...prev.slice(0, 14)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Developer Console | SmartChain Hub</title>
      </Head>

      <div className="space-y-8 animate-fade-in">
        <div className="bg-gray-900 rounded-[2.5rem] p-10 border border-white/5 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">System Console</h2>
              <p className="text-sm text-gray-500 font-bold">Real-time modular layer activity.</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Node Online
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
            <div className="lg:col-span-3 bg-black/50 rounded-3xl p-8 font-mono text-[11px] leading-relaxed h-[500px] overflow-y-auto border border-white/5 custom-scrollbar">
              {logs.map(log => (
                <div key={log.id} className="mb-2 flex items-start animate-fade-in">
                  <span className="text-gray-600 shrink-0 mr-4">[{new Date(log.id).toLocaleTimeString()}]</span>
                  <span className={`shrink-0 mr-4 px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    log.type === 'wasm' ? 'bg-orange-500/20 text-orange-400' : 
                    log.type === 'storage' ? 'bg-blue-500/20 text-blue-400' : 
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-gray-300">{log.msg}</span>
                </div>
              ))}
              <div className="animate-pulse text-electric-purple mt-4">_</div>
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
                <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">Storage Status</p>
                <div className="flex items-center justify-between text-white">
                  <span className="text-xs font-bold">Redundancy</span>
                  <span className="text-xs font-mono text-blue-400">3x Shards</span>
                </div>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">AI Engine</p>
                <div className="flex items-center justify-between text-white">
                  <span className="text-xs font-bold">Framework</span>
                  <span className="text-xs font-mono text-purple-400">TensorFlow 2.16</span>
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
