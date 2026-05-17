import Head from "next/head";
import { useState } from "react";

const sections = [
  { id: "quickstart", label: "Quick Start" },
  { id: "contracts", label: "Smart Contracts" },
  { id: "storage", label: "0G Storage" },
  { id: "compute", label: "0G Compute" },
  { id: "agentid", label: "Agent ID" },
  { id: "env", label: "Environment" },
];

const CodeBlock = ({ code, lang = "bash" }: { code: string; lang?: string }) => (
  <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
      <span className="text-xs text-gray-500 font-mono">{lang}</span>
      <button className="text-xs text-gray-600 hover:text-gray-400">copy</button>
    </div>
    <pre className="p-4 text-sm text-gray-300 font-mono overflow-x-auto leading-relaxed whitespace-pre">{code}</pre>
  </div>
);

export default function Documentation() {
  const [active, setActive] = useState("quickstart");

  return (
    <>
      <Head><title>Documentation | SmartChain Hub</title></Head>

      <div className="bg-gray-950 min-h-screen">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-950 sticky top-16 z-40">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
              {sections.map(s => (
                <button key={s.id} onClick={() => setActive(s.id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    active === s.id ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 max-w-6xl py-12">
          <div className="flex gap-12">
            {/* Sidebar */}
            <aside className="hidden lg:block w-52 shrink-0">
              <div className="sticky top-32 space-y-1">
                <p className="text-xs text-gray-600 font-bold uppercase tracking-widest mb-3">Contents</p>
                {sections.map(s => (
                  <button key={s.id} onClick={() => setActive(s.id)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      active === s.id ? "text-blue-400 bg-blue-500/10" : "text-gray-500 hover:text-gray-300"
                    }`}>
                    {s.label}
                  </button>
                ))}
                <div className="pt-4 border-t border-gray-800 mt-4">
                  <a href="https://github.com/mokwathedeveloper/SmartChain-Hub" target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                  <a href="https://docs.0g.ai" target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-400 mt-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    0G Docs
                  </a>
                </div>
              </div>
            </aside>

            {/* Content */}
            <main className="flex-1 min-w-0 space-y-10">

              {active === "quickstart" && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-3xl font-black text-white mb-3">Quick Start</h1>
                    <p className="text-gray-400">Get SmartChain Hub running locally in under 5 minutes.</p>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-3">Prerequisites</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      {[["Node.js","v20+"],["Python","3.12+"],["Git","latest"]].map(([t,v]) => (
                        <div key={t} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                          <div className="text-white font-bold text-sm">{t}</div>
                          <div className="text-gray-500 text-xs">{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-3">1. Clone & Install</h2>
                    <CodeBlock lang="bash" code={`git clone https://github.com/mokwathedeveloper/SmartChain-Hub
cd SmartChain-Hub

# Frontend
cd smartchain_hub_frontend
cp .env.local.example .env.local
npm install
npm run dev   # → http://localhost:3000`}/>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-3">2. AI Agent</h2>
                    <CodeBlock lang="bash" code={`cd ai-agent
cp .env.example .env
pip install -r requirements.txt
python3 server/app.py   # → http://localhost:5000`}/>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-3">3. Deploy Contracts</h2>
                    <CodeBlock lang="bash" code={`cd blockchain
cp .env.example .env
# Set PRIVATE_KEY to funded 0G wallet
npm install
npx hardhat run scripts/deploy.js --network og_newton`}/>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-3">4. Supabase Setup</h2>
                    <p className="text-gray-400 text-sm mb-3">Run these SQL files in your Supabase SQL Editor:</p>
                    <CodeBlock lang="sql" code={`-- Run in order:
-- 1. docs/backend/supabase_schema.sql
-- 2. docs/backend/supabase_migration_002.sql`}/>
                  </div>
                </div>
              )}

              {active === "contracts" && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-3xl font-black text-white mb-3">Smart Contracts</h1>
                    <p className="text-gray-400">4 contracts deployed on 0G Galileo Testnet (chainId 16602).</p>
                  </div>
                  {[
                    {
                      name: "SmartChainAgentID",
                      addr: "0x69C619374c6B901b99941Df7238fceb80d7DCd08",
                      desc: "Soulbound NFT — one per wallet. Stores memoryRoot, modelHash, reputation.",
                      abi: `// Key functions
function mintAgentID(bytes32 modelHash) external
function updateMemory(bytes32 newMemoryRoot, uint256 savingsWei) external
function getAgent(address owner) external view returns (AgentIdentity memory)
function hasMinted(address) external view returns (bool)`,
                    },
                    {
                      name: "SmartChainPayments",
                      addr: "0x540aFf6B167F8B5889d852d124C545F5f876A7eB",
                      desc: "Send A0GI (0.5% fee), stake (5% APY), claim earnings.",
                      abi: `// Key functions
function sendFunds(address payable _to, string calldata _memo) external payable
function stake() external payable
function unstake() external
function claimEarnings() external
function getStake(address user) external view returns (uint256 amount, uint256 reward)`,
                    },
                  ].map(c => (
                    <div key={c.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h2 className="text-white font-bold text-lg">{c.name}</h2>
                          <p className="text-gray-500 text-sm mt-1">{c.desc}</p>
                        </div>
                        <a href={`https://scan-testnet.0g.ai/address/${c.addr}`} target="_blank" rel="noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 shrink-0 ml-4">
                          ChainScan ↗
                        </a>
                      </div>
                      <div className="text-xs font-mono text-gray-600 mb-3 bg-gray-950 px-3 py-2 rounded-lg">{c.addr}</div>
                      <CodeBlock lang="solidity" code={c.abi}/>
                    </div>
                  ))}
                </div>
              )}

              {active === "storage" && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-3xl font-black text-white mb-3">0G Storage</h1>
                    <p className="text-gray-400">Dual-layer storage: Log layer for immutable receipts, KV layer for agent memory.</p>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-3">Upload to Log Layer</h2>
                    <p className="text-gray-400 text-sm mb-3">Called via <code className="text-blue-400 bg-blue-500/10 px-1 rounded">/api/storage-upload</code> server route:</p>
                    <CodeBlock lang="typescript" code={`// Client-side — calls server route
const result = await storageService.uploadWithProof({
  user_id: userId,
  amount: 1000,
  fee: 3.00,
  savings: 15.76,
  route: "0G Chain Flash Route",
  timestamp: Date.now(),
});

console.log(result.rootHash);      // Merkle root
console.log(result.txHash);        // Storage tx hash
console.log(result.storageScanUrl); // Explorer link`}/>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-3">Agent Memory (KV Layer)</h2>
                    <CodeBlock lang="typescript" code={`// Save memory (writes to 0G KV via /api/agent-memory)
await saveAgentMemory({
  userId: "user-123",
  preferredPriority: "efficiency",
  lastAmount: 1000,
  lastRoute: "0G Chain Flash Route",
  totalOptimizations: 42,
  totalSavings: 630.5,
  updatedAt: Date.now(),
});

// Load memory (reads from localStorage, KV as backup)
const mem = loadAgentMemory("user-123");
console.log(mem?.preferredPriority); // "efficiency"`}/>
                  </div>
                </div>
              )}

              {active === "compute" && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-3xl font-black text-white mb-3">0G Compute</h1>
                    <p className="text-gray-400">TEE-verified AI inference via 0G Compute broker. Falls back to local TensorFlow.</p>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-3">Optimize a Transaction</h2>
                    <CodeBlock lang="bash" code={`curl -X POST http://localhost:5000/optimize \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 1000, "priority": "efficiency"}'`}/>
                    <div className="mt-3">
                      <CodeBlock lang="json" code={`{
  "fee": 3.00,
  "savings": 15.76,
  "route": "0G Chain Flash Route",
  "confidence": 94.0,
  "risk": "Very Low",
  "congestion": 15,
  "tee_verified": true,
  "tee_mode": "TeeML",
  "tee_proof": "0x4a7f2b9c...",
  "provider_id": "0g-compute-node-sg-01",
  "ml_engine": "0G Compute / llama-3.1-8b-instruct"
}`}/>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-3">Environment Variables</h2>
                    <CodeBlock lang="bash" code={`# ai-agent/.env
OG_COMPUTE_PRIVATE_KEY=0x...  # Funded wallet
OG_COMPUTE_RPC=https://evmrpc-testnet.0g.ai
OG_COMPUTE_BROKER_URL=https://broker.0g.ai
OG_COMPUTE_MODEL=llama-3.1-8b-instruct`}/>
                  </div>
                </div>
              )}

              {active === "agentid" && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-3xl font-black text-white mb-3">Agent ID</h1>
                    <p className="text-gray-400">Soulbound NFT on 0G Chain. One per wallet. Non-transferable.</p>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-3">Mint Agent ID</h2>
                    <CodeBlock lang="typescript" code={`import { mintAgentID, MODEL_HASH } from "@/utils/agentId";

// Mint soulbound Agent ID (one per wallet)
const txHash = await mintAgentID(signer);
console.log("Minted:", txHash);`}/>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-3">Update Memory Root</h2>
                    <CodeBlock lang="typescript" code={`import { updateAgentMemory } from "@/utils/agentId";

// Called after every optimization confirm
// Commits 0G Storage KV Merkle root on-chain
await updateAgentMemory(
  signer,
  storageResult.rootHash,  // from 0G Storage upload
  parseFloat(result.savings)
);`}/>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-3">Get Agent Identity</h2>
                    <CodeBlock lang="typescript" code={`import { getAgentIdentity } from "@/utils/agentId";

const agent = await getAgentIdentity(signer);
// {
//   exists: true,
//   memoryRoot: "0x7f3a9b2c...",
//   modelHash: "0x9d8c7b6a...",
//   reputation: 42,
//   totalSavings: 630500000000000,
//   mintedAt: 1776295612000,
//   explorerUrl: "https://scan-testnet.0g.ai/..."
// }`}/>
                  </div>
                </div>
              )}

              {active === "env" && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-3xl font-black text-white mb-3">Environment Variables</h1>
                    <p className="text-gray-400">All required environment variables for local and production deployment.</p>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-3">Frontend (.env.local)</h2>
                    <CodeBlock lang="bash" code={`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_CONTRACT_ADDRESS=0xf95A1610be22046c334E3bD1b11D2B88519E6C52
NEXT_PUBLIC_PAYMENTS_CONTRACT=0x540aFf6B167F8B5889d852d124C545F5f876A7eB
NEXT_PUBLIC_AGENT_ID_CONTRACT=0x69C619374c6B901b99941Df7238fceb80d7DCd08
NEXT_PUBLIC_STORAGE_PRIVATE_KEY=0x...  # 0G Storage wallet
STORAGE_PRIVATE_KEY=0x...              # Server-side storage key
NEXT_PUBLIC_AI_AGENT_URL=http://localhost:5000
NEXT_PUBLIC_CHAIN=og_newton`}/>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-3">AI Agent (.env)</h2>
                    <CodeBlock lang="bash" code={`OG_COMPUTE_PRIVATE_KEY=0x...
OG_COMPUTE_RPC=https://evmrpc-testnet.0g.ai
OG_COMPUTE_BROKER_URL=https://broker.0g.ai
OG_COMPUTE_MODEL=llama-3.1-8b-instruct
FLASK_ENV=production
PORT=5000`}/>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-3">Blockchain (.env)</h2>
                    <CodeBlock lang="bash" code={`PRIVATE_KEY=0x...  # Funded deployer wallet`}/>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <p className="text-yellow-400 text-sm font-semibold mb-1">⚠️ Security Note</p>
                    <p className="text-yellow-400/70 text-xs">Never commit .env files to git. All .env files are in .gitignore. Use a dedicated low-value wallet for STORAGE_PRIVATE_KEY.</p>
                  </div>
                </div>
              )}

            </main>
          </div>
        </div>
      </div>
    </>
  );
}
