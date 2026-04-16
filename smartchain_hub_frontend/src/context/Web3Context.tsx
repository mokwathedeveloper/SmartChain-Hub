import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  address: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await browserProvider.send("eth_requestAccounts", []);
        const signerInstance = await browserProvider.getSigner();
        
        setProvider(browserProvider);
        setSigner(signerInstance);
        setAddress(accounts[0]);
      } catch (error: any) {
        if (error.code === 4001) {
          alert("Connection request was rejected. Please approve the connection in MetaMask to use on-chain features.");
        } else {
          console.error("Wallet connection error:", error);
          alert("An error occurred while connecting your wallet. Please try again.");
        }
      }
    } else {
      alert("Please install MetaMask or a compatible 0G wallet!");
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setProvider(null);
    setSigner(null);
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await browserProvider.listAccounts();
        if (accounts.length > 0) {
          const signerInstance = await browserProvider.getSigner();
          setProvider(browserProvider);
          setSigner(signerInstance);
          setAddress(accounts[0].address);
        }
      }
    };
    checkConnection();
  }, []);

  return (
    <Web3Context.Provider value={{ address, isConnected: !!address, connectWallet, disconnectWallet, provider, signer }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
