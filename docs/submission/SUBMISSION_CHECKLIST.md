# SmartChain Hub — Hackathon Submission Checklist

## ✅ Completed
- [x] Project built and tested
- [x] 0G Storage SDK integrated (`@0glabs/0g-ts-sdk`)
- [x] 0G Compute integration (TeeML inference)
- [x] Smart contracts written (SmartChainTransaction + SmartChainRevenue)
- [x] README with architecture diagram + reproduction steps
- [x] GitHub repo with meaningful commits

## ❌ TODO Before May 16 Deadline

### 1. Deploy Contracts to 0G Mainnet
```bash
cd blockchain
export PRIVATE_KEY=your_wallet_private_key
npx hardhat run scripts/deploy.js --network og_mainnet
```
Then update `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=<deployed_address>
NEXT_PUBLIC_CHAIN=og_mainnet
```
Get your ChainScan link: `https://chainscan.0g.ai/address/<deployed_address>`

### 2. Post on X (MANDATORY)
Copy this post and publish it:

---
🚀 Introducing **SmartChain Hub** — AI-powered transaction optimization on @0G_labs

✅ 0G Compute for TEE-verified AI inference
✅ 0G Storage for immutable transaction receipts  
✅ 0G Chain smart contracts for on-chain settlement

Built for the #0GHackathon 🔗 [your_demo_link]

#BuildOn0G @0G_labs @0g_CN @0g_Eco @HackQuest_
---

Submit the X post link on HackQuest.

### 3. Record Demo Video (≤3 minutes)
Script:
1. (0:00–0:20) Show login → dashboard with live Supabase data
2. (0:20–1:00) Go to Transactions → enter amount → click Optimize → show **TEE verified badge**
3. (1:00–1:30) Click Confirm → show tx saved to Supabase + console log with 0G Storage root hash
4. (1:30–2:00) Open ChainScan → show `TransactionRecorded` event on 0G Mainnet
5. (2:00–2:30) Show Revenue Sharing page with donut chart
6. (2:30–3:00) Show README architecture diagram

Upload to YouTube/Loom and submit link on HackQuest.

### 4. Deploy Frontend
```bash
cd smartchain_hub_frontend
npx vercel --prod
```
Submit the Vercel URL as your demo link.

### 5. HackQuest Submission Fields
- **Project name**: SmartChain Hub
- **One-liner** (≤30 words): AI-powered decentralized commerce platform using 0G Compute for TEE-verified inference, 0G Storage for immutable receipts, and 0G Chain for automated revenue sharing.
- **Track**: Track 3 — Agentic Economy & Autonomous Applications
- **0G Contract Address**: `<from step 1>`
- **Explorer Link**: `https://chainscan.0g.ai/address/<address>`
- **GitHub**: your repo URL
- **Demo Video**: your YouTube/Loom URL
- **X Post**: your tweet URL

## 0G Integration Summary (for judges)
| Component | Usage | Where |
|-----------|-------|-------|
| 0G Compute | TeeML inference for transaction optimization | `ai-agent/server/app.py` |
| 0G Storage | Merkle-root metadata upload per transaction | `src/utils/storage.ts` |
| 0G Chain | `SmartChainTransaction` + `SmartChainRevenue` contracts | `blockchain/contracts/` |
