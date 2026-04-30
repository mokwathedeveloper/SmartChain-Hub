import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { ethers } from 'ethers';
import { secureLogger } from '../utils/secureLogger';

declare global { interface Window { ethereum?: any; } }

const OG_GALILEO = {
  chainId: '0x40DA',
  chainName: '0G Galileo Testnet',
  nativeCurrency: { name: 'A0GI', symbol: 'A0GI', decimals: 18 },
  rpcUrls: ['https://evmrpc-testnet.0g.ai'],
  blockExplorerUrls: ['https://scan-testnet.0g.ai'],
};

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
  sdkConnected: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress]       = useState<string | null>(null);
  const [provider, setProvider]     = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner]         = useState<ethers.Signer | null>(null);
  const [chainId, setChainId]       = useState<string | null>(null);
  const [noWallet, setNoWallet]     = useState(false);
  const [sdkConnected, setSdkConnected] = useState(false);
  const sdkRef = useRef<any>(null);
  const connectingRef = useRef(false); // guard against duplicate connect calls

  // Initialise MetaMask SDK on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { MetaMaskSDK } = await import('@metamask/sdk');
        const sdk = new MetaMaskSDK({
          dappMetadata: {
            name: 'SmartChain Hub',
            url: typeof window !== 'undefined' ? window.location.origin : 'https://smartchainhubfrontend.vercel.app',
            iconUrl: 'https://smartchainhubfrontend.vercel.app/logo.png',
          },
          preferDesktop: true,
          checkInstallationImmediately: false,
        });
        await sdk.init();
        if (!cancelled) {
          sdkRef.current = sdk;
          setSdkConnected(true);

          // Auto-reconnect if already authorised
          const ethereum = sdk.getProvider() || window.ethereum;
          if (ethereum) {
            const accounts: string[] = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length) {
              await _connect(ethereum, accounts[0]);
            }
          }
        }
      } catch {
        // SDK failed — fall back to window.ethereum
        if (!cancelled && window.ethereum) {
          const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' }).catch(() => []);
          if (accounts.length) await _connect(window.ethereum, accounts[0]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const _getEthereum = () =>
    (sdkRef.current?.getProvider?.()) || window.ethereum;

  const _connect = async (ethereum: any, account: string) => {
    try {
      const bp = new ethers.BrowserProvider(ethereum);
      const network = await bp.getNetwork();
      const cid = network.chainId.toString();

      if (cid !== TARGET_CHAIN_ID) {
        try {
          await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: OG_GALILEO.chainId }] });
        } catch (e: any) {
          if (e.code === 4902) {
            await ethereum.request({ method: 'wallet_addEthereumChain', params: [OG_GALILEO] });
          }
        }
        const bp2 = new ethers.BrowserProvider(ethereum);
        const net2 = await bp2.getNetwork();
        const sig2 = await bp2.getSigner();
        setProvider(bp2); setSigner(sig2);
        setAddress(account); setChainId(net2.chainId.toString());
        return;
      }

      const sig = await bp.getSigner();
      setProvider(bp); setSigner(sig);
      setAddress(account); setChainId(cid);
      secureLogger.wallet('Wallet connected successfully', account);
    } catch (e: any) {
      secureLogger.error('Wallet connect failed', e);
    }
  };

  const connectWallet = async () => {
    if (connectingRef.current) return; // already in-flight — ignore duplicate clicks
    const ethereum = _getEthereum();
    if (!ethereum) {
      setNoWallet(true);
      setTimeout(() => setNoWallet(false), 5000);
      return;
    }
    setNoWallet(false);
    connectingRef.current = true;
    try {
      secureLogger.info('Initiating wallet connection');
      const accounts: string[] = await ethereum.request({ method: 'eth_requestAccounts' });
      secureLogger.info('Wallet accounts received', { count: accounts.length });
      if (!accounts.length) return;
      await _connect(ethereum, accounts[0]);
    } catch (e: any) {
      if (e.code !== 4001) secureLogger.error('Wallet connection failed', e);
    } finally {
      connectingRef.current = false;
    }
  };

  const disconnectWallet = () => {
    setAddress(null); setProvider(null); setSigner(null); setChainId(null);
    try { sdkRef.current?.disconnect?.(); } catch {}
  };

  const switchToOG = async () => {
    const ethereum = _getEthereum();
    if (!ethereum) return;
    try {
      await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: OG_GALILEO.chainId }] });
    } catch (e: any) {
      if (e.code === 4902) {
        await ethereum.request({ method: 'wallet_addEthereumChain', params: [OG_GALILEO] });
      }
    }
  };

  // Listen for account/chain changes
  useEffect(() => {
    const ethereum = _getEthereum();
    if (!ethereum) return;

    const onAccounts = (accounts: string[]) => {
      if (accounts.length) { setAddress(accounts[0]); }
      else disconnectWallet();
    };
    const onChain = () => window.location.reload();

    ethereum.on('accountsChanged', onAccounts);
    ethereum.on('chainChanged', onChain);
    return () => {
      ethereum.removeListener?.('accountsChanged', onAccounts);
      ethereum.removeListener?.('chainChanged', onChain);
    };
  }, [sdkConnected]);

  const chainName =
    chainId === '16602' ? '0G Galileo' :
    chainId === '16661' ? '0G Mainnet' :
    chainId === '16600' ? '0G Newton'  :
    chainId === '1'     ? 'Ethereum'   :
    chainId ? `Chain ${chainId}` : '';

  return (
    <Web3Context.Provider value={{
      address, isConnected: !!address, chainId, chainName,
      connectWallet, disconnectWallet, switchToOG,
      provider, signer, noWallet, sdkConnected,
    }}>
      {children}
      {noWallet && (
        <div className="fixed bottom-6 right-6 z-[200] bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-5 py-3 rounded-xl text-sm font-medium shadow-xl flex items-center gap-3">
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
