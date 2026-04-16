# SmartChain Hub | Autonomous AI Commerce on 0G Chain

SmartChain Hub is a decentralized platform that revolutionizes digital commerce by integrating high-performance **AI Agents** with modular **Blockchain infrastructure**. Built for the **0G Newton Testnet**, it automates transaction optimization, secures data through sharded storage, and distributes revenue via verifiable smart contracts.

## 🚀 Key Features

- **AI-Driven Transaction Optimization**: Powered by a **TensorFlow v2** neural network that predicts optimal execution paths based on network congestion and user priority.
- **Modular Blockchain Security**: Multi-layered execution using **Solidity (EVM)** for state management and **Rust/Wasm** for high-performance proof verification.
- **Decentralized Metadata Storage**: Full integration with **0G Storage** logic, sharding transaction metadata into redundant chunks before on-chain finality.
- **Automated Revenue Sharing**: Verifiable fee distribution (10% back to community) managed by secure, reentrancy-protected smart contracts.
- **High-Fidelity UX**: Modern dashboard with glassmorphism, visual decision trees, and real-time system consoles.

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Ethers.js, Plus Jakarta Sans.
- **Backend/Auth**: Supabase (PostgreSQL), Real-time Subscriptions, RLS Policies.
- **Intelligence**: Python Flask API, TensorFlow v2.16, Heuristic Multi-Criteria Optimization.
- **Smart Contracts**: Solidity 0.8.20 (Hardhat), CosmWasm (Rust Layer).
- **Infrastructure**: 0G Newton Testnet, Docker & Docker Compose.

## 🏗️ Architecture

1. **Inference Layer (Python/TF)**: Analyzes the transaction matrix and predicts savings.
2. **Verification Layer (Rust/Wasm)**: Validates the AI's logic proofs with high efficiency.
3. **Storage Layer (0G Storage)**: Shards and stores immutable metadata.
4. **Settlement Layer (Solidity)**: Finalizes the transaction and updates user state.

## 🚦 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 20+
- Docker & Docker Compose (optional)

### 1. Launch the AI Agent
```bash
cd ai-agent
pip install -r requirements.txt --break-system-packages
python3 server/app.py
```

### 2. Launch the Web App
```bash
cd smartchain_hub_frontend
npm install
npm run dev
```

### 3. Deploy Smart Contracts
```bash
cd blockchain
npm install
npx hardhat run scripts/deploy.js --network og_newton
```

## 📜 Smart Contracts
- **SmartChainTransaction**: Handles validation and on-chain recording.
- **SmartChainRevenue**: Manages automated fee distribution.
- **Rust Verifier**: High-performance computational layer.

## ⚖️ License
MIT - Developed for the 0G Newton Hackathon.
