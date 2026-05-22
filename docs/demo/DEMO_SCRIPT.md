<div align="center">

<img src="../logo/logo.png" alt="SmartChain Hub" width="80" />

# SmartChain Hub — Demo Script
### *0G APAC Hackathon 2026 · Track 3: Agentic Economy & Autonomous Applications*

[![Live Demo](https://img.shields.io/badge/🌐_Record_At-smartchainhubfrontend.vercel.app-6366f1?style=for-the-badge)](https://smartchainhubfrontend.vercel.app)
[![Duration](https://img.shields.io/badge/Duration-3_Minutes_Max-f59e0b?style=for-the-badge)](.)
[![Network](https://img.shields.io/badge/Network-0G_Galileo_16602-0ea5e9?style=for-the-badge)](.)

> **For a fully timed version with delivery notes, use `PITCH_VIDEO_SCRIPT_FINAL.md`**

</div>

---

## Pre-Recording Checklist

```
[ ] Wake AI agent — visit https://smartchain-ai-agent.onrender.com/health first
    (free tier sleeps — wait for {"status":"healthy"} before recording)
[ ] MetaMask connected to 0G Galileo Testnet (Chain ID 16602)
[ ] Wallet funded with A0GI from hub.0g.ai/faucet
[ ] Browser at smartchainhubfrontend.vercel.app
[ ] Hide bookmarks bar (Ctrl+Shift+B)
[ ] URL bar visible at ALL times — judges verify live deployment
[ ] OBS / Loom recording at 1920×1080 minimum
[ ] Microphone tested — clear audio, no echo
[ ] ChainScan tab pre-opened: scan-testnet.0g.ai
[ ] Do one full dry run before recording the real take
```

---

## [0:00 – 0:20] The Hook

**Screen:** Landing page at `smartchainhubfrontend.vercel.app`

> *"What if your AI agent could own itself — not as an API key, but as a sovereign identity on a blockchain?*
>
> *What if every AI decision was cryptographically proven inside a Trusted Execution Environment?*
>
> *What if your agent remembered you across every device, every session — not from a database, but from 0G Storage?*
>
> *This is SmartChain Hub. The first sovereign AI agent economy. Built entirely on 0G."*

**Action:** Click "Connect Wallet" → MetaMask popup → Confirm

---

## [0:20 – 0:50] Agent Identity — On-Chain Sovereign Identity

**Screen:** Dashboard → Agent ID Card

> *"Every user gets a soulbound Agent ID — a non-transferable NFT on 0G Chain.*
> *It stores the agent's model hash, memory root, and reputation score.*
> *It cannot be copied, sold, or transferred. It IS the agent."*

**Point to:** Memory Root hash · Model Hash · Reputation counter · "Soulbound" badge

> *"This memory root is the Merkle root of the agent's memory stored on 0G Storage KV — persistent across every device, every session, every browser reset."*

**Action:** Click ChainScan link → show `AgentMinted` event live on 0G explorer

> *"Fully verifiable on 0G Galileo Testnet. On-chain. Immutable."*

---

## [0:50 – 1:30] AI Optimization — 0G Compute TeeML

**Screen:** Transactions page → enter `5000` → select `efficiency` → click Optimize

> *"The agent optimizes blockchain transactions using 0G Compute — a TeeML inference request to LLaMA 3.1 8B running inside a Trusted Execution Environment."*

**Result appears — point to the blue TEE badge:**

> *"The AI returns the optimal route, fee, savings, and confidence score.*
> *The X-TEE-Proof header in the response proves the inference ran inside a TEE.*
> *Not a claim. A cryptographic fact."*

**Action:** Click "Confirm & Record On-Chain"

> *"On confirm, five verifiable on-chain artifacts fire simultaneously:"*

**Point to each badge as it appears:**

```
[1] Cryptographic ZK commitment      → purple PROOF badge  → SHA-256 anchored on-chain
[2] 0G Storage Log upload            → green badge         → immutable Merkle root returned
[3] Agent memory updated             → 0G KV write         → cross-device persistent memory
[4] Agent ID on-chain                → reputation++        → memory root committed to chain
[5] 0G DA anchor                     → blob_id stored      → tamper-proof audit trail in DA layer
```

> *"Five verifiable on-chain artifacts. One user interaction. No trust required."*

---

## [1:30 – 2:00] Memory Persistence

**Action:** Close the browser tab completely

> *"Watch what happens when I close the browser."*

**Action:** Reopen → navigate to Dashboard

> *"The agent remembered me. Not from localStorage — that was cleared.*
> *From 0G Storage KV — the authoritative persistent memory layer.*
> *hydrateAgentMemory() fetched my memory on mount and restored my state."*

**Point to:** Reputation incremented · Amount pre-filled · Priority pre-selected

> *"Cross-device. Cross-session. Censorship-resistant. Permanent."*

---

## [2:00 – 2:30] The Economic Flywheel

**Screen:** Revenue page

> *"0.5% of every transaction fee flows automatically to stakers via SmartChainRevenue — no manual distribution, fully on-chain."*

**Screen:** Payments → Agent Escrow tab

> *"Agents can pay each other. Agent A deposits A0GI into an escrow channel. Agent B claims payment per API call rendered. This is agent-to-agent commerce — no humans required."*

**Screen:** Transactions → Analyze tab → Model Intelligence widget → click "Fine-tune Model"

> *"As transactions accumulate in 0G Storage, the AI model fine-tunes itself on real user data — getting smarter with every interaction. The updated model hash is committed back to the Agent ID on-chain."*

---

## [2:30 – 3:00] Architecture Close

**Screen:** All 5 contract addresses on ChainScan

> *"Five smart contracts deployed on 0G Galileo Testnet:*
> *Agent ID, Transaction recorder, Revenue distributor, Payments with staking, and Agent Escrow for micropayments."*

**Screen:** README architecture diagram

**Screen:** Activity Feed → show DA-anchored events with blob_ids

> *"Every agent event — multi-agent coordination, optimization, fine-tune — is anchored to 0G DA as a verifiable blob. That blob_id and da_tx_hash are stored here. Any auditor can independently verify every AI decision ever made."*

> *"SmartChain Hub uses all five layers of 0G:*
> *0G Chain for 5 deployed contracts,*
> *0G Compute TeeML for verified inference and fine-tuning,*
> *0G Storage Log for immutable tx receipts,*
> *0G Storage KV for persistent agent memory,*
> *and 0G DA for tamper-proof event anchoring.*
>
> *We are the only Track 3 submission that uses the DA layer.*
>
> *This is not a demo. This is a live, deployed, fully functional agentic economy — running on 0G right now.*
>
> *SmartChain Hub. The agent economy starts here."*

---

## Key Talking Points for Judges

| Point | Evidence |
|---|---|
| Full 0G stack integration | All 5 modules: Compute + Storage Log + Storage KV + Chain + Agent ID |
| Live deployment | smartchainhubfrontend.vercel.app + smartchain-ai-agent.onrender.com |
| 5 deployed contracts | All verified on scan-testnet.0g.ai |
| First agent-to-agent escrow on 0G | SmartChainAgentEscrow — deposit → payPerCall → withdraw |
| Self-improving AI | Fine-tune TF model on real user data from 0G Storage |
| Cryptographic commitment proofs | SHA-256 anchored on-chain every single transaction |
| Demo Mode | Full optimizer flow without wallet — judges can test immediately |

---

## Recording Tips

```
✅ Show browser URL bar at all times — judges verify live deployment
✅ Do a REAL transaction — not a simulation
✅ Show ChainScan after every on-chain action
✅ Keep MetaMask on 0G Galileo (Chain ID 16602)
✅ Record at 1920×1080 minimum, 30fps
✅ Upload to YouTube (Unlisted) or Loom
✅ Paste link into HackQuest submission immediately
✅ Speak at 130 words per minute — deliberate, not rushed
✅ Never say "basically", "kind of", or "this is just a demo"
✅ Keep total under 3:00 — hard cutoff
```

---

<div align="center">

**SmartChain Hub** · 0G APAC Hackathon 2026 · **Track 3: Agentic Economy & Autonomous Applications**

`#BuildOn0G` · `#AgenticEconomy` · `#0GHackathon`

`@0G_labs` `@0g_CN` `@0g_Eco` `@HackQuest_`

</div>
