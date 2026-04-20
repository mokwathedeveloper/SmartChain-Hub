import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useWeb3 } from '@/context/Web3Context';

interface HeaderProps { onMenuClick?: () => void; }

const pageTitles: Record<string, { title: string; sub: string }> = {
  '/dashboard':    { title: 'Dashboard', sub: 'Overview of your agent activity' },
  '/transactions': { title: 'AI Optimizer', sub: 'TEE-verified transaction optimization' },
  '/payments':     { title: 'Payments', sub: 'Send, stake, and withdraw A0GI' },
  '/onramp':       { title: 'Buy A0GI', sub: 'Fund your wallet with fiat or crypto' },
  '/history':      { title: 'History', sub: 'On-chain transaction history' },
  '/revenue':      { title: 'Revenue Sharing', sub: 'Claim your share of platform fees' },
  '/profile':      { title: 'Profile', sub: 'Manage your account settings' },
};

const APP_ROUTES = ['/dashboard', '/transactions', '/payments', '/onramp', '/console', '/history', '/revenue', '/profile'];

const Header = ({ onMenuClick }: HeaderProps) => {
  const router = useRouter();
  const { user } = useAuth(false);
  const { address, isConnected, chainName, connectWallet, disconnectWallet, switchToOG } = useWeb3();
  const isApp = APP_ROUTES.includes(router.pathname);
  const isWrongChain = isConnected && chainName !== '0G Mainnet' && chainName !== '0G Newton Testnet' && chainName !== '0G Newton';
  const page = pageTitles[router.pathname];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Public header
  if (!isApp) {
    return (
      <header className="bg-gray-950/90 sticky top-0 z-50 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-6 max-w-6xl flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L34 12V28L20 36L6 28V12L20 4Z" fill="white" opacity="0.9"/>
                <path d="M20 12L28 16.5V25.5L20 30L12 25.5V16.5L20 12Z" fill="#3B82F6"/>
              </svg>
            </div>
            <span className="font-bold text-white text-sm">SmartChain Hub</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {[['/', 'Home'], ['/features', 'Features'], ['/about', 'About'], ['/documentation', 'Docs']].map(([href, label]) => (
              <Link key={href} href={href} className="text-sm text-gray-400 hover:text-white font-medium transition-colors">{label}</Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors">
                  Dashboard
                </Link>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.email?.[0]?.toUpperCase()}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-400 hover:text-white font-medium transition-colors">Sign In</Link>
                <Link href="/signup" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    );
  }

  // App header
  return (
    <header className="bg-gray-950 border-b border-gray-800 flex items-center justify-between px-6 py-3.5 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-gray-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <div>
          <h1 className="text-base font-bold text-white">{page?.title || 'Dashboard'}</h1>
          <p className="text-xs text-gray-500 hidden sm:block">{page?.sub || ''}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Wrong chain */}
        {isWrongChain && (
          <button onClick={switchToOG}
            className="text-xs px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg font-medium hover:bg-yellow-500/20 transition-colors">
            ⚠ Switch to 0G
          </button>
        )}

        {/* Wallet */}
        {!isConnected ? (
          <button onClick={connectWallet}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 border border-blue-600/30 text-blue-400 text-xs font-semibold rounded-xl hover:bg-blue-600/20 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            Connect Wallet
          </button>
        ) : (
          <button onClick={disconnectWallet}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold rounded-xl hover:bg-green-500/20 transition-colors">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
            {address?.slice(0,6)}...{address?.slice(-4)}
          </button>
        )}

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-gray-800 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"/>
        </button>

        {/* Avatar */}
        <Link href="/profile">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer ring-2 ring-gray-800 hover:ring-blue-600 transition-all">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
