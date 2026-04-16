import React, { useEffect, useState } from 'react';

const AIDecisionFeed = () => {
  const [logs, setLogs] = useState<{ id: number; message: string; type: 'info' | 'success' | 'process' }[]>([]);

  const initialLogs = [
    { id: 1, message: "AI Agent Initialized on 0G Compute", type: 'info' as const },
    { id: 2, message: "Scanning decentralized liquidity pools...", type: 'process' as const },
    { id: 3, message: "Optimal route identified via 0G Flash Route", type: 'success' as const }
  ];

  useEffect(() => {
    setLogs(initialLogs);
    
    // Simulate real-time background activity
    const interval = setInterval(() => {
      const messages = [
        "Analyzing 0G Chain network congestion...",
        "Updating gas fee prediction model...",
        "Syncing with decentralized storage...",
        "Verifying AI proof on 0G Compute...",
        "Optimization heuristics updated.",
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      
      setLogs(prev => [
        { id: Date.now(), message: randomMsg, type: Math.random() > 0.3 ? 'info' : 'process' },
        ...prev.slice(0, 4)
      ]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 rounded-2xl shadow-xl border border-blue-900/30 p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          AI Live Decision Path
        </h3>
        <span className="text-[10px] text-blue-400 font-mono">NODE: 0G-USA-01</span>
      </div>

      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start animate-fade-in">
            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full mr-3 shrink-0 ${
              log.type === 'success' ? 'bg-green-500' : log.type === 'process' ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'
            }`}></div>
            <p className={`text-[11px] font-mono leading-relaxed ${
              log.type === 'success' ? 'text-green-400' : log.type === 'process' ? 'text-blue-300' : 'text-gray-400'
            }`}>
              <span className="text-gray-600 mr-2">[{new Date(log.id).toLocaleTimeString([], {hour12: false})}]</span>
              {log.message}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/5">
        <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
          <span>THROUGHPUT: 4.2k tx/s</span>
          <span className="text-green-500">Latency: 0.2ms</span>
        </div>
      </div>
    </div>
  );
};

export default AIDecisionFeed;
