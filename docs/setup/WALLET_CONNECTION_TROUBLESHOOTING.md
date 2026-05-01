# Wallet Connection Troubleshooting

## Quick Fixes

1. **Refresh the page** — connection state sometimes needs a reload
2. **Reconnect** — click **Connect Wallet** in the top-right header
3. **Check MetaMask** — ensure it is unlocked and connected to 0G Galileo Testnet

## Add 0G Galileo Testnet to MetaMask

| Field | Value |
|---|---|
| Network Name | 0G Galileo Testnet |
| RPC URL | `https://evmrpc-testnet.0g.ai` |
| Chain ID | `16602` |
| Currency | `A0GI` |
| Explorer | `https://scan-testnet.0g.ai` |

## Manual Address Entry (Read-Only Mode)

If MetaMask is unavailable:
1. Click **Connect Wallet** in the header
2. Scroll to **"or enter address manually"**
3. Enter your wallet address
4. Click **Connect** — the app loads in read-only mode

## Expected Console Logs (DevTools → Console)

```
Wallet state: { isConnected: true, address: "0x...", signer: true }
Accounts received: ["0x..."]
Wallet connected: 0x...
```

## Still Not Working?

1. Try a different browser (Chrome or Firefox)
2. Disable conflicting wallet extensions
3. Clear site data: DevTools → Application → Storage → Clear site data → Refresh
4. Use manual address entry as a fallback

## Network Details

- **Chain ID:** 16602
- **Faucet:** https://hub.0g.ai/faucet
- **Explorer:** https://scan-testnet.0g.ai
