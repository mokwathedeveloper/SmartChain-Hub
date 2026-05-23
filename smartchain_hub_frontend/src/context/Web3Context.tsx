import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { ethers } from 'ethers';
import { secureLogger } from '../utils/secureLogger';

interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
}
declare global { interface Window { ethereum?: EthereumProvider; } }

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
  const sdkRef = useRef<unknown>(null);
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
            const accounts = await ethereum.request({ method: 'eth_accounts' }) as string[];
            if (accounts.length) {
              await _connect(ethereum, accounts[0]);
            }
          }
        }
      } catch {
        // SDK failed — fall back to window.ethereum
        if (!cancelled && window.ethereum) {
          const accounts = (await window.ethereum.request({ method: 'eth_accounts' }).catch(() => [])) as string[];
          if (accounts.length) await _connect(window.ethereum, accounts[0]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const _getEthereum = () => {
    type SdkLike = { getProvider?(): EthereumProvider | undefined };
    return (sdkRef.current as SdkLike | null)?.getProvider?.() || window.ethereum;
  };

  const _connect = async (ethereum: EthereumProvider, account: string) => {
    try {
      const bp = new ethers.BrowserProvider(ethereum);
      const network = await bp.getNetwork();
      const cid = network.chainId.toString();

      if (cid !== TARGET_CHAIN_ID) {
        try {
          await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: OG_GALILEO.chainId }] });
        } catch (e: unknown) {
          if ((e as { code?: number }).code === 4902) {
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
    } catch (e: unknown) {
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
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      secureLogger.info('Wallet accounts received', { count: accounts.length });
      if (!accounts.length) return;
      await _connect(ethereum, accounts[0]);
    } catch (e: unknown) {
      if ((e as { code?: number }).code !== 4001) secureLogger.error('Wallet connection failed', e);
    } finally {
      connectingRef.current = false;
    }
  };

  const disconnectWallet = () => {
    setAddress(null); setProvider(null); setSigner(null); setChainId(null);
    try { (sdkRef.current as { terminate?(): void } | null)?.terminate?.(); } catch {}
  };

  const switchToOG = async () => {
    const ethereum = _getEthereum();
    if (!ethereum) return;
    try {
      await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: OG_GALILEO.chainId }] });
    } catch (e: unknown) {
      if ((e as { code?: number }).code === 4902) {
        await ethereum.request({ method: 'wallet_addEthereumChain', params: [OG_GALILEO] });
      }
    }
  };

  // Listen for account/chain changes
  useEffect(() => {
    const ethereum = _getEthereum();
    if (!ethereum) return;

    const onAccounts = (...args: unknown[]) => {
      const accounts = (args[0] as string[]) ?? [];
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
        <div className="fixed bottom-6 right-6 z-[200] bg-gray-900 border border-yellow-500/30 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden max-w-xs w-full">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
          <div className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white">No wallet detected</p>
                <p className="text-xs text-gray-500 mt-0.5">Connect MetaMask to use on-chain features</p>
              </div>
              <button
                onClick={() => setNoWallet(false)}
                className="ml-auto text-gray-600 hover:text-gray-400 transition-colors text-xs leading-none"
              >✕</button>
            </div>

            <div className="space-y-2">
              {/* Desktop install */}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 px-3 py-2.5 bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/20 rounded-xl transition-colors group"
              >
                <svg className="w-4 h-4 text-orange-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                <span className="text-xs font-semibold text-orange-300 group-hover:text-orange-200">Install MetaMask (Desktop) →</span>
              </a>

              {/* Mobile deeplink */}
              <a
                href="https://metamask.app.link/dapp/smartchainhubfrontend.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 px-3 py-2.5 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl transition-colors group"
              >
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-300 group-hover:text-white">Open in MetaMask Mobile</p>
                  <p className="text-[10px] text-gray-600">iOS &amp; Android deeplink</p>
                </div>
              </a>

              {/* Demo mode */}
              <a
                href="/transactions?demo=true"
                onClick={() => setNoWallet(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 bg-blue-600/10 hover:bg-blue-600/15 border border-blue-500/20 rounded-xl transition-colors group"
              >
                <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-300 group-hover:text-blue-200">Try Demo Mode — No Wallet</p>
                  <p className="text-[10px] text-gray-600">Full AI optimizer, no on-chain signing</p>
                </div>
              </a>
            </div>
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
