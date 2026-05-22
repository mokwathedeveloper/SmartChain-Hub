// chains.ts — single source of truth for all supported networks
// Set NEXT_PUBLIC_CHAIN in .env.local to:
//   "og_galileo"  → 0G Galileo Testnet (chainId 16602) — current hackathon testnet
//   "og_mainnet"  → 0G Mainnet        (chainId 16661) — production
//   "og_newton"   → 0G Newton Testnet (chainId 16600) — legacy
//   "ethereum" | "sepolia"
// Defaults to "og_galileo" while mainnet tokens are pending.

export type ChainKey = 'og_mainnet' | 'og_galileo' | 'og_newton' | 'ethereum' | 'sepolia';

export const CHAINS: Record<ChainKey, {
  name: string;
  chainId: number;
  rpc: string;
  explorer: string;
  explorerTx: (hash: string) => string;
  explorerAddr: (addr: string) => string;
  nativeCurrency: string;
  isHackathonChain: boolean;
}> = {
  og_mainnet: {
    name: '0G Mainnet',
    chainId: 16661,
    rpc: 'https://evmrpc.0g.ai',
    explorer: 'https://chainscan.0g.ai',
    explorerTx:   (h) => `https://chainscan.0g.ai/tx/${h}`,
    explorerAddr: (a) => `https://chainscan.0g.ai/address/${a}`,
    nativeCurrency: 'A0GI',
    isHackathonChain: true,
  },
  og_galileo: {
    name: '0G Galileo Testnet',
    chainId: 16602,
    rpc: 'https://evmrpc-testnet.0g.ai',
    explorer: 'https://chainscan-galileo.0g.ai',
    explorerTx:   (h) => `https://chainscan-galileo.0g.ai/tx/${h}`,
    explorerAddr: (a) => `https://chainscan-galileo.0g.ai/address/${a}`,
    nativeCurrency: 'A0GI',
    isHackathonChain: true,   // ← current hackathon testnet
  },
  og_newton: {
    name: '0G Newton Testnet',
    chainId: 16600,
    rpc: 'https://rpc-testnet.0g.ai',
    explorer: 'https://scan-testnet.0g.ai',
    explorerTx:   (h) => `https://scan-testnet.0g.ai/tx/${h}`,
    explorerAddr: (a) => `https://scan-testnet.0g.ai/address/${a}`,
    nativeCurrency: 'A0GI',
    isHackathonChain: true,
  },
  ethereum: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpc: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY || ''}`,
    explorer: 'https://etherscan.io',
    explorerTx:   (h) => `https://etherscan.io/tx/${h}`,
    explorerAddr: (a) => `https://etherscan.io/address/${a}`,
    nativeCurrency: 'ETH',
    isHackathonChain: false,
  },
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpc: `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY || ''}`,
    explorer: 'https://sepolia.etherscan.io',
    explorerTx:   (h) => `https://sepolia.etherscan.io/tx/${h}`,
    explorerAddr: (a) => `https://sepolia.etherscan.io/address/${a}`,
    nativeCurrency: 'ETH',
    isHackathonChain: false,
  },
};

// Active chain — driven by env var, defaults to Galileo testnet while mainnet tokens are pending
export const ACTIVE_CHAIN_KEY = (process.env.NEXT_PUBLIC_CHAIN as ChainKey) || 'og_galileo';
export const ACTIVE_CHAIN = CHAINS[ACTIVE_CHAIN_KEY];
