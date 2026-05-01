# AgentIDCard — Bug Fixes & Implementation Log

> SmartChain Hub · 0G APAC Hackathon 2026
> Date: April 30, 2026

---

## Overview

This document records every bug found, root cause analysis, fix applied, and commit reference for the `AgentIDCard` component and related wallet/contract infrastructure.

---

## Bug 1 — AgentIDCard Flicker / Disappear After Wallet Connect

### Symptom
After connecting wallet, the Agent ID card would briefly appear then disappear or flash blank.

### Root Cause
Three compounding issues:

1. **`isConnected` vs `signer` race** — `isConnected = !!address` and `signer` are set in separate `setState` calls inside `Web3Context._connect`. One render frame existed where `isConnected=true` but `signer=null` — all 4 render conditions were false → blank body.

2. **Two `useEffect`s racing on `[signer]`** — `Web3Context._connect` sets `setSigner` twice during wallet connection (once before chain switch, once after). Each time signer changed, the disconnect effect reset `agent=null`, `hasFetched=false` → card disappeared.

3. **`initialLoad` started as `true`** — caused immediate spinner on every render before any fetch started.

### Fix
- Introduced `ready = isConnected && !!signer` — all render conditions gate on both being truthy
- Merged two `useEffect`s into one with `addressRef` to track fetched address
- `fetchingRef` prevents duplicate in-flight fetches
- Address normalized to `.toLowerCase()` before comparison — MetaMask returns mixed-case checksummed addresses
- `setHasFetched(true)` moved to `finally` block — UI never stays blank even if RPC fails

### Files Changed
- `smartchain_hub_frontend/src/components/AgentIDCard.tsx`

### Commits
- `14ff3b5` — eliminate AgentIDCard flicker
- `9e59c6d` — stop dashboard redirecting to login

---

## Bug 2 — Dashboard Redirecting Away on Wallet Connect

### Symptom
After connecting wallet, the entire dashboard page unmounted and redirected to `/login`, wiping all AgentIDCard state.

### Root Cause
`useAuth()` in `dashboard.tsx` called `router.push('/login')` when no Supabase session existed. The AgentIDCard only needs wallet connection — not Supabase auth. The redirect unmounted the component mid-fetch.

### Fix
```ts
// Before
const { user } = useAuth();

// After
const { user } = useAuth(false); // false = don't redirect if no Supabase session
```

### Files Changed
- `smartchain_hub_frontend/src/pages/dashboard.tsx`

### Commit
- `9e59c6d`

---

## Bug 3 — Duplicate Wallet Connect Calls

### Symptom
Console error: `MetaMask - RPC Error: Request of type 'wallet_requestPermissions' already pending`

Clicking Connect Wallet multiple times before MetaMask responded fired multiple `eth_requestAccounts` calls simultaneously.

### Root Cause
`connectWallet` in `Web3Context` had no in-flight guard — every click fired a new request.

### Fix
```ts
const connectingRef = useRef(false);

const connectWallet = async () => {
  if (connectingRef.current) return; // ignore duplicate clicks
  connectingRef.current = true;
  try { ... } finally {
    connectingRef.current = false;
  }
};
```

### Files Changed
- `smartchain_hub_frontend/src/context/Web3Context.tsx`

### Commit
- `b201279`

---

## Bug 4 — False "Insufficient A0GI" Error on Mint

### Symptom
Clicking "Mint Agent ID" immediately showed "Insufficient A0GI" error even when the wallet had funds.

### Root Cause (Part 1)
`(signer as any).provider` returned the raw MetaMask provider object which does not have a `getBalance` method — ethers `BrowserProvider` does.

### Root Cause (Part 2)
`balance === BigInt(0)` only caught exactly zero balance. Any dust amount passed through but then failed on gas estimation.

### Fix
```ts
// Before
const provider = (signer as any).provider;
const balance = await provider.getBalance(addr);
if (balance === BigInt(0)) { ... }

// After
const ethersProvider = signer.provider as ethers.Provider;
const balance = await ethersProvider.getBalance(addr);
if (balance < ethers.parseEther("0.001")) { ... }
```

### Files Changed
- `smartchain_hub_frontend/src/components/AgentIDCard.tsx`

### Commits
- `ae59814` — fix provider type
- `ac91402` — fix balance threshold

---

## Bug 5 — Mint Button Not Visible (MetaMask Provider Timeout)

### Symptom
After wallet connected, the mint button never appeared. The agent card showed a blank body or stayed on the loading spinner indefinitely.

### Root Cause
`getContract(signer)` passed the MetaMask `BrowserProvider` signer to ethers.Contract for **read calls** (`hasMinted`, `getAgent`). Every read call through MetaMask's provider triggers `eth_chainId` + `eth_blockNumber` network detection. On 0G Galileo testnet these requests **timed out** in the browser context → ethers threw → catch block ran → `agent` stayed `null` → `hasFetched=true` → mint button showed but contract data was never loaded.

### Diagnosis
Verified via direct RPC calls:
```bash
# Contract responds correctly via direct HTTP
curl -X POST https://evmrpc-testnet.0g.ai \
  -d '{"method":"eth_call","params":[{"to":"0x69C6...","data":"0x38e21cce..."}]}'
# Returns: hasMinted = true, reputation = 3
```

The issue was exclusively MetaMask's provider network detection overhead.

### Fix
Introduced a dedicated static-network read-only provider for all view calls:

```ts
const OG_NETWORK = ethers.Network.from({ chainId: 16602, name: 'og-galileo' });

function getReadProvider() {
  return new ethers.JsonRpcProvider(
    'https://evmrpc-testnet.0g.ai',
    OG_NETWORK,
    { staticNetwork: OG_NETWORK } // skips network detection entirely
  );
}

// Read calls use getReadContract() — direct RPC, no MetaMask overhead
// Write calls use getContract(signer) — MetaMask signing required
```

### Files Changed
- `smartchain_hub_frontend/src/utils/agentId.ts`

### Commit
- `b9e110b`

---

## Feature — Manual Re-mint (Reset & Re-mint)

### Problem
The `SmartChainAgentID` contract enforces `require(!hasMinted[msg.sender])` — one mint per wallet. There was no way to re-mint for testing or manual flows.

### Solution
Added `resetMint(address)` owner-only function to the contract, redeployed, and added a "Reset & Re-mint" button to the UI.

### Contract Change
```solidity
function resetMint(address _wallet) external onlyOwner {
    require(hasMinted[_wallet], "Wallet has not minted");
    hasMinted[_wallet] = false;
    delete agents[_wallet];
    if (totalAgents > 0) totalAgents--;
}
```

### New Contract Address
`0x0Dd3Ac67C684630273d5369a5DBaC174EB44c911` on 0G Galileo Testnet

### UI Change
"Reset & Re-mint" button added next to Refresh in the agent card — visible only when agent exists. Clicking it:
1. Confirms via dialog
2. Calls `resetMint(address)` on-chain (owner only)
3. Clears local state
4. Re-fetches — shows Mint Agent ID button

### Files Changed
- `blockchain/contracts/SmartChainAgentID.sol`
- `smartchain_hub_frontend/src/utils/agentId.ts`
- `smartchain_hub_frontend/src/components/AgentIDCard.tsx`

### Commits
- `18f7847` — contract resetMint function
- `e06148d` — ABI + new contract address
- `8d3382d` — Reset & Re-mint UI button
- `4083249` — hardcode contract address as fallback for Vercel

---

## Deployment

### Vercel Environment Update
Updated `NEXT_PUBLIC_AGENT_ID_CONTRACT` via Vercel CLI:
```bash
vercel env rm NEXT_PUBLIC_AGENT_ID_CONTRACT production
echo "0x0Dd3Ac67C684630273d5369a5DBaC174EB44c911" | vercel env add NEXT_PUBLIC_AGENT_ID_CONTRACT production
vercel --prod
```

### Security Note
`.env` and `.env.local` files are listed in `.gitignore` at root, frontend, backend, and ai-agent levels. These files are **never committed**. Only `.env.example` files with placeholder values are tracked. Vercel secrets are managed exclusively via Vercel CLI/dashboard.

---

## Contract Addresses (Final)

| Contract | Address | Network | Notes |
|---|---|---|---|
| SmartChainAgentID **(active)** | `0x69C619374c6B901b99941Df7238fceb80d7DCd08` | 0G Galileo | Used in README · SUBMISSION_CHECKLIST · all docs |
| SmartChainAgentID (local .env.local) | `0x0Dd3Ac67C684630273d5369a5DBaC174EB44c911` | 0G Galileo | Redeployed with `resetMint()` — used in `.env.local` + `agentId.ts` fallback |
| SmartChainTransaction | `0xf95A1610be22046c334E3bD1b11D2B88519E6C52` | 0G Galileo | |
| SmartChainRevenue | `0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08` | 0G Galileo | |
| SmartChainPayments | `0x540aFf6B167F8B5889d852d124C545F5f876A7eB` | 0G Galileo | |
| SmartChainAgentEscrow | `0x0A3951414c4097AF78953a97e49ad38293e9eA17` | 0G Galileo | |

> **Note:** Two AgentID contract addresses exist because the contract was redeployed to add `resetMint()`. The `.env.local` uses `0x0Dd3...` (newer, has resetMint). The README and submission docs use `0x69C6...` (original). Both are deployed and functional on 0G Galileo Testnet. For the hackathon submission, use `0x69C619374c6B901b99941Df7238fceb80d7DCd08` as the canonical address.
