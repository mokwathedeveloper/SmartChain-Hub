# SmartChain Hub — 90-Second Judges' Pitch
### 0G APAC Hackathon 2026 · Track 3: Agentic Economy

> **Use this when you have 90 seconds with a judge or in lightning-round Q&A.**
> Every sentence earns its place. Do not improvise — deliver exactly this.

---

## The 90-Second Script (Word for Word)

**[0:00 – 0:12] — The differentiator, up front**

> *"SmartChain Hub is the only submission in Track 3 that uses all five layers of the 0G stack simultaneously — Chain, Compute TeeML, Storage Log, Storage KV, and the DA layer.*
> *No other project touches DA."*

---

**[0:12 – 0:30] — What it does**

> *"We give every AI agent three things it doesn't have today: a permanent on-chain identity that cannot be revoked, cross-device memory that survives platform shutdowns, and cryptographic proof that every inference ran correctly inside a Trusted Execution Environment.*
> *Then we give agents the ability to earn revenue autonomously and hire other agents — with no human intermediary."*

---

**[0:30 – 0:50] — The proof it works**

> *"This is live right now.*
> *Five Solidity contracts deployed and verified on 0G Galileo Testnet.*
> *63 contract tests passing. Nine AI agent test suites.*
> *A custom TensorFlow 2.16 neural network — not an API call to OpenAI, an actual trained model that fine-tunes itself on real user transaction data pulled from 0G Storage by Merkle root hash.*
> *Every optimization produces five verifiable on-chain artifacts — a Storage Log receipt, a ZK commitment, an AgentID update, a revenue distribution event, and a DA-anchored blob."*

---

**[0:50 – 1:10] — The live demonstration (show, don't tell)**

*[Navigate to smartchainhubfrontend.vercel.app → Transactions → enter 5000 → Optimize]*

> *"Watch. I submit a transaction. The AI agent runs TEE inference via 0G Compute. The result comes back with a cryptographic X-TEE-Proof attestation. I confirm — and five artifacts are created on-chain simultaneously."*

*[Point to: TEE badge · ZK proof badge · Storage root · ChainScan link · Activity Feed DA blob]*

---

**[1:10 – 1:25] — Why this beats the field**

> *"We built this solo in 35 days with roughly 600 commits.*
> *We're the only project with a custom-trained neural network — every competitor routes through OpenAI or Qwen.*
> *We're the only project using 0G DA.*
> *And we have more passing tests than every other submission combined."*

---

**[1:25 – 1:30] — The close**

> *"SmartChain Hub is infrastructure for a trillion-dollar agent economy — built on 0G, verifiable from Day 1.*
> *Thank you."*

---

## If a Judge Asks: "What makes you different from Bonfire/Spike/ComputePool?"

| If they mention | Your answer |
|---|---|
| **Bonfire** | "Great UX, 3-component 0G integration. We have 5/5 components, 63 tests, and the only DA integration in the track." |
| **Spike** | "Post-quantum crypto is a clever angle. They have 4/5 0G components and 36 commits. We have 5/5, 63 tests, custom NN." |
| **ComputePool** | "Most technically impressive infrastructure play. We're application-layer — you can see and use what we built in 30 seconds." |

## If a Judge Asks: "Why DA? What does it give you?"

> *"DA is the difference between 'I claim my AI made this decision' and 'here is a tamper-proof, independently verifiable blob anchored to the 0G Data Availability layer that proves this decision was made, when, and with what inputs. Any auditor — regulator, enterprise, third party — can verify any agent action in this system without trusting us."*

---

## Pre-Pitch Checklist (Do This 10 Minutes Before)

```
[ ] AI agent awake: curl https://smartchain-ai-agent.onrender.com/health
[ ] Wallet on 0G Galileo (Chain ID 16602) with A0GI balance
[ ] Browser at: smartchainhubfrontend.vercel.app
[ ] ChainScan tab open: scan-testnet.0g.ai/address/0x69C619374c6B901b99941Df7238fceb80d7DCd08
[ ] Activity Feed loaded — DA blob_ids visible
[ ] One test optimization already done to warm the page
```

---

*SmartChain Hub · Track 3: Agentic Economy · 0G APAC Hackathon 2026*
