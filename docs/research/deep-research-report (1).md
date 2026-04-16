# Deep Research: Building a Winning B2C App for the 0G APAC Hackathon

## What the 0G APAC Hackathon actually wants

The 0G APAC Hackathon is explicitly a builder program for “AI × Web3 applications” built **on 0G** and optimized for areas like autonomous agents, privacy, verifiable finance, and “high-performance consumer products.” citeturn4view0turn20search6

What matters most is not your idea in the abstract, but **verifiable, deployed integration** with the 0G stack plus a tight, judge-friendly delivery package.

The hard requirements are unambiguous:

- You must submit through HackQuest, **by May 16, 2026 23:59 UTC+8**. citeturn4view0  
- You must provide a **0G mainnet contract address** and a **0G Explorer link** showing on-chain activity (this is called the “core requirement”). citeturn4view1turn12view0  
- You must prove that at least one **0G core component** is integrated (examples listed include: 0G Storage, 0G Compute, 0G Chain, Agent ID, privacy/secure execution features). Projects without actual 0G integration are treated as invalid. citeturn4view1  
- Your repo must show “substantial development progress” during the hackathon window; empty/placeholder repos risk disqualification. citeturn4view1  
- Demo video must be **≤ 3 minutes** and must **show the product working + the 0G component being used** (slide-only or concept-only videos are not accepted). citeturn4view1  
- README/docs must include an architecture diagram (or strong technical description), explain which 0G modules you used and why, and include reproduction steps for judges. citeturn4view1turn12view0  
- You must publish at least one public **X** post with the required hashtags and tags; this is mandatory and checked. citeturn4view1turn12view0  

The judging criteria reinforces this: you’re scored on **0G integration depth & innovation**, **technical completeness**, **product value/market potential**, **UX & demo quality**, and **team capability/documentation**. citeturn12view0

A practical implication: if you want to *win*, you shouldn’t “bolt 0G on at the end.” Your app should **feel impossible (or meaningfully worse) without 0G**.

## What judges will reward and how to engineer for it

### Integration depth and innovation means multi-module, visible usage

Judges explicitly prioritize “extent of adoption of 0G components” and “innovative solutions to AI / on-chain pain points.” citeturn12view0  
So the highest-scoring pattern is: **use multiple 0G modules in a way the user can see**.

A strong, judge-friendly “integration stack” is:

- **0G Compute** for the AI experience (chat/image/audio), ideally with TEE verification surfaced in your UI. The 0G Compute Inference docs describe two verification modes (TeeML and TeeTLS) and how TeeML runs the model inside a TEE with responses signed by the TEE key; TeeTLS provides cryptographic routing proofs via a TEE broker. citeturn6view2  
- **0G Storage** as the canonical persistence layer for the AI artifacts (conversation transcripts, embeddings/memory, user-uploaded files, generated images). 0G Storage is designed with a log layer (immutable) and a key-value layer (mutable) suitable for state like “user profiles” and “real-time applications.” citeturn8view0  
- **0G Chain** for your core on-chain object: a contract that proves your app’s activity is real and deployed on mainnet (and is easy to inspect on ChainScan). HackQuest requires a mainnet contract address and explorer link. citeturn4view1turn7view0  
- Optionally, **INFT (ERC‑7857)** to “tokenize” a user’s AI agent or “memory capsule.” The 0G INFT docs position this specifically for AI agents, emphasizing encrypted intelligence, secure transfers, and 0G-native modular support (Storage/DA/Chain/Compute). citeturn9search2turn9search13turn13view0  

This multi-module approach gives you multiple “proof points” during demo: inference proof, storage root hash / tx hash, and contract event logs.

### Technical completeness is about reproducibility and stability, not maximal features

Judges call for “functional integrity” and “mandatory on-chain deployment.” citeturn12view0  
In practice, this means:

- The demo path must be **reliable under stress** (slow networks, fresh wallets, empty accounts).  
- Setup for judges must be **copy-paste**, with test accounts and faucet notes if needed. citeturn4view1  

Your advantage, as a fullstack + QA developer, is that you can treat the hackathon deliverable like a production release: deterministic builds, test coverage on critical paths, and graceful fallbacks.

### Product value and UX means B2C onboarding must be frictionless

Because “Product Value & Market Potential” and “User Experience & Demo Quality” are explicit criteria, you should reduce the number of “Web3 tax” steps in the primary user journey. citeturn12view0  

A proven tactic for B2C hackathon wins is a **dual-mode onboarding**:

- **Mode A (Web2-fast):** email login + instant sandbox experience (no wallet needed).
- **Mode B (Web3-power):** link a wallet to “own/export” an agent or memory capsule on-chain.

Supabase is well-suited for Mode A. Supabase positions itself as a Postgres development platform with Auth and instant APIs and Edge Functions. citeturn14search0turn14search1turn14search2  
This lets you spend engineering time on the 0G integration and the consumer experience, not on rebuilding auth/session infrastructure.

## Track selection for a modern B2C webapp

Your B2C orientation fits best with Track 3 or Track 4, with Track 3 being the most directly aligned to consumer agent apps.

Track 3, “Agentic Economy & Autonomous Applications,” explicitly welcomes “creative AI-driven consumer dApps” and calls out directions like micropayments, AI commerce/social, and “Agent-as-a-Service platforms.” citeturn4view0  

Track 4, “Web 4.0 Open Innovation,” is designed for “high-quality application teams” needing decentralized storage for real-world scaling, focusing on SocialFi, Gaming, and DePIN. citeturn4view0  

Track 1 is tempting if you want to lean heavily into agents + orchestration (it explicitly encourages OpenClaw + 0G Compute + 0G Storage for memory/state), but it may pull you toward “infrastructure” rather than a high-polish consumer product. citeturn4view0turn1search27  

Recommendation for a solo/lean team fullstack builder aiming to win with B2C: **Track 3**, with a product that still demonstrates serious technical depth (Compute + Storage KV + on-chain contract + optional INFT).

## Winning app blueprint: MindPocket, a private AI agent with portable onchain memory

### One-sentence pitch

**MindPocket** is a consumer AI assistant where your conversations and “agent memory” are stored on 0G (mutable KV + immutable log audit), your responses are generated via 0G Compute with TEE verification, and your “memory capsules” can be exported as on-chain assets on 0G mainnet.

This concept is engineered to score across all five judging criteria:

- **0G integration depth:** uses 0G Compute + 0G Storage (KV + Log) + 0G Chain, optionally INFT. citeturn8view0turn6view2turn4view1turn13view0  
- **Completeness:** a narrow, demoable feature set with strong testability and reproducible setup. citeturn4view1turn12view0  
- **Market potential:** consumer demand for privacy and ownership of AI interactions is a strong narrative; you position 0G as “owned infrastructure” rather than rented, centralized services (aligned to hackathon messaging). citeturn20search8turn4view0  
- **UX:** starts instantly via email; wallet is optional for export/ownership. citeturn14search2turn12view0  
- **Documentation:** the architecture inherently produces clean “integration proof” artifacts.

### The real consumer problem it solves

Most consumer AI apps have two trust gaps:

- Users can’t easily verify **where inference happened** and whether their prompts were exposed to operators.
- Users can’t easily **own their history/memory** in a portable, interoperable way.

0G’s stack is designed for exactly this kind of AI workload: it combines modular compute and storage with privacy-preserving execution and “agent identity” primitives. citeturn12view0turn16search20  

### The demo-friendly user flow

Your 3‑minute demo should be a single, clean story that visibly produces on-chain proofs:

User actions (what the judge sees):

1. User logs in (email magic link) and opens an “assistant chat.”
2. User asks a question + uploads a small file (PDF/image/notes).
3. App runs inference on **0G Compute** and displays:
   - chosen model/provider
   - verification mode (TeeML/TeeTLS)
   - “Verified inside TEE” badge + proof link (or at least verification metadata shown). citeturn6view2  
4. App extracts “memory items” (facts/preferences/tasks) and stores them into **0G Storage KV**, showing a stream/key reference and a StorageScan link.
5. App stores the raw transcript into **0G Storage Log** (immutable), showing the root hash and tx hash.
6. App submits an on-chain “MemoryCommit” transaction to your **0G mainnet contract**, then opens ChainScan to show the event. (This directly satisfies the “mainnet contract address + explorer link + on-chain activity” requirement.) citeturn4view1turn7view0  
7. Optional “wow” step: user clicks “Export Memory Capsule,” mints an INFT-style asset or a simpler NFT that references encrypted content in 0G Storage (still on 0G mainnet). citeturn9search13turn13view0  

This flow is designed so the judge can’t miss the question: “how is 0G used?”

## Technical architecture for JavaScript, Supabase, and deep 0G integration

### Core stack choices

Frontend and app layer:

- **Next.js / React** as the modern webapp shell.
- **Supabase Auth** for passwordless + social login (your fast B2C onboarding). citeturn14search2  
- **Supabase Postgres + RLS** for non-canonical app data (user profiles, feature flags, analytics), with RLS for secure client access. citeturn14search3  

0G layer (canonical AI and ownership layer):

- **0G Compute** for inference and (optionally) image generation or speech-to-text. 0G Compute Inference supports LLMs, text-to-image, and speech-to-text, and provides Web UI/CLI/SDK paths. citeturn6view2  
- **0G Storage** for long-term persistence, using the KV layer for mutable state and the log layer for immutable receipts/audit. citeturn8view0turn12view0  
- **0G Chain smart contracts** deployed on **0G Mainnet (Chain ID 16661)**, verifiable on ChainScan. citeturn7view0turn4view1  

### Key 0G implementation details that matter in a real webapp

#### 0G Mainnet configuration and proof requirements

For production/mainnet, 0G docs list these network details for 0G Mainnet: chain ID **16661**, RPC `https://evmrpc.0g.ai`, and ChainScan explorer `https://chainscan.0g.ai`. citeturn7view0  
Your submission must include a mainnet contract address and explorer link showing activity. citeturn4view1  

To deploy contracts, 0G’s documentation frames 0G Chain as EVM-compatible and deployable via familiar tools like Hardhat/Foundry, with mainnet configuration examples (RPC + chainId 16661). citeturn7view1turn8view2  

#### 0G Compute integration for a JS fullstack app

0G Compute’s inference layer is designed to be consumed via SDK, CLI, or web UI. citeturn6view2  
For a hackathon-grade webapp, you want a **server-side broker** that:

- performs provider discovery,
- handles wallet/ledger setup,
- routes requests,
- records verification metadata,
- and exposes a clean API to your frontend.

The official 0G Compute TypeScript starter kit is essentially this: an Express + TypeScript REST API that “demonstrates how to integrate decentralized AI services with automatic payment processing” and includes “TEE verification.” citeturn17view0  
It also clearly communicates operational constraints you must design around (example: minimum funding requirements per wallet/provider in its documented flow). citeturn17view0  

Crucially, 0G Compute supports explicit verification modes:

- **TeeML:** model runs inside a TEE; responses are signed by the TEE key. citeturn6view2  
- **TeeTLS:** a TEE broker proxies requests to a centralized LLM over HTTPS and produces cryptographic routing proof (certificate fingerprint + request/response hashes signed by TEE-protected key). citeturn6view2  

This is a big UX win if you productize it: show “verified execution” rather than just claiming privacy.

#### 0G Storage integration for “agent memory” the right way

0G Storage is explicitly designed with:

- a **Log layer** (append-only immutable storage) suitable for archives and “write once, read many” datasets; and  
- a **Key-Value layer** suitable for “databases, dynamic content, state storage,” including “user profiles” and “real-time applications.” citeturn8view0  

For MindPocket, that maps cleanly:

- Log layer: immutable conversation transcript “receipts,” attachments, and generated artifacts (images/audio).
- KV layer: extracted memory items, user preferences, lightweight state, and retrieval indexes.

The TypeScript Storage SDK supports key-value operations and has specific browser constraints you must plan for (for example, browser downloads must avoid Node-only `fs` calls; the docs point to a starter kit implementation for browser-safe downloads). citeturn6view0turn18search4  

A practical architecture pattern:

- Browser does **wallet connect** only for user-owned submissions (optional).
- Your backend service handles **app-paid** storage writes for the fast/sandbox mode.

Either way, you must follow key security practice: the 0G Storage SDK documentation explicitly warns **never to expose private keys in client-side code**. citeturn6view0  

The 0G Storage TypeScript starter kit also demonstrates a workable split: a web UI with MetaMask for uploads and scripts/library usage for Node environments. citeturn15view0  

#### Optional but high-impact: INFT-style “memory capsules”

If you have time, add the “exportable memory capsule” feature as your wow factor. 0G’s INFT docs make this concept first-class: INFTs are designed for tokenizing AI agents with transferable ownership while keeping intelligence encrypted. citeturn9search13turn9search2  
The INFT integration guide explicitly explains how INFTs integrate with 0G Storage (encrypted metadata), 0G Chain (contracts), 0G Compute (secure inference), and 0G DA (proof verification). citeturn13view0  

If full ERC‑7857 transfer re-encryption is too heavy for the hackathon, you can still implement a simpler subset: mint an NFT that points to an encrypted bundle stored on 0G Storage, with encryption keys controlled by the user’s wallet. (The key is to keep the feature demoable and provable.)

### TEE privacy positioning you can defend

Because the hackathon explicitly supports privacy and secure execution, and Track 2 even calls out TEE-based execution for privacy and front-running resistance, it’s powerful to communicate TEE’s value clearly. citeturn4view0  

A TEE is widely defined as a hardware-backed isolated environment protecting code and data from tampering and observation by software outside the TEE boundary. citeturn3search14turn3search2  
0G Compute’s inference docs align with this by describing TeeML and TeeTLS verification mechanisms and signed proofs. citeturn6view2  

In your demo and README, include a short “trust model” box:

- What stays private (prompts, uploaded content).
- What is public (hashes, contract events).
- What is verifiable (TEE proof metadata, on-chain receipts).

## Execution strategy, QA plan, and the submission package that wins

### A delivery plan aligned to hackathon milestones

The hackathon includes a Mini Demo Day at the Hong Kong Web3 Festival on April 22, 2026, and final submission on May 16, 2026. citeturn4view0  
Given today is mid-April 2026, your best “win path” is:

- Have a **demoable vertical slice** by April 22 (even if limited features).
- Use the remaining weeks to harden, polish UX, and strengthen documentation + community traction.

### QA plan that matches the judging rubric

Because “team capability” and “documentation” are explicitly judged, your testing approach should be visible and credible, not hidden. citeturn12view0  

A practical QA stack for this hackathon:

- Smart contracts: Hardhat or Foundry tests. Hardhat is positioned as including “testing, deployment, code coverage,” etc. citeturn19search2turn19search6  
- Webapp E2E tests: Playwright, which runs cross-browser tests across Chromium/Firefox/WebKit. citeturn19search0turn19search4  
- Security checklist for the web layer: OWASP ASVS provides a structured set of requirements for secure web apps and services. citeturn19search3turn19search11  

Make this judge-visible by adding a `docs/qa.md` with:

- a minimal test matrix,
- how to run tests locally,
- and screenshots of passing CI runs (optional bonus material). citeturn12view0  

### Submission package checklist engineered to avoid disqualification

Everything below is tied to explicit HackQuest requirements:

Your HackQuest submission must include:

- Basic project info (name, ≤30-word one-liner, what it does, problem, which 0G components used). citeturn4view1  
- Public/shared GitHub repo with meaningful commits and real progress during the hackathon window. citeturn4view1  
- 0G integration proof: **0G mainnet contract address** + **explorer link** with verifiable on-chain activity + clear proof of at least one 0G component integrated. citeturn4view1turn12view0  
- Demo video ≤ 3 minutes showing real functionality and how 0G is used (not concept slides). citeturn4view1  
- README with architecture diagram or technical description + reproduction steps + reviewer notes (faucet/test accounts). citeturn4view1turn12view0  
- Public X post with required hashtags and tags. citeturn4view1turn12view0  

Optional materials that often move you from “good” to “winner”:

- A short pitch deck, a public frontend link, and user testing notes/screenshots are explicitly called out as submission strengtheners. citeturn12view0  

### How to maximize Community Awards alongside Grand Prize eligibility

Community Awards are selected via community voting mechanisms such as Discord or X voting and reward popularity/community impact. citeturn12view0  

This creates a second “win condition” you can optimize for without harming your main submission:

- Ship an early, usable demo link.
- Post short clips showing “TEE-verified inference” + “onchain memory commit.”
- Make “try it now” frictionless (email login; demo credits).
- Collect and post user feedback screenshots (explicitly listed as a bonus material). citeturn12view0turn14search2  

If you execute MindPocket as described, you’ll be demonstrating exactly what the hackathon is asking for: an AI-native consumer application that leverages 0G’s modular compute/storage/chain stack in a way that is **visible, verifiable, and product-ready**. citeturn4view0turn12view0turn6view2turn8view0turn7view0