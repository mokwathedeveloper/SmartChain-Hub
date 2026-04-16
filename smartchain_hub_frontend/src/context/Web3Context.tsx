import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

declare global { interface Window { ethereum?: any; } }

// 0G Mainnet is primary (hackathon requirement)
const OG_MAINNET = {
  chainId: '0x4115',  // 16661 hex
  chainName: '0G Mainnet',
  nativeCurrency: { name: 'A0GI', symbol: 'A0GI', decimals: 18 },
  rpcUrls: ['https://evmrpc.0g.ai'],
  blockExplorerUrls: ['https://chainscan.0g.ai'],
};

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
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);

  const switchToOG = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: OG_MAINNET.chainId }] });
    } catch (e: any) {
      if (e.code === 4902) {
        await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [OG_MAINNET] });
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) { alert('Please install MetaMask or a Web3 wallet.'); return; }
    try {
      const bp = new ethers.BrowserProvider(window.ethereum);
      const network = await bp.getNetwork();
      // Auto-switch to 0G Mainnet if on wrong chain
      if (network.chainId.toString() !== '16661') await switchToOG();
      const accounts = await bp.send('eth_requestAccounts', []);
      const sig = await bp.getSigner();
      setProvider(bp); setSigner(sig); setAddress(accounts[0]);
      setChainId(network.chainId.toString());
    } catch (e: any) {
      if (e.code !== 4001) console.error('Wallet error:', e);
    }
  };

  const disconnectWallet = () => { setAddress(null); setProvider(null); setSigner(null); setChainId(null); };

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.on('accountsChanged', (a: string[]) => a.length ? setAddress(a[0]) : disconnectWallet());
    window.ethereum.on('chainChanged', () => window.location.reload());
  }, []);

  const chainName = chainId === '16661' ? '0G Mainnet' : chainId === '16600' ? '0G Newton' : chainId === '1' ? 'Ethereum' : chainId ? `Chain ${chainId}` : '';

  return (
    <Web3Context.Provider value={{ address, isConnected: !!address, chainId, chainName, connectWallet, disconnectWallet, switchToOG, provider, signer }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error('useWeb3 must be used within Web3Provider');
  return ctx;
};
