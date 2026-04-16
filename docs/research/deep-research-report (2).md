# Winning B2C Web4 Product Design for 0G APAC Hackathon Track 3

## Executive summary

The 0G APAC Hackathon is explicitly looking for **deployable AI × Web3 applications built on 0G’s modular infrastructure**—and it will **invalidate** (or heavily penalize) projects that don’t show real 0G integration with **verifiable on-chain activity** (mainnet contract address + explorer link). citeturn2view0turn18view2

For a solo/lean full‑stack builder targeting **Track 3 (Agentic Economy & Autonomous Applications)**, the winning strategy is to ship an MVP that is both **consumer-friendly** and **economically “real”**: a B2C product with a simple, delightful UX, but also clear, traceable rails for **micropayments / automated billing / revenue-sharing**—exactly what Track 3 calls out. citeturn2view0

A high-scoring approach (optimized for your requested stack and “technical depth” requirement: **0G Compute + 0G Storage KV + on‑chain contract + INFT**) is to build an **Agent‑as‑a‑Service consumer marketplace** where:

- Creators mint an **ERC‑7857 INFT** representing a “consumer AI agent” (persona + capabilities + optional private configuration stored as **encrypted metadata**). citeturn4view5turn4view4  
- Consumers pay **per-use** (or buy credits) via an **on-chain escrow + revenue split contract** on **0G Chain** (EVM-compatible). citeturn10view2turn2view0  
- The agent’s execution runs on **0G Compute** with **TEE-backed verification options** and OpenAI-compatible access patterns; you optionally show **TEE response verification** in the demo. citeturn5view2turn5view3turn24view1turn14view0  
- The agent’s **state and long-context memory** are persisted on **0G Storage**, using **KV** for low-latency state and (optionally) the Log/file layer for large artifacts (proof receipts, transcripts, images). citeturn8view0turn4view1turn23view1  

This matches the judges’ criteria across all dimensions: deep 0G usage, complete working system, strong B2C story, and a demo that visibly proves 0G is not “optional infrastructure” but the reason the product works. citeturn2view0turn18view2

## What the judges want and how to score

Judging criteria are explicitly: **0G Technical Integration Depth & Innovation**, **Technical Implementation & Completeness**, **Product Value & Market Potential**, **User Experience & Demo Quality**, and **Team Capability & Documentation**—with an explicit rule that at least one 0G component must be used (or points are deducted / disqualification risk depending on validity). citeturn2view0turn18view2

### Score-maximizing interpretation of each criterion

| Judging criterion (official) | What judges will likely look for in practice | Concrete “proof points” you should show |
|---|---|---|
| 0G Technical Integration Depth & Innovation | Multiple 0G modules used in a way that creates *product value*, not just “hello world.” Track 3 favors economic rails + app UX. citeturn2view0turn18view2 | In demo: (a) mint INFT on **0G Chain**, (b) write/read **0G Storage KV**, (c) run **0G Compute** inference + optionally verify response signature, (d) on-chain settlement of payment splits. citeturn5view2turn8view0turn10view2turn24view1 |
| Technical Implementation & Completeness | Working flows end-to-end; deployments reproducible; no placeholder repo. Mandatory on-chain deployment + explorer link. citeturn2view0turn18view2 | Public GitHub with commits; production web demo; contract address + ChainScan link; scripts to deploy; seeded test users. citeturn2view0turn18view2 |
| Product Value & Market Potential | Clear problem + target users + plausible adoption and monetization; not only “cool tech.” Track 3 aligns with micropayments, billing, rev share, agent commerce/social. citeturn2view0 | Clear personas; measurable “why now”; pricing model; roadmap. Use evidence from B2C 0G builders (e.g., Flashback metrics) to show comparable adoption patterns. citeturn17view0 |
| User Experience & Demo Quality | Intuitive UI; low friction; crisp 3-minute demo that shows the value + shows 0G in action (not slides). citeturn18view2turn2view0 | A scripted flow: mint → pay → run agent → see results + proofs + explorer links. Minimal wallet prompts, fast UI states, clear “what just happened.” citeturn18view2turn5view1 |
| Team Capability & Documentation | Readable code, good architecture explanation, clear setup instructions, reviewer notes, faucet steps, test accounts. citeturn18view0 | README with architecture diagram + module mapping + local run steps + contract addresses + troubleshooting. citeturn18view0 |

### Submission requirements you must treat as “hard gates”

You must submit via HackQuest and include: (a) **basic project info**, (b) **public/shared GitHub repo** with real commits, (c) **0G integration proof**: *0G mainnet contract address + explorer link showing on-chain activity*, (d) **≤3 min demo video** showing core functionality + explicit 0G usage, (e) **README/docs**, and (f) a **public X post** with required hashtags/tags. citeturn18view2turn18view0turn2view0

## Product concepts and positioning

You asked for **1 primary Track 3 B2C idea + 2 alternates**, optimized for consumer adoption and your targeted tech stack (0G Compute + Storage KV + on-chain contract + INFT). Below are three ideas in that shape; the first is optimized for “highest judge score per solo-dev week.”

### Comparison table of the three ideas

| Idea | One-line | Market fit (B2C) | 0G depth potential | Technical risk | Dev effort (solo) | Judge score potential |
|---|---|---:|---:|---:|---:|---:|
| **Primary: Pay‑Per‑Use Agent Marketplace (INFT Agents)** | Mint an agent as an INFT; others pay per run; on-chain revenue split; 0G KV memory; 0G Compute execution | High if you narrow to a “consumer job” (study, travel, content, shopping) | Very high (Chain + Compute + Storage KV + INFT + optional TEE verification) citeturn2view0turn5view2turn8view0turn4view4 | Medium (oracles/INFT complexity) | Medium-high | **Very high** (Track 3 alignment + visible infra usage) citeturn2view0 |
| Alternate: Private “Memory Companion” with Wallet-Owned Data | Voice/text memories; agent summarizes; user owns memory as INFT; pays usage | Proven B2C shape (Flashback is similar) citeturn17view0 | High (Compute + Storage + Chain + INFT) | Medium (PII + privacy) | Medium | High |
| Alternate: Micro‑Subscription “AI Tools Pass” | Users buy a pass; get access to a bundle of small agents; creators share revenue | Medium-high | Medium-high (Chain + Compute + Storage KV; INFT optional) | Low-medium | Low-medium | Medium-high |

### Primary concept: “AgentCart” — pay‑per‑use consumer agent marketplace (INFT)

**Positioning (Track 3 fit):** Track 3 explicitly welcomes **AI Commerce & Social**, **SocialFi agents**, and **Agent‑as‑a‑Service platforms**, plus **financial rails** like micropayments and revenue sharing. citeturn2view0  
AgentCart is an Agent‑as‑a‑Service marketplace where each agent is an **INFT** and each run is a **paid micro-transaction** with on-chain settlement.

**Core value proposition**
- For consumers: “Use specialized agents instantly—pay only when an agent delivers.”
- For creators: “Mint your agent as an INFT; earn revenue each time someone uses it; your agent is portable and ownable.”

**User personas**
- **Consumer (B2C):** wants one high-value outcome fast (e.g., “plan a weekend trip,” “summarize lecture,” “write a job application,” “meal plan with groceries”).
- **Creator:** a power user who builds a specialized agent *template* and wants revenue share.
- **Curator/Influencer (optional):** shares agent links and earns referral fees.

**Core user flows**
1. **Create & mint agent (creator)**
   - Choose a template (one vertical only for MVP).
   - Configure persona + guardrails.
   - Mint INFT: encrypted agent spec stored on 0G Storage; token minted on 0G Chain via ERC‑7857. citeturn4view4turn6view0turn10view2
2. **Discover & pay (consumer)**
   - Browse agents, see price per run.
   - Pay into on-chain escrow contract (request created; funds locked). citeturn24view1turn2view0
3. **Execute (autonomous app)**
   - Backend picks up the on-chain request event.
   - Runs the agent on 0G Compute and (optionally) verifies response integrity via the SDK’s TEE verification flow. citeturn5view2turn5view3
4. **Deliver + persist memory**
   - Persist result and updated memory to 0G Storage (KV for state; optional file/log layer for proof receipts).
   - Post result hash + storage pointer back on-chain; release revenue split. citeturn8view0turn23view2turn10view2

**Monetization**
- **Per-run fee** (micropayment), split on-chain:
  - Creator: 80–90%
  - Platform: 5–15%
  - Optional referral: 0–10%
- Optional: **subscription pass** later (stretch).

**Why this is “judge-friendly”**
- It visibly implements the Track 3 “service layer” idea: paid autonomous AI services, with verifiable infra and ownership rails.
- It creates clean demo moments: mint → pay → compute → storage write → on-chain settle (all verifiable). citeturn18view2turn2view0

### Alternate concept: “PocketArchive” — privacy-first memory companion with INFT ownership

This is a narrower B2C “emotional” product akin to what Flashback is doing: capture memories, run AI processing, store user-owned data, eventually mint evolving “Memory Orbs.” Flashback’s case study suggests B2C appetite for privacy-first memory apps and shows measurable on-chain + storage usage in production. citeturn17view0  
To differentiate, PocketArchive would emphasize **INFT-owned “memory agent”** that can be transferred to new apps, plus “family sharing” revenue rails.

### Alternate concept: “ToolPass” — micro-subscription to a bundle of agent tools

A simpler business model: user buys a monthly pass on-chain and gets access to multiple small consumer tools (resume, tutor, travel, etc.). It’s easier to ship but slightly weaker on “innovation” unless you strongly tie **per-tool revenue sharing** and a clear creator economy.

## Technical architecture blueprint

### Key assumptions (explicit)

- **0G Chain is EVM-compatible**, so Solidity + Hardhat/Foundry can be used. citeturn10view2turn10view0  
- Contracts should compile with **EVM version `cancun`** for 0G Chain compatibility. citeturn10view0  
- **0G Storage** supports both file/blob operations and **KV operations**; KV reads happen via a KV node endpoint (not the indexer). citeturn4view1turn8view0  
- **0G Compute** supports OpenAI-compatible interfaces and has SDK flows that can verify provider TEE signatures (optional but high-value for demo). citeturn5view0turn5view2turn24view1  
- INFT standard is **ERC‑7857** with encrypted metadata and TEE/ZKP oracle-based re-encryption on transfer; for MVP you can implement mint + authorize usage, and treat full secure transfer as stretch if you lack an oracle integration. citeturn4view4turn20view0

### High-level component diagram and data flows

```mermaid
flowchart TB
  U[User\n(Web / Mobile web)] --> FE[Frontend\nNext.js/React + wagmi/viem]
  FE -->|Sign TX| C1[0G Chain\nAgentMarket Contract]
  FE -->|Sign TX| C2[0G Chain\nERC-7857 INFT Contract]

  FE -->|Auth (email/OAuth)| SB[Supabase\nAuth + Postgres + RLS]
  FE -->|REST/WS| API[App API\nNode (Next.js API routes)\n+ Worker]

  API -->|Read events| RPC[0G RPC\n(evmpc.*)]
  RPC --> C1

  API -->|Run inference| CN[0G Compute Network\nBroker/SDK]
  CN -->|TEE-signed response (optional verify)| API

  API -->|Write memory state| KV[0G Storage KV\n(streams)]
  API -->|Store artifacts\n(transcripts, receipts)| BL[0G Storage Log/File]
  
  KV -->|Read state| API
  BL -->|Fetch/verify| API

  API -->|Index metadata, caching,\nsearch, analytics| SB

  API -->|Fulfill request + settle| C1
  API -->|Update agent state pointer| C2
```

This architecture is a “hybrid Web4” approach: Supabase provides **UX-speed indexing, auth, and analytics**, while **the economic truth (payments, ownership)** and **agent persistence (KV + encrypted artifacts)** live on 0G. This mirrors real B2C builders on 0G who emphasize unified chain+storage+compute to deliver “fully decentralized, user-owned AI experiences.” citeturn17view0turn23view0

### 0G modules used and why they matter

**0G Chain (EVM L1)**  
Used for: INFT minting, ownership, paid request escrow, revenue splits, and “proof anchors.” 0G Chain is described as EVM-compatible and optimized for high throughput / sub-second finality, which supports consumer UX expectations (fast confirmations). citeturn10view2turn9search0

**0G Compute Network**  
Used for: agent inference execution. The docs describe it as a decentralized GPU marketplace and emphasize verifiability (TEE signatures, cryptographic proofs) and smart-contract escrow patterns for trust. citeturn24view1turn24view0turn14view0  
Integration: use `@0glabs/0g-serving-broker` and `createZGComputeNetworkBroker`, then `getServiceMetadata`, `getRequestHeaders`, and optionally `processResponse` to verify TEE signatures. citeturn5view3turn5view2

**0G Storage KV (low-latency state)**  
Used for: agent memory, latest state snapshots, pricing cache, and request/result pointers. The official Storage SDK shows KV writes via a `Batcher` and reads via `KvClient.getValue`. citeturn8view0  
The 0G whitepaper describes 0G Storage as having an append-only log layer plus a key-value layer for mutable/structured data. citeturn23view1turn15view2

**0G Storage Log/File layer (artifacts)**  
Used for: encrypted agent metadata blobs, transcripts, “execution receipts,” and any larger outputs. The storage client implements client-side encryption (AES‑256‑CTR) for uploads and supports optional encryption for KV streams. citeturn19view0

**INFT (ERC‑7857)**  
Used for: tokenizing the agent itself with **encrypted metadata**, secure re-encryption on transfer, and “authorized usage” (AI-as-a-service) patterns. citeturn4view4turn4view5

### Smart contract design

You will deploy two contracts on **0G mainnet** (required for validity): citeturn18view2

- **AgentINFT.sol** (ERC‑7857-based INFT, simplified for MVP)
- **AgentMarket.sol** (Track 3 economic rails: request escrow + revenue split + settlement)

#### AgentMarket.sol (core Track 3 scoring lever)

Core ideas:
- `createRequest()` is payable; locks funds in escrow.
- `fulfillRequest()` is called by your executor after inference + storage write; releases revenue split.
- Timeout + `cancelRequest()` protects users if executor fails.
- All state transitions emit events for demo clarity.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// 0G Chain requires Cancun EVM settings at compile time. citeturn10view0
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentMarket is ReentrancyGuard, Ownable {
    enum Status { None, Pending, Fulfilled, Cancelled }

    struct AgentConfig {
        address creator;
        uint96 priceWei;        // per-run price in native 0G
        uint16 creatorBps;      // revenue share basis points
        uint16 platformBps;
        uint16 referrerBps;
        bool exists;
    }

    struct Request {
        address buyer;
        uint256 tokenId;
        bytes32 promptHash;     // keccak256(promptJSON)
        uint96 paidWei;
        uint40 createdAt;
        Status status;
        bytes32 resultHash;     // keccak256(resultJSON or receipt)
        bytes32 storageRoot;    // e.g., 0G Storage root hash anchor
    }

    uint256 public constant BPS = 10_000;
    uint256 public constant TIMEOUT = 30 minutes;

    // Executor that listens to events and fulfills requests
    address public executor;

    mapping(uint256 => AgentConfig) public agents;       // tokenId => config
    mapping(uint256 => Request) public requests;         // requestId => request
    mapping(address => uint256) public withdrawable;     // pull payments

    uint256 public nextRequestId = 1;

    event AgentListed(uint256 indexed tokenId, address indexed creator, uint256 priceWei);
    event RequestCreated(uint256 indexed requestId, uint256 indexed tokenId, address indexed buyer, bytes32 promptHash, uint256 paidWei);
    event RequestFulfilled(uint256 indexed requestId, bytes32 resultHash, bytes32 storageRoot);
    event RequestCancelled(uint256 indexed requestId);

    modifier onlyExecutor() {
        require(msg.sender == executor, "not executor");
        _;
    }

    function setExecutor(address _executor) external onlyOwner {
        executor = _executor;
    }

    function listAgent(
        uint256 tokenId,
        uint96 priceWei,
        uint16 creatorBps,
        uint16 platformBps,
        uint16 referrerBps
    ) external {
        require(creatorBps + platformBps + referrerBps == BPS, "bps!=100%");
        agents[tokenId] = AgentConfig({
            creator: msg.sender,
            priceWei: priceWei,
            creatorBps: creatorBps,
            platformBps: platformBps,
            referrerBps: referrerBps,
            exists: true
        });
        emit AgentListed(tokenId, msg.sender, priceWei);
    }

    function createRequest(uint256 tokenId, bytes32 promptHash) external payable nonReentrant returns (uint256 requestId) {
        AgentConfig memory cfg = agents[tokenId];
        require(cfg.exists, "agent not listed");
        require(msg.value == cfg.priceWei, "wrong price");

        requestId = nextRequestId++;
        requests[requestId] = Request({
            buyer: msg.sender,
            tokenId: tokenId,
            promptHash: promptHash,
            paidWei: uint96(msg.value),
            createdAt: uint40(block.timestamp),
            status: Status.Pending,
            resultHash: bytes32(0),
            storageRoot: bytes32(0)
        });

        emit RequestCreated(requestId, tokenId, msg.sender, promptHash, msg.value);
    }

    function cancelRequest(uint256 requestId) external nonReentrant {
        Request storage r = requests[requestId];
        require(r.status == Status.Pending, "not pending");
        require(msg.sender == r.buyer, "not buyer");
        require(block.timestamp >= r.createdAt + TIMEOUT, "too early");

        r.status = Status.Cancelled;
        withdrawable[r.buyer] += r.paidWei;
        emit RequestCancelled(requestId);
    }

    function fulfillRequest(
        uint256 requestId,
        bytes32 resultHash,
        bytes32 storageRoot,
        address referrer
    ) external nonReentrant onlyExecutor {
        Request storage r = requests[requestId];
        require(r.status == Status.Pending, "not pending");

        AgentConfig memory cfg = agents[r.tokenId];

        r.status = Status.Fulfilled;
        r.resultHash = resultHash;
        r.storageRoot = storageRoot;

        uint256 total = r.paidWei;
        uint256 creatorAmt = (total * cfg.creatorBps) / BPS;
        uint256 platAmt   = (total * cfg.platformBps) / BPS;
        uint256 refAmt    = (total * cfg.referrerBps) / BPS;

        withdrawable[cfg.creator] += creatorAmt;
        withdrawable[owner()] += platAmt;
        if (refAmt > 0 && referrer != address(0)) withdrawable[referrer] += refAmt;

        emit RequestFulfilled(requestId, resultHash, storageRoot);
    }

    function withdraw() external nonReentrant {
        uint256 amt = withdrawable[msg.sender];
        require(amt > 0, "no balance");
        withdrawable[msg.sender] = 0;
        (bool ok,) = msg.sender.call{value: amt}("");
        require(ok, "transfer failed");
    }
}
```

Why this contract design fits Track 3 and judging:
- It’s **real financial rails** (micropayment escrow + revenue share). citeturn2view0  
- It produces **obvious on-chain activity** for ChainScan verification (request events, fulfill events, withdrawals). citeturn18view2turn1view0  

#### AgentINFT.sol (ERC‑7857-based, MVP-friendly)

ERC‑7857 extends ERC‑721 with encrypted metadata and oracle-verified re-encryption on transfer, plus `authorizeUsage` for AI-as-a-service models. citeturn4view4turn4view5  
The 0G INFT integration guide suggests `@0gfoundation/0g-ts-sdk`, Hardhat/Foundry, and shows how to deploy a mock oracle for testing. citeturn6view0turn20view0

For MVP: implement
- `mint(to, encryptedURI, metadataHash)`  
- `authorizeUsage(tokenId, executor, permissions)`  
- `getEncryptedURI(tokenId)` + `getMetadataHash(tokenId)`  
and defer full production transfer oracle support to stretch.

### 0G Storage KV schema (keys + examples)

0G’s TypeScript Storage SDK shows KV writes by selecting nodes, creating a `Batcher`, and calling `streamDataBuilder.set(streamId, keyBytes, valueBytes)`, then `batcher.exec()`. Reads use `KvClient.getValue(streamId, base64(keyBytes))`. citeturn8view0  

**Stream strategy (recommendation)**
- `streamId = keccak256("agent:"+tokenId)` truncated/normalized to 32-byte hex (or store a precomputed mapping in Supabase).
- One stream per agent gives clean sharding and avoids key collisions.

**Key format (UTF‑8 → bytes)**
- Prefix with namespaces: `profile:`, `mem:`, `run:`, `stats:`.

**Value format**
- JSON (stringified) for readability in debugging.
- For larger fields: value stores a pointer (root hash) to a file stored in 0G Storage log/file layer.

Example KV pairs (human-readable):

```text
streamId: 0x000...<32-byte stream>

key: "profile:v1"
value: {"name":"WeekendPlanner","category":"travel","priceWei":"10000000000000000","model":"zai-org/GLM-5-FP8"}

key: "mem:summary"
value: {"t":1713180000,"summary":"User prefers budget trips, vegetarian meals, museums."}

key: "run:last"
value: {"requestId":42,"resultRoot":"0xabc...","teeChatId":"ZG-Res-Key:...","verified":true}

key: "stats"
value: {"runs":19,"uniqueUsers":11,"lastRunAt":1713180999}
```

### API surface (recommended)

Keep APIs small and auditable (OWASP API Security Top 10 emphasizes authorization failures, broken auth, and resource exhaustion as top risks). citeturn26search1

**Public (frontend → API)**
- `POST /api/agents/mint`  
  - Creates encrypted metadata blob → uploads to 0G Storage → mints INFT → lists agent in AgentMarket
- `POST /api/requests/prepare`  
  - Creates prompt JSON, returns `promptHash` and recommended `priceWei` (frontend submits on-chain)
- `GET /api/requests/:id`  
  - Read status from chain + indexed data from Supabase
- `GET /api/agents/:tokenId/state`  
  - Reads KV (`mem:summary`, `stats`, etc.)

**Internal (worker/executor)**
- `POST /api/executor/poll` or a cron/queue worker
  - Reads `RequestCreated` events from ChainScan RPC
  - Runs inference on 0G Compute
  - Writes results to 0G Storage (KV + optional blob)
  - Calls `fulfillRequest()` on-chain

### 0G Compute integration details (showcase-worthy)

The official inference docs show:
- Node.js prerequisite (>=22) citeturn4view2  
- Broker initialization via `createZGComputeNetworkBroker` citeturn5view3  
- You may need to **deposit funds** and **transfer funds to provider sub-accounts**; in Node environments the SDK can auto-fund, whereas browser requires manual transfers to avoid wallet popups. citeturn5view1turn24view2  
- Optional TEE signature verification via `processResponse` using `ZG-Res-Key`. citeturn5view2turn5view3  

Minimal Node worker snippet outline:

```js
import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";

// mainnet RPC from 0G docs citeturn1view0
const provider = new ethers.JsonRpcProvider("https://evmrpc.0g.ai");
const wallet = new ethers.Wallet(process.env.EXECUTOR_PK, provider);

const broker = await createZGComputeNetworkBroker(wallet);

// Fund management: deposit + transfer to provider sub-account (once) citeturn5view1turn24view2
await broker.ledger.depositFund(10);
await broker.ledger.transferFund(process.env.PROVIDER_ADDR, "inference", BigInt(1e18));

const { endpoint, model } = await broker.inference.getServiceMetadata(process.env.PROVIDER_ADDR);
const headers = await broker.inference.getRequestHeaders(process.env.PROVIDER_ADDR);

const resp = await fetch(`${endpoint}/chat/completions`, {
  method: "POST",
  headers: { "Content-Type": "application/json", ...headers },
  body: JSON.stringify({ model, messages: [{ role: "user", content: "Hello" }] })
});

// Optional integrity verification via TEE signature citeturn5view2turn5view3
const chatID = resp.headers.get("ZG-Res-Key");
if (chatID) await broker.inference.processResponse(process.env.PROVIDER_ADDR, chatID);
```

### Privacy and “Sealed Inference” choice

Even though “Sealed Inference” is highlighted in Track 2, Track 3 judges will still reward privacy/verification when it improves product trust. HackQuest describes 0G privacy/security as using TEE secure execution environments for inference and end-to-end privacy patterns. citeturn2view0  
0G docs also discuss TEE verification modes and response signing/verification paths. citeturn5view2turn24view1  
The 0G blog emphasizes that 0G Compute runs workloads inside TEEs such that prompts are not visible to operators, and positions OpenAI-compatible access as a key integration point. citeturn14view0

For MVP:
- Use a provider/model that supports TEE verification.
- In the demo, show:
  - `ZG-Res-Key` header
  - `processResponse()` verification returning success
  - a stored “receipt” hash anchored on-chain (your contract’s `resultHash` + `storageRoot`)

## Delivery plan: roadmap, repo, deployment

### Milestones and time estimates (solo/lean team, ~4 weeks to May 16)

HackQuest confirms **May 16, 2026** as the submission deadline (UTC+8). citeturn2view0  
A solo roadmap that reliably ships:

**Sprint zero (1–2 days): foundation**
- Choose your single vertical template (e.g., “Study Buddy” or “Weekend Trip Planner”).
- Create repo skeleton + deploy hello-world contract to 0G testnet.
- Get faucet tokens (0.1/day per wallet on Galileo testnet) and validate wallet + RPC. citeturn21view0  

**Sprint one (4–5 days): on-chain rails**
- Implement `AgentMarket.sol` + tests (escrow, fulfill, cancel, withdraw).
- Deploy to testnet; verify basic flows in UI.
- Hardhat config must specify `evmVersion: "cancun"` per 0G chain deployment docs. citeturn10view0  

**Sprint two (5–6 days): INFT minting + encrypted metadata**
- Implement minimal ERC‑7857-style INFT contract (or adapt reference patterns).
- Encrypt agent metadata, upload to 0G Storage, store URI + hash in token. ERC‑7857 is designed for encrypted metadata and authorized usage models. citeturn4view4turn4view5  
- Add `authorizeUsage()` hook (store executor permissions) even if you don’t fully use it in MVP.

**Sprint three (5–7 days): 0G Compute worker + 0G Storage KV**
- Build executor that:
  - watches `RequestCreated` events
  - calls 0G Compute inference via broker
  - writes results to KV (and optionally writes a file/artifact)
  - calls `fulfillRequest()` to settle
- Use KV write/read patterns from the Storage SDK docs. citeturn8view0turn4view1  
- Add optional TEE integrity verification via `processResponse()` for demo wow-factor. citeturn5view2turn5view3  

**Sprint four (4–6 days): production UI + mainnet deployment**
- Ship a clean B2C UI:
  - Browse agents
  - Mint agent (creator)
  - Run agent (consumer)
  - Show “proof panel” with:
    - ChainScan tx links
    - storage root hash
    - KV state snapshot (read-back)
- Deploy contracts to **0G mainnet** and record addresses and explorer links (required). citeturn18view2turn1view0  

**Sprint five (2–3 days): polish + submission assets**
- Script demo video; record <3 min; ensure it shows actual product flow and 0G usage (no slides-only). citeturn18view2  
- README, diagrams, setup scripts, test accounts, and the required X post. citeturn18view0  

### Minimal viable feature set (MVP)

Must-have for submission validity + strong scoring:
- Deployed **mainnet** AgentMarket contract + **mainnet** INFT contract
- One “agent vertical” template
- End-to-end paid run flow:
  - user pays (on-chain request)
  - executor runs compute
  - results persist to 0G Storage (KV minimum)
  - executor fulfills + revenue split recorded on-chain
- Demo UI that shows:
  - on-chain tx
  - KV write/read proof
  - compute call proof (and ideally TEE verification)

### Stretch features (high judge ROI)

- “Gasless” UX by sponsored transactions (if you can implement safely)
- Atomic “mint + list” flow with one click
- On-chain referral codes (EIP‑712 signed referral claims) citeturn26search3
- Full ERC‑7857 secure transfer flow with real oracle (if available)
- Multi-agent compositions (“agent bundles”) to show Web4 composability

### GitHub repo structure (recommended)

```text
.
├─ apps/
│  ├─ web/                      # Next.js/React frontend
│  ├─ worker/                   # Node executor (event watcher + compute + storage KV)
│  └─ api/                      # Optional: separate API service (or keep in Next.js)
├─ packages/
│  ├─ contracts/                # Hardhat project
│  ├─ og/                       # 0G wrappers (compute broker, storage SDK, KV helpers)
│  └─ shared/                   # Types, utilities, schemas
├─ supabase/
│  ├─ migrations/
│  ├─ seed.sql
│  └─ rls-policies.md
├─ docs/
│  ├─ architecture.md
│  ├─ threat-model.md
│  └─ demo-script.md
└─ .github/workflows/
   ├─ ci.yml                    # lint, test, build
   └─ release.yml               # deploy web + trigger worker deploy
```

### CI/CD and deployment steps

**Smart contracts**
- Hardhat compile config must set `evmVersion: "cancun"` for 0G Chain compatibility. citeturn10view0  
- Use 0G mainnet RPC and Chain ID from 0G docs: Chain ID **16661**, RPC `https://evmrpc.0g.ai`. citeturn1view0

Hardhat config sketch:

```js
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: { evmVersion: "cancun", optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    ogMainnet: { url: "https://evmrpc.0g.ai", chainId: 16661, accounts: [process.env.DEPLOYER_PK] },
    ogTestnet: { url: "https://evmrpc-testnet.0g.ai", chainId: 16602, accounts: [process.env.DEPLOYER_PK] }
  }
};
```

These parameters (chain IDs, RPC URLs) are documented for mainnet/testnet by 0G. citeturn1view0turn21view0  

**App backend + worker**
- Use Node 22+ runtime for 0G Compute SDK compatibility. citeturn4view2turn24view2  
- Store secrets in deployment platform vault:
  - `EXECUTOR_PK` (never client-side)  
  - `OG_RPC_URL`, `OG_STORAGE_INDEXER`, `KV_NODE_URL`  
  - provider/model identifiers for 0G Compute  

**Supabase**
- Use Supabase for:
  - user auth
  - indexing agent listings and run history
  - rate limiting + abuse controls via RLS and server checks

**0G Storage**
- Use TypeScript SDK for uploads and KV operations (Batcher + KvClient). citeturn8view0turn4view0  
- Optionally use storage client CLI for manual debugging; KV reads require a KV node URL (not indexer). citeturn4view1turn19view0  

## Demo and submission package

### Required submission assets checklist (HackQuest)

From the official hackathon page, you must include:
- **0G integration proof**: mainnet contract address + explorer link with on-chain activity citeturn18view2  
- **≤ 3-minute demo video** showing the product flow and how 0G is used (no slide-only videos) citeturn18view2  
- **README/docs** with architecture diagram + 0G module explanation + repro steps + test accounts/faucet notes citeturn18view0  
- **Public X post** with hashtags `#0GHackathon #BuildOn0G` and tags `@0G_labs @0g_CN @0g_Eco @HackQuest_` citeturn18view0  

### A demo plan that maximizes judge perception

Your goal: in **180 seconds**, show value *and* proof.

**Recommended demo storyline**
- “We built a pay-per-use agent marketplace where agents are ownable INFTs, with on-chain revenue split, compute on 0G, memory on 0G Storage KV.”

**Video script with timestamps**
- **0:00–0:15** — Hook
  - Show the marketplace home: “Pick an agent, pay per run, get results with proofs.”
- **0:15–0:45** — Creator flow
  - Create agent → click Mint  
  - Show: transaction submitted → token appears (INFT minted)  
  - Immediately open ChainScan for mint tx / contract.
- **0:45–1:15** — Consumer flow (economic rails)
  - Choose agent → enter prompt → click “Pay & Run”
  - Wallet confirms payment; show request created event / tx link.
- **1:15–2:05** — Autonomous execution (0G Compute)
  - Cut to worker logs: event detected → call 0G Compute → response received
  - (Optional) show `ZG-Res-Key` and `processResponse()` verification success to highlight sealed/TEE integrity. citeturn5view2turn5view3
- **2:05–2:35** — Persistence (0G Storage KV + artifacts)
  - Show KV write (key `run:last`) and KV read-back (state updated)
  - Show a stored root hash / artifact pointer.
  - Mention 0G Storage’s log + KV layering supports structured mutable state. citeturn23view1turn8view0
- **2:35–2:55** — Settlement proof
  - Worker calls `fulfillRequest()` → open ChainScan showing fulfill tx + revenue split withdrawable balances.
- **2:55–3:00** — Close
  - “This is Track 3: Agent-as-a-Service with micropayments + revenue-sharing, running on 0G.”

### X post copy (ready to paste)

Use exactly the required hashtags and tags. citeturn18view0

```text
Introducing AgentCart — a pay‑per‑use AI Agent marketplace where each agent is an INFT (ERC‑7857) and every run settles on-chain with revenue-sharing.

✅ 0G Chain: INFT mint + on-chain escrow & splits
✅ 0G Compute: inference execution (+ TEE integrity verification)
✅ 0G Storage KV: agent memory + execution receipts

Demo 👇 (video + screenshot)

#0GHackathon #BuildOn0G
@0G_labs @0g_CN @0g_Eco @HackQuest_
```

## Risk analysis and QA plan

### Common failure modes that sink hackathon scores

**Missing “validity” proof**
- Not deploying to **0G mainnet** and not providing a mainnet contract address + explorer link is a direct invalidation risk. citeturn18view2  

**Shallow 0G usage**
- Only using one module in a trivial way; judges explicitly score integration depth & innovation. citeturn2view0  

**Wallet-friction demo**
- If the demo requires repetitive wallet popups mid-chat, the experience looks broken. 0G Compute docs note browser environments require manual fund transfers, and auto-funding can cause unexpected wallet popups; mitigate by pre-funding provider accounts or moving calls server-side. citeturn5view1turn24view2  

**Security issues**
- Broken auth, prompt injection leading to unsafe outputs, or contract vulnerabilities (reentrancy, stuck funds).
- API authorization failures are among top OWASP API risks; treat “who can see which run/agent” as a serious design constraint. citeturn26search1turn26search2  

### Security model and mitigations

**On-chain**
- Use pull payments (`withdrawable`) and `ReentrancyGuard`.
- Add timeouts and cancellation so users can recover funds if the executor fails.
- If you add signatures (EIP‑712), include nonces and domain separation to prevent replay attacks. citeturn26search3  

**Off-chain**
- Store executor keys only server-side; never expose to client (0G Storage SDK best practices explicitly warn not to expose private keys client-side). citeturn8view0  
- Rate limit inference and KV operations to prevent cost blowouts (unrestricted resource consumption is a top API risk). citeturn26search1  

**AI safety / operational risk**
- Implement guardrails: max tokens, banned tools, output filters, and user reporting.
- Add “circuit breaker” flags in Supabase (disable an agent quickly).
- Use NIST AI RMF framing to document risks and mitigations (helpful in README to show maturity). citeturn26search0  

### QA / test plan (practical for solo dev)

**Smart contracts**
- Unit tests:
  - create/fulfill/cancel flows
  - split math correctness
  - timeout/cancel correctness
  - withdraw behavior
- Static analysis (optional but strong): Slither or similar.

**Worker (integration tests)**
- Run on testnet:
  - simulate RequestCreated event
  - mock compute response (or run a small paid request)
  - ensure KV write/read-back passes
  - ensure fulfill tx posts correct hashes

**Frontend**
- Playwright “happy path”:
  - connect wallet → mint agent → list agent → pay → view fulfilled result + proofs
- Negative tests:
  - wrong price, request timeout cancellation, KV node unavailable fallback.

## Score-maximizing checklist

This is a prioritized checklist aligned to judging criteria + submission gates.

**Validity gates (do not miss)**
- Mainnet deploy contracts + record addresses + ChainScan links. citeturn18view2turn1view0  
- Demo video ≤3 minutes showing the actual flow and explicit 0G usage. citeturn18view2  
- Public GitHub repo with meaningful commits during hackathon window. citeturn2view0  
- X post with required tags/hashtags. citeturn18view0  

**Maximize 0G Technical Integration Depth**
- Use **all four**: 0G Chain + Compute + Storage KV + INFT (ERC‑7857). citeturn2view0turn4view4turn8view0turn24view1  
- Show KV read-back (not only write). citeturn8view0turn4view1  
- Show optional TEE verification (`processResponse`) for compute integrity credibility. citeturn5view2turn5view3  

**Maximize Technical Completeness**
- One-click local run for judges:
  - `pnpm i`
  - `pnpm contracts:deploy:testnet`
  - `pnpm dev`
  - `pnpm worker:start`
- Provide seeded test accounts + faucet steps (0.1 0G/day in testnet faucet). citeturn21view0turn18view0  

**Maximize Product Value & Market Potential**
- Pick one vertical and make it *excellent* (UX > breadth).
- Include pricing logic + revenue split; Track 3 explicitly values rails. citeturn2view0  
- A short roadmap for creator growth + distribution loops.

**Maximize UX & demo quality**
- Pre-fund compute provider sub-account so demo doesn’t stall with funding popups. citeturn5view1turn24view2  
- UI has a “Proof” panel with:
  - Chain tx
  - storage root
  - KV state snapshot

**Maximize documentation**
- README includes: architecture diagram, module mapping, reproduction steps, and reviewer notes. citeturn18view0  
- Include threat model + known limitations (e.g., “ERC‑7857 transfer oracle is mocked in MVP”).

