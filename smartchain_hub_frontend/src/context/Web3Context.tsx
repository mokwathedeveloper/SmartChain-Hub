import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const OG_NEWTON_CHAIN_ID = '0x40d8'; // 16600 in hex
const OG_NEWTON_PARAMS = {
  chainId: OG_NEWTON_CHAIN_ID,
  chainName: '0G Newton Testnet',
  nativeCurrency: { name: 'A0GI', symbol: 'A0GI', decimals: 18 },
  rpcUrls: ['https://rpc-testnet.0g.ai'],
  blockExplorerUrls: ['https://scan-testnet.0g.ai/'],
};

interface Web3ContextType {
  address: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  chainId: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);

  const switchNetwork = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: OG_NEWTON_CHAIN_ID }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [OG_NEWTON_PARAMS],
            });
          } catch (addError) {
            console.error("Failed to add network:", addError);
          }
        }
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const network = await browserProvider.getNetwork();
        
        if (network.chainId.toString() !== '16600') {
          await switchNetwork();
        }

        const accounts = await browserProvider.send("eth_requestAccounts", []);
        const signerInstance = await browserProvider.getSigner();
        
        setProvider(browserProvider);
        setSigner(signerInstance);
        setAddress(accounts[0]);
        setChainId(network.chainId.toString());
      } catch (error: any) {
        if (error.code === 4001) {
          alert("Connection request was rejected.");
        } else {
          console.error("Wallet connection error:", error);
        }
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) setAddress(accounts[0]);
        else disconnectWallet();
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  return (
    <Web3Context.Provider value={{ address, isConnected: !!address, connectWallet, disconnectWallet, switchNetwork, provider, signer, chainId }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) throw new Error('useWeb3 must be used within a Web3Provider');
  return context;
};
