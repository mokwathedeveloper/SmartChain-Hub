<div align="center">

<img src="../logo/logo.png" alt="SmartChain Hub" width="80" />

# 🔑 SmartChain Hub — Wallet & Contract Reference
### *0G Galileo Testnet · Chain ID 16602*

[![Network](https://img.shields.io/badge/Network-0G_Galileo_Testnet-0ea5e9?style=for-the-badge)](https://scan-testnet.0g.ai)
[![Chain ID](https://img.shields.io/badge/Chain_ID-16602-6366f1?style=for-the-badge)](.)
[![Faucet](https://img.shields.io/badge/Faucet-hub.0g.ai/faucet-10b981?style=for-the-badge)](https://hub.0g.ai/faucet)

</div>

---

## Deployer Wallet

| Property | Value |
|---|---|
| **Address** | `0x604cDbDBE7850bAd105C28bFE01Ad680520D451F` |
| **Network** | 0G Galileo Testnet (Chain ID 16602) |
| **Explorer** | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x604cDbDBE7850bAd105C28bFE01Ad680520D451F) |
| **Purpose** | Contract deployment · 0G Compute broker · 0G Storage uploads |

---

## Deployed Contract Addresses

| Contract | Address | Explorer | Purpose |
|---|---|---|---|
| 🤖 SmartChainAgentID | `0x69C619374c6B901b99941Df7238fceb80d7DCd08` | [↗](https://scan-testnet.0g.ai/address/0x69C619374c6B901b99941Df7238fceb80d7DCd08) | Soulbound NFT identity |
| 🔒 SmartChainAgentEscrow | `0x0A3951414c4097AF78953a97e49ad38293e9eA17` | [↗](https://scan-testnet.0g.ai/address/0x0A3951414c4097AF78953a97e49ad38293e9eA17) | Agent micropayments |
| 💸 SmartChainPayments | `0x540aFf6B167F8B5889d852d124C545F5f876A7eB` | [↗](https://scan-testnet.0g.ai/address/0x540aFf6B167F8B5889d852d124C545F5f876A7eB) | Send · stake · earn |
| 📊 SmartChainRevenue | `0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08` | [↗](https://scan-testnet.0g.ai/address/0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08) | Revenue distribution |
| 📝 SmartChainTransaction | `0xf95A1610be22046c334E3bD1b11D2B88519E6C52` | [↗](https://scan-testnet.0g.ai/address/0xf95A1610be22046c334E3bD1b11D2B88519E6C52) | Immutable tx records |

---

## Add 0G Galileo to MetaMask

```
Network Name:     0G Galileo Testnet
RPC URL:          https://evmrpc-testnet.0g.ai
Chain ID:         16602
Currency Symbol:  A0GI
Block Explorer:   https://scan-testnet.0g.ai
```

**Quick add:** Click "Add to MetaMask" on [scan-testnet.0g.ai](https://scan-testnet.0g.ai) or add manually using the values above.

---

## Get Testnet Tokens

```
1. Go to https://hub.0g.ai/faucet
2. Select: 0G Galileo Testnet
3. Enter your wallet address
4. Claim free A0GI
5. Wait ~30 seconds for confirmation
```

Minimum required for operations:
```
Mint Agent ID:          ~0.001 A0GI (gas)
Record transaction:     ~0.001 A0GI (gas)
Deposit to escrow:      custom amount + gas
Stake:                  custom amount + gas
0G Storage upload:      ~0.001 A0GI (gas)
```

---

## Environment Variable Reference

Copy these into your `.env.local` and `.env` files:

```env
# ── Frontend (.env.local) ──────────────────────────────────────
NEXT_PUBLIC_CONTRACT_ADDRESS=0xf95A1610be22046c334E3bD1b11D2B88519E6C52
NEXT_PUBLIC_PAYMENTS_CONTRACT=0x540aFf6B167F8B5889d852d124C545F5f876A7eB
NEXT_PUBLIC_AGENT_ID_CONTRACT=0x69C619374c6B901b99941Df7238fceb80d7DCd08
NEXT_PUBLIC_AGENT_ESCROW_CONTRACT=0x0A3951414c4097AF78953a97e49ad38293e9eA17

# ── Network ────────────────────────────────────────────────────
NEXT_PUBLIC_CHAIN=og_galileo
NEXT_PUBLIC_RPC_URL=https://evmrpc-testnet.0g.ai
NEXT_PUBLIC_CHAIN_ID=16602
NEXT_PUBLIC_EXPLORER=https://scan-testnet.0g.ai
```

---

## Security Notes

> ⚠️ This wallet is for **testnet development only**. It holds no real value.

For production deployment:
- Generate a new wallet with a hardware key manager (Ledger / Trezor)
- Store private keys in environment variables — **never in source code**
- Use multi-sig (Gnosis Safe) for contract ownership
- Rotate keys on a regular schedule
- Audit contracts before mainnet deployment

---

## Contract Interaction Quick Reference

```bash
# Check if wallet has Agent ID
cast call 0x69C619374c6B901b99941Df7238fceb80d7DCd08 \
  "hasMinted(address)(bool)" \
  <YOUR_WALLET> \
  --rpc-url https://evmrpc-testnet.0g.ai

# Get agent identity
cast call 0x69C619374c6B901b99941Df7238fceb80d7DCd08 \
  "getAgent(address)((address,bytes32,bytes32,uint256,uint256,uint256,bool))" \
  <YOUR_WALLET> \
  --rpc-url https://evmrpc-testnet.0g.ai

# Get total agents minted
cast call 0x69C619374c6B901b99941Df7238fceb80d7DCd08 \
  "totalAgents()(uint256)" \
  --rpc-url https://evmrpc-testnet.0g.ai
```

---

<div align="center">

**SmartChain Hub** · 0G Galileo Testnet · Chain ID 16602

[🔍 ChainScan](https://scan-testnet.0g.ai) · [💧 Faucet](https://hub.0g.ai/faucet)

</div>
