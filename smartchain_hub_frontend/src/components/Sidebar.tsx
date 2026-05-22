import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ACTIVE_CHAIN } from '@/utils/chains';

interface NavItem { name: string; path: string; icon: React.ReactNode; badge?: string }
interface SidebarProps { onClose?: () => void; }

const navItems = [
  {
    name: 'Dashboard', path: '/dashboard',
    icon: <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
  },
  {
    name: 'AI Optimizer', path: '/transactions',
    icon: <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
  },
  {
    name: 'Marketplace', path: '/marketplace',
    icon: <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>,
    badge: 'New',
  },
  {
    name: 'TEE Proofs', path: '/proof',
    icon: <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
    badge: 'New',
  },
  {
    name: 'Activity Feed', path: '/activity',
    icon: <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>,
    badge: 'New',
  },
  {
    name: 'Payments', path: '/payments',
    icon: <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
  },
  {
    name: 'Buy A0GI', path: '/onramp',
    icon: <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  },
  {
    name: 'Revenue', path: '/revenue',
    icon: <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
  },
  {
    name: 'History', path: '/history',
    icon: <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  },
  {
    name: 'Profile', path: '/profile',
    icon: <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
  },
];

const stackItems = [
  { label: "0G Chain",   color: "bg-blue-500",   glow: "shadow-blue-500/40",   status: "5 Contracts" },
  { label: "0G Compute", color: "bg-purple-500", glow: "shadow-purple-500/40", status: "TeeML Active" },
  { label: "0G Storage", color: "bg-green-500",  glow: "shadow-green-500/40",  status: "KV + Log" },
  { label: "0G DA",      color: "bg-cyan-500",   glow: "shadow-cyan-500/40",   status: "Blob Stream" },
  { label: "Multi-Agent",color: "bg-yellow-500", glow: "shadow-yellow-500/40", status: "3 Agents" },
];

const Sidebar = ({ onClose }: SidebarProps) => {
  const router = useRouter();
  const isActive = (path: string) =>
    router.pathname === path || (path === '/transactions' && router.pathname === '/console');

  return (
    <aside
      className="w-64 flex flex-col bg-gray-950 border-r border-gray-800/80"
      style={{ height: '100vh', minHeight: '-webkit-fill-available' }}
    >
      {/* Logo area */}
      <div className="relative px-4 py-4 flex items-center justify-between border-b border-gray-800/80 overflow-hidden">
        {/* Subtle glow behind logo */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-600/8 rounded-full blur-2xl pointer-events-none" />

        <Link href="/dashboard" className="relative flex items-center group" onClick={() => onClose?.()}>
          <Image src="/logo-full.png" alt="SmartChain Hub" width={130} height={32} className="object-contain" priority />
        </Link>

        <button onClick={onClose} className="lg:hidden text-gray-600 hover:text-gray-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Network status pill */}
      <div className="mx-3 mt-3 px-3 py-2 bg-gradient-to-r from-green-500/8 to-blue-500/8 border border-green-500/20 rounded-xl flex items-center gap-2.5">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0"/>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-green-400 leading-none">LIVE</p>
          <p className="text-[10px] text-blue-400/70 leading-none mt-0.5 truncate">{ACTIVE_CHAIN.name} · ID {ACTIVE_CHAIN.chainId}</p>
        </div>
        <div className="ml-auto w-1.5 h-6 bg-gradient-to-b from-green-400/40 to-blue-400/40 rounded-full shrink-0" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest px-3 mb-2.5">Navigation</p>
        {(navItems as NavItem[]).map(item => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => onClose?.()}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group overflow-hidden ${
                active
                  ? 'text-white'
                  : 'text-gray-500 hover:bg-gray-800/80 hover:text-gray-200'
              }`}
            >
              {active && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-700/70 rounded-xl" />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div className="absolute -right-6 -top-4 w-20 h-20 bg-white/5 rounded-full blur-xl pointer-events-none" />
                </>
              )}
              <span className={`relative shrink-0 transition-all ${active ? 'text-white' : 'text-gray-600 group-hover:text-gray-300'}`}>
                {item.icon}
              </span>
              <span className="relative flex-1">{item.name}</span>
              {item.badge && !active && (
                <span className="relative text-[9px] px-1.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold shrink-0">
                  {item.badge}
                </span>
              )}
              {active && (
                <span className="relative ml-auto w-1.5 h-1.5 bg-white/70 rounded-full shadow-sm shadow-white/30" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — 0G Stack */}
      <div className="p-3 border-t border-gray-800/80">
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest px-1 mb-2.5">0G Stack</p>
        <div className="space-y-1">
          {stackItems.map(s => (
            <div key={s.label} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-900/60 hover:bg-gray-900 border border-transparent hover:border-gray-800 transition-all duration-200 group">
              <div className="relative shrink-0">
                <span className={`block w-2 h-2 rounded-full ${s.color} shadow-sm ${s.glow}`}/>
              </div>
              <span className="text-xs text-gray-400 font-medium flex-1 truncate">{s.label}</span>
              <span className="text-[10px] text-gray-600 group-hover:text-gray-500 transition-colors font-mono shrink-0">{s.status}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 px-1">
          <p className="text-[10px] text-gray-700 leading-relaxed">
            Powered by 0G · TEE · ZK · Storage
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
