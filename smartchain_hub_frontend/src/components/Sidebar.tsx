import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SidebarProps { onClose?: () => void; }

const navItems = [
  {
    name: 'Dashboard', path: '/dashboard',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
  },
  {
    name: 'AI Optimizer', path: '/transactions',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
  },
  {
    name: 'Payments', path: '/payments',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
  },
  {
    name: 'Buy A0GI', path: '/onramp',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  },
  {
    name: 'Revenue', path: '/revenue',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
  },
  {
    name: 'History', path: '/history',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  },
  {
    name: 'Profile', path: '/profile',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
  },
];

const Sidebar = ({ onClose }: SidebarProps) => {
  const router = useRouter();
  const isActive = (path: string) => router.pathname === path || (path === '/transactions' && router.pathname === '/console');

  return (
    <aside
      className="w-60 bg-gray-950 border-r border-gray-800 flex flex-col"
      style={{ height: '100vh', /* dvh progressive enhancement */ minHeight: '-webkit-fill-available' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center justify-between border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
              <path d="M20 4L34 12V28L20 36L6 28V12L20 4Z" fill="white" opacity="0.9"/>
              <path d="M20 12L28 16.5V25.5L20 30L12 25.5V16.5L20 12Z" fill="#3B82F6"/>
            </svg>
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">SmartChain</div>
            <div className="text-xs text-gray-500 leading-tight">Hub</div>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden text-gray-600 hover:text-gray-400 p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* 0G Network badge */}
      <div className="mx-4 mt-4 px-3 py-2 bg-blue-600/10 border border-blue-600/20 rounded-xl flex items-center gap-2">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
        <span className="text-xs text-blue-400 font-medium">0G Galileo Testnet</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-gray-600 font-semibold uppercase tracking-widest px-3 mb-3">Main Menu</p>
        {navItems.map(item => {
          const active = isActive(item.path);
          return (
            <Link key={item.path} href={item.path} onClick={() => onClose?.()}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'
              }`}>
              <span className={active ? 'text-white' : 'text-gray-600 group-hover:text-gray-300'}>
                {item.icon}
              </span>
              <span>{item.name}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full"/>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — 0G Stack */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-600 font-semibold uppercase tracking-widest mb-3">0G Stack</p>
        <div className="space-y-1.5">
          {[
            { label: "0G Compute", color: "bg-purple-500", status: "TeeML Active" },
            { label: "0G Storage", color: "bg-green-500", status: "KV + Log" },
            { label: "0G Chain", color: "bg-blue-500", status: "4 Contracts" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-900">
              <span className={`w-2 h-2 rounded-full ${s.color}`}/>
              <span className="text-xs text-gray-400 font-medium">{s.label}</span>
              <span className="ml-auto text-xs text-gray-600">{s.status}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
