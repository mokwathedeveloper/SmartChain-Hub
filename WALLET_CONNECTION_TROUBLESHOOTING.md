# Wallet Connection Troubleshooting

## Issue: "Connect your wallet" message appears even when wallet is connected

### Quick Fixes:

1. **Refresh the page** - Sometimes the connection state doesn't update properly
2. **Check browser console** - Open DevTools (F12) and look for wallet connection logs
3. **Reconnect wallet** - Click "Connect Wallet" button in top right header

### Step-by-Step Troubleshooting:

#### 1. Check MetaMask Connection
- Open MetaMask extension
- Ensure you're connected to **0G Galileo Testnet**
- Verify your account is connected to the site

#### 2. Add 0G Galileo Testnet to MetaMask
If you see "Switch to 0G" warning:
- **Network Name:** 0G Galileo Testnet
- **RPC URL:** https://evmrpc-testnet.0g.ai
- **Chain ID:** 16602
- **Currency:** A0GI
- **Explorer:** https://scan-testnet.0g.ai

#### 3. Manual Address Entry (Read-Only Mode)
If MetaMask isn't working:
1. Click "Connect Wallet" in header
2. Scroll down to "or enter address manually"
3. Enter your wallet address: `0x604cDbDBE7850bAd105C28bFE01Ad680520D451F`
4. Click "Connect"

#### 4. Check Browser Console Logs
Open DevTools (F12) → Console tab, look for:
```
Wallet state: { isConnected: true, address: "0x...", signer: true }
Accounts received: ["0x..."]
Wallet connected: 0x...
```

#### 5. Clear Browser Data
If still not working:
1. Clear site data: DevTools → Application → Storage → Clear site data
2. Refresh page
3. Reconnect wallet

### Expected Behavior:
- Header shows: `0x604c...451F` (green button)
- Payments page shows: Send/Receive/Stake/Withdraw tabs
- Onramp page shows: Card/M-Pesa payment options

### Still Not Working?
1. Try different browser (Chrome/Firefox)
2. Disable other wallet extensions
3. Use manual address entry as fallback
4. Check if MetaMask is locked/logged out

### Debug Information:
- **Main Wallet:** 0x604cDbDBE7850bAd105C28bFE01Ad680520D451F
- **Network:** 0G Galileo Testnet (Chain ID: 16602)
- **Balance Check:** https://scan-testnet.0g.ai/address/0x604cDbDBE7850bAd105C28bFE01Ad680520D451F
- **Faucet:** https://hub.0g.ai/faucet