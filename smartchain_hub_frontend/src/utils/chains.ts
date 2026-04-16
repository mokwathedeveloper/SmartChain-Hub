// chains.ts — single source of truth for all supported networks
// Set NEXT_PUBLIC_CHAIN in .env.local to "og_mainnet" | "og_newton" | "ethereum" | "sepolia"
// Defaults to "og_mainnet" for hackathon submission

export type ChainKey = 'og_mainnet' | 'og_newton' | 'ethereum' | 'sepolia';

export const CHAINS: Record<ChainKey, {
  name: string;
  chainId: number;
  rpc: string;
  explorer: string;
  explorerTx: (hash: string) => string;
  nativeCurrency: string;
  isHackathonChain: boolean;
}> = {
  og_mainnet: {
    name: '0G Mainnet',
    chainId: 16661,
    rpc: 'https://evmrpc.0g.ai',
    explorer: 'https://chainscan.0g.ai',
    explorerTx: (h) => `https://chainscan.0g.ai/tx/${h}`,
    nativeCurrency: 'A0GI',
    isHackathonChain: true,   // ← primary for 0G APAC Hackathon
  },
  og_newton: {
    name: '0G Newton Testnet',
    chainId: 16600,
    rpc: 'https://rpc-testnet.0g.ai',
    explorer: 'https://scan-testnet.0g.ai',
    explorerTx: (h) => `https://scan-testnet.0g.ai/tx/${h}`,
    nativeCurrency: 'A0GI',
    isHackathonChain: true,
  },
  ethereum: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpc: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY || ''}`,
    explorer: 'https://etherscan.io',
    explorerTx: (h) => `https://etherscan.io/tx/${h}`,
    nativeCurrency: 'ETH',
    isHackathonChain: false,
  },
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpc: `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY || ''}`,
    explorer: 'https://sepolia.etherscan.io',
    explorerTx: (h) => `https://sepolia.etherscan.io/tx/${h}`,
    nativeCurrency: 'ETH',
    isHackathonChain: false,
  },
};

// Active chain — driven by env var, defaults to 0G Mainnet
export const ACTIVE_CHAIN_KEY = (process.env.NEXT_PUBLIC_CHAIN as ChainKey) || 'og_mainnet';
export const ACTIVE_CHAIN = CHAINS[ACTIVE_CHAIN_KEY];
