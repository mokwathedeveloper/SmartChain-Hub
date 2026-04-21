import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

declare global { interface Window { ethereum?: any; } }

// 0G Galileo Testnet (hackathon deployment)
const OG_GALILEO = {
  chainId: '0x40DA',  // 16602 in hex
  chainName: '0G Galileo Testnet',
  nativeCurrency: { name: 'A0GI', symbol: 'A0GI', decimals: 18 },
  rpcUrls: ['https://evmrpc-testnet.0g.ai'],
  blockExplorerUrls: ['https://scan-testnet.0g.ai'],
};

// 0G Mainnet (for future)
const OG_MAINNET = {
  chainId: '0x4115',  // 16661 in hex
  chainName: '0G Mainnet',
  nativeCurrency: { name: 'A0GI', symbol: 'A0GI', decimals: 18 },
  rpcUrls: ['https://evmrpc.0g.ai'],
  blockExplorerUrls: ['https://chainscan.0g.ai'],
};

const TARGET_CHAIN = OG_GALILEO;
const TARGET_CHAIN_ID = '16602';

interface Web3ContextType {
  address: string | null;
  isConnected: boolean;
  chainId: string | null;
  chainName: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToOG: () => Promise<void>;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  noWallet: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress]   = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner]     = useState<ethers.Signer | null>(null);
  const [chainId, setChainId]   = useState<string | null>(null);
  const [noWallet, setNoWallet] = useState(false);

  const switchToOG = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: TARGET_CHAIN.chainId }],
      });
    } catch (e: any) {
      if (e.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [TARGET_CHAIN],
        });
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setNoWallet(true);
      setTimeout(() => setNoWallet(false), 5000);
      return;
    }
    setNoWallet(false);
    try {
      const bp = new ethers.BrowserProvider(window.ethereum);

      // Request accounts first (triggers MetaMask popup)
      const accounts = await bp.send('eth_requestAccounts', []);
      if (!accounts.length) return;

      // Check chain and switch if needed
      const network = await bp.getNetwork();
      const currentChainId = network.chainId.toString();
      if (currentChainId !== TARGET_CHAIN_ID) {
        await switchToOG();
        // Re-create provider after chain switch
        const bp2 = new ethers.BrowserProvider(window.ethereum);
        const sig2 = await bp2.getSigner();
        const net2 = await bp2.getNetwork();
        setProvider(bp2);
        setSigner(sig2);
        setAddress(accounts[0]);
        setChainId(net2.chainId.toString());
        return;
      }

      const sig = await bp.getSigner();
      setProvider(bp);
      setSigner(sig);
      setAddress(accounts[0]);
      setChainId(currentChainId);
    } catch (e: any) {
      if (e.code !== 4001) console.error('Wallet error:', e);
    }
  };

  const disconnectWallet = () => {
    setAddress(null); setProvider(null); setSigner(null); setChainId(null);
  };

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.on('accountsChanged', (a: string[]) =>
      a.length ? setAddress(a[0]) : disconnectWallet()
    );
    window.ethereum.on('chainChanged', () => window.location.reload());

    // Auto-reconnect if already connected
    window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts.length) connectWallet();
    }).catch(() => {});
  }, []);

  const chainName =
    chainId === '16602' ? '0G Galileo' :
    chainId === '16661' ? '0G Mainnet' :
    chainId === '16600' ? '0G Newton'  :
    chainId === '1'     ? 'Ethereum'   :
    chainId ? `Chain ${chainId}` : '';

  return (
    <Web3Context.Provider value={{
      address, isConnected: !!address, chainId, chainName,
      connectWallet, disconnectWallet, switchToOG, provider, signer, noWallet,
    }}>
      {children}
      {/* No wallet toast */}
      {noWallet && (
        <div className="fixed bottom-6 right-6 z-[200] bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-5 py-3 rounded-xl text-sm font-medium shadow-xl animate-slide-up flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p className="font-bold">No wallet detected</p>
            <a href="https://metamask.io/download/" target="_blank" rel="noreferrer"
              className="text-xs text-yellow-300 underline">Install MetaMask →</a>
          </div>
        </div>
      )}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error('useWeb3 must be used within Web3Provider');
  return ctx;
};
