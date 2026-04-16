import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onMenuClick?: () => void;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transaction Optimization',
  '/console': 'Transaction Optimization',
  '/history': 'Blockchain',
  '/revenue': 'Revenue Sharing',
  '/profile': 'Profile Settings',
  '/about': 'Help',
};

const Header = ({ onMenuClick }: HeaderProps) => {
  const router = useRouter();
  const { user } = useAuth(false);
  const isApp = ['/dashboard', '/transactions', '/console', '/history', '/revenue', '/profile'].includes(router.pathname);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!isApp) {
    return (
      <header className="bg-white/90 sticky top-0 z-50 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 py-4">
        <Link href="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#EEF2FF"/>
            <path d="M20 8L30 14V22L20 28L10 22V14L20 8Z" fill="#3B82F6" opacity="0.8"/>
            <path d="M20 14L26 17.5V24.5L20 28L14 24.5V17.5L20 14Z" fill="#22C55E" opacity="0.9"/>
          </svg>
          <span className="font-bold text-gray-800 text-base">SmartChain Hub</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          <Link href="/" className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
          <Link href="/about" className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">About</Link>
          <Link href="/features" className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</Link>
          <Link href="/documentation" className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">Documentations</Link>
          <Link href="/contact" className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">Contact</Link>
          <Link href="/signup" className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">Get Started</Link>
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-100 flex items-center justify-between px-6 py-3.5">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800">{pageTitles[router.pathname] || 'Dashboard'}</h1>
        {router.pathname === '/dashboard' && (
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 ml-4">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input placeholder="Search" className="bg-transparent text-sm text-gray-600 placeholder-gray-400 focus:outline-none w-40"/>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full"/>
        </button>
        <button className="relative p-2 text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </button>
        <Link href="/profile">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer overflow-hidden">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
