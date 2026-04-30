# Payments & Revenue — Full Manual Test Report

> SmartChain Hub · 0G APAC Hackathon 2026
> Date: April 30, 2026
> Network: 0G Galileo Testnet · Chain ID `16602`
> Tester Wallet: `0x604cDbDBE7850bAd105C28bFE01Ad680520D451F`

---

## Contracts Under Test

| Contract | Address | Explorer |
|---|---|---|
| SmartChainPayments | `0x540aFf6B167F8B5889d852d124C545F5f876A7eB` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x540aFf6B167F8B5889d852d124C545F5f876A7eB) |
| SmartChainAgentEscrow | `0x0A3951414c4097AF78953a97e49ad38293e9eA17` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x0A3951414c4097AF78953a97e49ad38293e9eA17) |

---

## Test 1 — Send A0GI

### What it does
Sends A0GI to a recipient. Deducts 0.5% fee distributed to stakers.

### Test
- From: `0x604cDbDBE7850bAd105C28bFE01Ad680520D451F`
- To: `0x604cDbDBE7850bAd105C28bFE01Ad680520D451F` (self-send)
- Amount: `0.001 A0GI`
- Memo: `Test payment from CLI`

### Result ✅
| Field | Value |
|---|---|
| Tx Hash | `0x85386998553f88fe198e79269295d3333c3b7aa5fcebaad4909fe8542815c7e4` |
| Block | `30746255` |
| Amount received | `0.000995 A0GI` |
| Fee (0.5%) | `0.000005 A0GI` → stakers |
| Event | `FundsSent` emitted ✓ |

### How to test in UI
1. Go to `/payments` → **Send** tab
2. Recipient: `0x604cDbDBE7850bAd105C28bFE01Ad680520D451F`
3. Amount: `0.001` · Memo: `Test`
4. Click **Send Funds** → approve MetaMask

---

## Test 2 — Stake A0GI

### What it does
Locks A0GI in the contract earning 5% APY + share of platform fees.

### Test
- Amount staked: `0.005 A0GI`
- Tx: `0xf3d1da043256279a5f7ce4bd7a5ffa01b993b1eba0730fceeb29720e1f9a314b`

### Result ✅
| Field | Value |
|---|---|
| Staked | `0.005 A0GI` |
| APY | 5% |
| Event | `Staked` emitted ✓ |

### How to test in UI
1. Go to `/payments` → **Stake** tab
2. Amount: `0.005`
3. Click **Stake Now** → approve MetaMask

---

## Test 3 — Revenue Generation (sendFunds × 3)

### What it does
Each `sendFunds` call generates a 0.5% fee that accumulates in `totalRevenue`.

### Transactions
| # | Tx Hash | Amount | Fee Generated |
|---|---|---|---|
| 1 | `0xbb3dd4b3...db89d` | `0.005 A0GI` | `0.000025 A0GI` |
| 2 | `0xe057e5df...165f` | `0.005 A0GI` | `0.000025 A0GI` |
| 3 | `0xa5e6aaa9...b544` | `0.005 A0GI` | `0.000025 A0GI` |

### Result ✅
- Total platform revenue: `0.000085 A0GI`

---

## Test 4 — Distribute Revenue Share

### What it does
Owner calls `distributeRevenue()` to assign claimable earnings to a stakeholder.

### Test
- Tx: `0x9fa320020f0ca4d71b1cdde8d68fafdf84f817ddd9371ed1a7805eb37319b896`
- Amount distributed: `0.003 A0GI`
- Recipient: `0x604cDbDBE7850bAd105C28bFE01Ad680520D451F`

### Result ✅
- `pendingEarnings(0x604c...)` = `0.003 A0GI` ✓
- Claim button enabled in UI ✓

---

## Test 5 — Unstake

### What it does
Withdraws staked principal + accumulated reward.

### How to test in UI
1. Go to `/payments` → **Withdraw** tab
2. Click **Unstake 0.005 A0GI** → approve MetaMask
3. `0.005 A0GI + reward` returns to wallet

---

## Test 6 — Claim Revenue Share

### What it does
Claims `pendingEarnings` assigned by `distributeRevenue()`.

### On-chain state before claim
| Field | Value |
|---|---|
| Pending earnings | `0.003 A0GI` |
| Total revenue | `0.000085 A0GI` |
| Your stake | `0.005 A0GI` |

### How to test in UI
1. Go to `/payments` → **Withdraw** tab
2. Claimable Earnings shows `0.003 A0GI`
3. Click **Claim 0.003 A0GI** → approve MetaMask

---

## Test 7 — Agent Escrow (Agent-to-Agent Micropayments)

### Addresses
| Role | Address |
|---|---|
| Agent A (payer) | `0x604cDbDBE7850bAd105C28bFE01Ad680520D451F` |
| Agent B (service provider) | `0x756c8FaCaF44B673D0b0BAA76C11D9ED81065ef2` |

### Step 1 — Open Channel
- Agent A deposits `0.01 A0GI`, sets price `0.001 A0GI/call`
- Tx: `0x8604f7e4236583a62aff6baaa2acd3fb4893cfe0b3fe2b9ffe1e36a7fabd78b9`

**In UI:**
- Go to `/payments` → **Agent Escrow** tab
- Agent B address: `0x756c8FaCaF44B673D0b0BAA76C11D9ED81065ef2`
- Price per call: `0.001`
- Deposit: `0.01`
- Click **Open / Top-up Channel**

### Step 2 — Check Channel State
**In UI:**
- Agent A address: `0x604cDbDBE7850bAd105C28bFE01Ad680520D451F`
- Agent B address: `0x756c8FaCaF44B673D0b0BAA76C11D9ED81065ef2`
- Click **Check Channel**

Expected result:
```
Balance:     0.01 A0GI
Price/call:  0.001 A0GI
Calls:       1
Active:      true
```

### Step 3 — Claim Per Call (Agent B only)
- Only works if MetaMask is connected as Agent B (`0x756c...ef2`)
- Agent A field: `0x604cDbDBE7850bAd105C28bFE01Ad680520D451F`
- Click **Claim Per Call (as Agent B)**
- `0.00099 A0GI` (net of 1% fee) transferred to Agent B

### Step 4 — Withdraw Balance (Agent A)
**In UI:**
- Agent B field: `0x756c8FaCaF44B673D0b0BAA76C11D9ED81065ef2`
- Click **Withdraw Remaining Balance (as Agent A)**
- Remaining balance returns to Agent A wallet
- Channel becomes `Active: false`

### Verified Transactions
| Action | Tx Hash | Result |
|---|---|---|
| Open channel | `0x8604f7...78b9` | Balance: 0.01, Active: true |
| Agent B claims 1 call | `0xf7e16c...8d40` | Balance: 0.009, Calls: 1 |
| Agent A withdraws | `0xdc6e14...dfb1` | Balance: 0.0, Active: false |

### Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `Cannot open channel with yourself` | Agent B = your own address | Use a different address for Agent B |
| `Channel not active` on Withdraw | Wrong Agent B address in field | Enter the address you opened channel WITH |
| `Channel not active` on Claim | You are Agent A, not Agent B | Only Agent B can claim per call |
| `Caller is not agent B` | MetaMask = Agent A | Switch MetaMask to Agent B wallet |

---

## Revenue Page — Current State

### Why Revenue Shows $0
The Revenue page (`/revenue`) reads from **Supabase `revenue_shares` table** which requires a Supabase auth session (email/password login). The on-chain revenue is real and claimable via the Payments → Withdraw tab.

### On-Chain Revenue State (verified)
| Field | Value |
|---|---|
| Total Platform Revenue | `0.000085 A0GI` |
| Total Staked | `0.005 A0GI` |
| Your Stake | `0.005 A0GI` |
| Your Staking Reward | `0.000000002623985286 A0GI` (accruing at 5% APY) |
| Your Claimable Earnings | `0.003 A0GI` ← claim via Payments → Withdraw |

### To See Revenue Records in UI
1. Sign up / log in at `/signup` or `/login` with email + password
2. Run transactions via `/transactions` → Optimize → Confirm & Save
3. Revenue shares are created automatically per confirmed transaction
4. Go to `/revenue` → records appear in Recent Payouts table

---

## Final On-Chain Summary

| Action | Status | Tx Hash |
|---|---|---|
| Send 0.001 A0GI | ✅ | `0x85386998...` |
| Stake 0.005 A0GI | ✅ | `0xf3d1da04...` |
| Revenue tx 1 | ✅ | `0xbb3dd4b3...` |
| Revenue tx 2 | ✅ | `0xe057e5df...` |
| Revenue tx 3 | ✅ | `0xa5e6aaa9...` |
| Distribute 0.003 A0GI | ✅ | `0x9fa32002...` |
| Open escrow channel | ✅ | `0x8604f7e4...` |
| Agent B claim per call | ✅ | `0xf7e16c40...` |
| Agent A withdraw | ✅ | `0xdc6e14fa...` |

All contracts verified live on 0G Galileo Testnet.
Explorer: https://scan-testnet.0g.ai/address/0x540aFf6B167F8B5889d852d124C545F5f876A7eB
