import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useWeb3 } from '@/context/Web3Context';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const router = useRouter();
  const { user } = useAuth(false);
  const { address, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const isApp = ['/dashboard', '/features', '/history', '/revenue', '/profile'].includes(router.pathname);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className={`flex items-center justify-between p-4 ${isApp ? 'bg-transparent' : 'bg-white/80 sticky top-0 z-50 backdrop-blur-md border-b border-gray-100'}`}>
      {!isApp ? (
        <>
          <div className="text-2xl font-bold">
            <Link href="/" className="hover:text-electric-purple transition-colors flex items-center">
              <span className="bg-electric-purple w-8 h-8 rounded-lg mr-2 flex items-center justify-center text-white text-xl shadow-lg shadow-electric-purple/20">S</span>
              <span className="text-deep-blue tracking-tighter">SmartChain Hub</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-gray-500 hover:text-electric-purple font-bold text-sm transition-colors">Features</Link>
            <Link href="/about" className="text-gray-500 hover:text-electric-purple font-bold text-sm transition-colors">About</Link>
            <Link href="/contact" className="text-gray-500 hover:text-electric-purple font-bold text-sm transition-colors">Contact</Link>
            <Link href="/login" className="text-gray-500 hover:text-electric-purple font-bold text-sm transition-colors">Login</Link>
            <Link href="/signup" className="px-6 py-2.5 bg-deep-blue hover:bg-black text-white font-bold rounded-xl transition-all shadow-xl shadow-deep-blue/10">
              Get Started
            </Link>
          </nav>
        </>
      ) : (
        <>
          <div className="flex items-center space-x-4">
             <button 
               onClick={onMenuClick}
               className="lg:hidden p-2 bg-white border border-gray-100 rounded-xl shadow-sm text-deep-blue"
             >
               ☰
             </button>
             <h1 className="text-xl font-black text-deep-blue capitalize hidden sm:block">
               {router.pathname.replace('/', '') || 'Dashboard'}
             </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-lg shadow-sm hover:bg-gray-50 transition-all relative">
              🔔
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            {!isConnected ? (
              <button 
                onClick={connectWallet}
                className="px-4 py-2 bg-white border border-gray-100 text-deep-blue text-xs font-bold rounded-xl transition-all shadow-sm hover:bg-gray-50 flex items-center"
              >
                Connect Wallet
              </button>
            ) : (
              <button className="px-4 py-2 bg-green-500/10 text-green-600 text-xs font-mono font-bold rounded-xl border border-green-500/20">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </button>
            )}

            <div className="flex items-center space-x-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-deep-blue leading-none mb-1">{user?.email?.split('@')[0]}</p>
                <button onClick={handleLogout} className="text-[10px] font-bold text-red-400 hover:text-red-600">Logout</button>
              </div>
              <Link href="/profile">
                <div className="w-10 h-10 bg-electric-purple rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-electric-purple/20 cursor-pointer">
                  {user?.email?.[0].toUpperCase()}
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
