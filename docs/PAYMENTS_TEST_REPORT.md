# Payments — Manual Test Report

> SmartChain Hub · 0G APAC Hackathon 2026
> Date: April 30, 2026
> Network: 0G Galileo Testnet · Chain ID `16602`

---

## Contract Under Test

| Field | Value |
|---|---|
| Contract | `SmartChainPayments` |
| Address | `0x540aFf6B167F8B5889d852d124C545F5f876A7eB` |
| Explorer | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x540aFf6B167F8B5889d852d124C545F5f876A7eB) |
| Bytecode | 9099 bytes — confirmed deployed |

---

## Test Wallet

| Field | Value |
|---|---|
| Address | `0x604cDbDBE7850bAd105C28bFE01Ad680520D451F` |
| Balance at test time | `0.062345687935854954 A0GI` |
| Role | Sender + Recipient (self-send for test) |

---

## Test 1 — Send A0GI via `sendFunds()`

### Input

| Field | Value |
|---|---|
| Function | `sendFunds(address payable _to, string _memo)` |
| From | `0x604cDbDBE7850bAd105C28bFE01Ad680520D451F` |
| To | `0x604cDbDBE7850bAd105C28bFE01Ad680520D451F` |
| Amount | `0.001 A0GI` |
| Memo | `Test payment from CLI` |

### Result

| Field | Value |
|---|---|
| Tx Hash | `0x85386998553f88fe198e79269295d3333c3b7aa5fcebaad4909fe8542815c7e4` |
| Block | `30746255` |
| Status | ✅ SUCCESS |
| Explorer | [View on ChainScan ↗](https://scan-testnet.0g.ai/tx/0x85386998553f88fe198e79269295d3333c3b7aa5fcebaad4909fe8542815c7e4) |

### Event Decoded — `FundsSent`

| Field | Value |
|---|---|
| `from` | `0x604cDbDBE7850bAd105C28bFE01Ad680520D451F` |
| `to` | `0x604cDbDBE7850bAd105C28bFE01Ad680520D451F` |
| `amount` | `0.000995 A0GI` (after 0.5% fee deducted) |
| `fee` | `0.000005 A0GI` (0.5% → distributed to stakers) |
| `memo` | `Test payment from CLI` |

### Fee Verification

```
Sent:     0.001000 A0GI
Fee:      0.000005 A0GI  (0.5% ✓)
Received: 0.000995 A0GI  (99.5% ✓)
```

---

## How to Test Manually in the UI

1. Go to https://smartchainhubfrontend.vercel.app/payments
2. Connect wallet `0x604c...451f` via MetaMask
3. Click the **Send** tab
4. Fill in the form:
   - **Recipient Address:** `0x604cDbDBE7850bAd105C28bFE01Ad680520D451F`
   - **Amount (A0GI):** `0.001`
   - **Memo:** `Test payment`
5. Click **Send Funds**
6. Approve the transaction in MetaMask
7. Verify on [ChainScan](https://scan-testnet.0g.ai)

---

## CLI Test Script

The test was executed using the following Node.js script:

```js
const { ethers } = require('ethers');

const PAYMENTS_ABI = [
  'function sendFunds(address payable _to, string _memo) external payable',
  'event FundsSent(address indexed from, address indexed to, uint256 amount, uint256 fee, string memo)',
];

const PAYMENTS_ADDR = '0x540aFf6B167F8B5889d852d124C545F5f876A7eB';

async function main() {
  const provider = new ethers.JsonRpcProvider(
    'https://evmrpc-testnet.0g.ai',
    { chainId: 16602, name: 'og' },
    { staticNetwork: true }
  );
  const signer   = new ethers.Wallet('<PRIVATE_KEY>', provider);
  const contract = new ethers.Contract(PAYMENTS_ADDR, PAYMENTS_ABI, signer);

  const tx = await contract.sendFunds(
    '0x604cDbDBE7850bAd105C28bFE01Ad680520D451F',
    'Test payment from CLI',
    { value: ethers.parseEther('0.001') }
  );
  const receipt = await tx.wait();
  console.log('Status:', receipt.status === 1 ? 'SUCCESS' : 'FAILED');
  console.log('Block:', receipt.blockNumber);
  console.log('Tx:', tx.hash);
}
main();
```

---

## Infrastructure Status at Test Time

| Service | URL | Status |
|---|---|---|
| Frontend | https://smartchainhubfrontend.vercel.app | ✅ Live |
| AI Agent | https://smartchain-ai-agent.onrender.com | ✅ Healthy |
| Payments Contract | `0x540a...7eB` on 0G Galileo | ✅ Deployed |
| AgentID Contract | `0x0Dd3...c911` on 0G Galileo | ✅ Deployed |

---

## Render CLI Setup

Render CLI v2.16.0 installed and authenticated:

```bash
# Install
curl -sL https://github.com/render-oss/cli/releases/download/v2.16.0/cli_2.16.0_linux_amd64.zip -o render.zip
unzip render.zip && mv cli_v2.16.0 ~/.local/bin/render && chmod +x ~/.local/bin/render

# Login
render login

# Set workspace
render workspace set tea-d7n62m4vikkc73b42n2g

# List services
render services
```

### Active Render Services

| Name | Type | ID |
|---|---|---|
| SmartChain-Hub (backend) | Web Service | `srv-d7n640qpmmbs73cb4mpg` |
| smartchain-ai-agent | Web Service | `srv-d7n652j7uimc73b96jlg` |
| smartchain-hub-ai | Web Service | `srv-d7n65l37uimc73b96u20` |

---

## AI Agent Health Check

```bash
curl https://smartchain-ai-agent.onrender.com/health
```

Response:
```json
{
  "agent": "SmartChain AI v1.0",
  "og_compute": true,
  "og_compute_model": "llama-3.1-8b-instruct",
  "og_compute_rpc": "https://evmrpc-testnet.0g.ai",
  "status": "healthy"
}
```

---

## Rust Smart Contract Compilation

```bash
# Install toolchain
rustup target add wasm32-unknown-unknown

# Compile
cd blockchain/rust-optimizer
cargo build --target wasm32-unknown-unknown --release

# Output
target/wasm32-unknown-unknown/release/smartchain_rust_optimizer.wasm  (220KB)
```

Warnings fixed:
- `to_binary` → `to_json_binary` (deprecated API)
- `total_delta` → `_total_delta` (unused variable)

Result: **0 warnings, 0 errors** ✓
