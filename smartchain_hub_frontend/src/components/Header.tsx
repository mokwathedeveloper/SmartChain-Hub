import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useWeb3 } from '@/context/Web3Context';

const Header = () => {
  const router = useRouter();
  const { user } = useAuth(false);
  const { address, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const isApp = router.pathname.startsWith('/dashboard') || router.pathname.startsWith('/features') || router.pathname.startsWith('/profile');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="flex items-center justify-between bg-blue-900 text-white p-4 shadow-lg sticky top-0 z-50 backdrop-blur-md bg-blue-900/90">
      <div className="text-2xl font-bold">
        <Link href="/" className="hover:text-blue-300 transition-colors flex items-center">
          <span className="bg-green-500 w-8 h-8 rounded-lg mr-2 flex items-center justify-center text-white text-xl">S</span>
          SmartChain Hub
        </Link>
      </div>
      <nav className="hidden md:flex items-center space-x-8">
        {!user ? (
          <>
            <Link href="/features" className="hover:text-blue-300 transition-colors">Features</Link>
            <Link href="/about" className="hover:text-blue-300 transition-colors">About</Link>
            <Link href="/contact" className="hover:text-blue-300 transition-colors">Contact</Link>
            <Link href="/login" className="hover:text-blue-300 transition-colors font-semibold">Login</Link>
            <Link href="/signup" className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all shadow-md">
              Get Started
            </Link>
          </>
        ) : (
          <>
            <Link href="/dashboard" className={`hover:text-blue-300 transition-colors ${router.pathname === '/dashboard' ? 'text-green-400' : ''}`}>Dashboard</Link>
            <Link href="/features" className={`hover:text-blue-300 transition-colors ${router.pathname === '/features' ? 'text-green-400' : ''}`}>Optimization</Link>
            
            {/* Wallet Connection */}
            {!isConnected ? (
              <button 
                onClick={connectWallet}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md border border-blue-500 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Connect Wallet
              </button>
            ) : (
              <div className="group relative">
                <button className="px-4 py-2 bg-green-500/20 text-green-400 text-xs font-mono font-bold rounded-xl border border-green-500/30">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </button>
                <button 
                  onClick={disconnectWallet}
                  className="absolute top-full right-0 mt-2 hidden group-hover:block bg-red-600 text-white text-[10px] px-2 py-1 rounded shadow-lg"
                >
                  Disconnect
                </button>
              </div>
            )}

            <Link href="/profile" className="flex items-center space-x-4 border-l pl-6 border-blue-700">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="hover:text-blue-300 transition-colors text-sm truncate max-w-[100px]">{user.email}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-xs bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white px-2 py-1 rounded transition-all"
              >
                Logout
              </button>
            </Link>
          </>
        )}
      </nav>
      
      {/* Mobile Menu Toggle (Simplified) */}
      <div className="md:hidden">
        <button className="p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
