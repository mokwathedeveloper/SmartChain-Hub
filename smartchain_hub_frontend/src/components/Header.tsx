import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useWeb3 } from '@/context/Web3Context';

interface HeaderProps { onMenuClick?: () => void; }

const pageTitles: Record<string, { title: string; sub: string }> = {
  '/dashboard':    { title: 'Dashboard',        sub: 'Overview of your agent activity' },
  '/transactions': { title: 'AI Optimizer',     sub: 'TEE-verified transaction optimization' },
  '/payments':     { title: 'Payments',         sub: 'Send, stake, and withdraw A0GI' },
  '/onramp':       { title: 'Buy A0GI',         sub: 'Fund your wallet with fiat or crypto' },
  '/history':      { title: 'History',          sub: 'On-chain transaction history' },
  '/revenue':      { title: 'Revenue Sharing',  sub: 'Claim your share of platform fees' },
  '/profile':      { title: 'Profile',          sub: 'Manage your account settings' },
};

const APP_ROUTES = ['/dashboard', '/transactions', '/payments', '/onramp', '/console', '/history', '/revenue', '/profile'];

// ── Wallet Connect Modal ──────────────────────────────────────────────────────
function WalletModal({ onClose, onConnect }: { onClose: () => void; onConnect: (addr: string) => void }) {
  const { connectWallet } = useWeb3();
  const [manualAddr, setManualAddr] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMetaMask = async () => {
    setLoading(true);
    setError('');
    try {
      await connectWallet();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManual = () => {
    setError('');
    if (!manualAddr.trim()) { setError('Please enter a wallet address'); return; }
    if (!ethers.isAddress(manualAddr.trim())) { setError('Invalid Ethereum address'); return; }
    onConnect(manualAddr.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}/>

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-bold text-base">Connect Wallet</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* MetaMask option */}
          <button onClick={handleMetaMask} disabled={loading}
            className="w-full flex items-center gap-4 p-4 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-orange-500/50 rounded-xl transition-all group disabled:opacity-50">
            {/* MetaMask fox icon */}
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
                <path d="M35.5 4L22.5 13.5L25 8L35.5 4Z" fill="#E17726"/>
                <path d="M4.5 4L17.4 13.6L15 8L4.5 4Z" fill="#E27625"/>
                <path d="M30.5 27.5L27 33L34.5 35L36.5 27.5H30.5Z" fill="#E27625"/>
                <path d="M3.5 27.5L5.5 35L13 33L9.5 27.5H3.5Z" fill="#E27625"/>
                <path d="M12.5 18L10.5 21L18 21.5L17.5 13.5L12.5 18Z" fill="#E27625"/>
                <path d="M27.5 18L22.4 13.4L22 21.5L29.5 21L27.5 18Z" fill="#E27625"/>
                <path d="M13 33L17.5 30.5L13.5 27.5L13 33Z" fill="#E27625"/>
                <path d="M22.5 30.5L27 33L26.5 27.5L22.5 30.5Z" fill="#E27625"/>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-semibold text-sm">MetaMask</p>
              <p className="text-gray-500 text-xs">Connect using browser extension</p>
            </div>
            {loading
              ? <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"/>
              : <svg className="w-4 h-4 text-gray-600 group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
            }
          </button>

          {/* WalletConnect placeholder */}
          <button className="w-full flex items-center gap-4 p-4 bg-gray-800 border border-gray-700 hover:border-blue-500/50 rounded-xl transition-all group opacity-60 cursor-not-allowed">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-semibold text-sm">WalletConnect</p>
              <p className="text-gray-500 text-xs">Coming soon</p>
            </div>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-800"/>
            <span className="text-xs text-gray-600">or enter address manually</span>
            <div className="flex-1 h-px bg-gray-800"/>
          </div>

          {/* Manual address input */}
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1.5">Wallet Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualAddr}
                onChange={e => { setManualAddr(e.target.value); setError(''); }}
                placeholder="0x..."
                className="flex-1 px-3 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm font-mono"
              />
              <button onClick={handleManual}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors text-sm whitespace-nowrap">
                Connect
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            <p className="text-gray-600 text-xs mt-2">
              Read-only mode — no signing required
            </p>
          </div>

          {/* Network info */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
            <span className="text-xs text-gray-500">0G Galileo Testnet · Chain ID 16602</span>
            <a href="https://hub.0g.ai/faucet" target="_blank" rel="noreferrer"
              className="ml-auto text-xs text-blue-400 hover:text-blue-300">
              Get tokens ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Header ───────────────────────────────────────────────────────────────
const Header = ({ onMenuClick }: HeaderProps) => {
  const router = useRouter();
  const { user } = useAuth(false);
  const { address, isConnected, chainName, disconnectWallet, switchToOG } = useWeb3();
  const [showModal, setShowModal] = useState(false);
  const [manualAddress, setManualAddress] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load avatar from profiles table whenever user changes
  useEffect(() => {
    if (!user) {
      Promise.resolve().then(() => setAvatarUrl(null));
      return;
    }
    supabase.from('profiles').select('avatar_url').eq('id', user.id).single()
      .then(({ data }) => setAvatarUrl(data?.avatar_url || null));
  }, [user]);

  const isApp = APP_ROUTES.includes(router.pathname);
  const displayAddress = address || manualAddress;
  const displayConnected = isConnected || !!manualAddress;
  const isWrongChain = isConnected && chainName !== '0G Galileo' && chainName !== '0G Mainnet' && chainName !== '0G Newton';
  const page = pageTitles[router.pathname];

  const handleDisconnect = () => {
    disconnectWallet();
    setManualAddress(null);
  };

  const navLinks: [string, string][] = [['/', 'Home'], ['/features', 'Features'], ['/about', 'About'], ['/documentation', 'Docs'], ['/blog', 'Blog'], ['/contact', 'Contact']];

  // Public header
  if (!isApp) {
    return (
      <>
        <header className="bg-gray-950/90 sticky top-0 z-50 backdrop-blur-md border-b border-gray-800">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
                  <path d="M20 4L34 12V28L20 36L6 28V12L20 4Z" fill="white" opacity="0.9"/>
                  <path d="M20 12L28 16.5V25.5L20 30L12 25.5V16.5L20 12Z" fill="#3B82F6"/>
                </svg>
              </div>
              <span className="font-bold text-white text-sm">SmartChain Hub</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map(([href, label]) => (
                <Link key={href} href={href} className="text-sm text-gray-400 hover:text-white font-medium transition-colors">{label}</Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <>
                  <Link href="/dashboard" className="hidden sm:block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/profile">
                    <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-800 hover:ring-blue-600 transition-all cursor-pointer shrink-0">
                      {avatarUrl
                        ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                            {user.email?.[0]?.toUpperCase()}
                          </div>
                      }
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block text-sm text-gray-400 hover:text-white font-medium transition-colors">Sign In</Link>
                  <Link href="/signup" className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors">
                    Get Started
                  </Link>
                </>
              )}
              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileMenuOpen(o => !o)}
                className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen
                  ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 pb-4 pt-3 space-y-1">
              {navLinks.map(([href, label]) => (
                <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors font-medium">
                  {label}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-800 space-y-2">
                {user ? (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center px-4 py-2.5 border border-gray-700 text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
                      Sign In
                    </Link>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </header>
        {showModal && <WalletModal onClose={() => setShowModal(false)} onConnect={setManualAddress}/>}
      </>
    );
  }

  // App header
  return (
    <>
      <header className="bg-gray-950 border-b border-gray-800 flex items-center justify-between px-3 sm:px-6 py-3 sm:py-3.5 shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button onClick={onMenuClick} className="lg:hidden p-2 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-gray-800 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-white truncate">{page?.title || 'Dashboard'}</h1>
            <p className="text-xs text-gray-500 hidden sm:block truncate">{page?.sub || ''}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Wrong chain warning */}
          {isWrongChain && (
            <button onClick={switchToOG}
              className="hidden xs:flex text-xs px-2 sm:px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg font-medium hover:bg-yellow-500/20 transition-colors">
              ⚠ Switch
            </button>
          )}

          {/* Wallet button */}
          {!displayConnected ? (
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-blue-600/10 border border-blue-600/30 text-blue-400 text-xs font-semibold rounded-xl hover:bg-blue-600/20 transition-colors">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </button>
          ) : (
            <button onClick={handleDisconnect}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold rounded-xl hover:bg-green-500/20 transition-colors">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0"/>
              <span className="hidden sm:inline">{displayAddress?.slice(0,6)}...{displayAddress?.slice(-4)}</span>
              <span className="sm:hidden">{displayAddress?.slice(0,4)}…</span>
              {manualAddress && <span className="hidden sm:inline text-green-600 text-xs">(read)</span>}
            </button>
          )}

          {/* Notifications */}
          <button className="relative p-1.5 sm:p-2 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-gray-800 transition-colors">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:top-1.5 sm:right-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"/>
          </button>

          {/* Avatar */}
          <Link href="/profile">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden ring-2 ring-gray-800 hover:ring-blue-600 transition-all cursor-pointer shrink-0">
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
              }
            </div>
          </Link>
        </div>
      </header>

      {showModal && <WalletModal onClose={() => setShowModal(false)} onConnect={setManualAddress}/>}
    </>
  );
};

export default Header;
