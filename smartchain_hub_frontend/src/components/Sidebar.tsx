import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const router = useRouter();
  
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'AI Optimization', path: '/features', icon: '🧠' },
    { name: 'History', path: '/history', icon: '📜' },
    { name: 'Revenue', path: '/revenue', icon: '💰' },
    { name: 'Console', path: '/console', icon: '🖥️' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col shadow-sm">
      <div className="p-8 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-electric-purple rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-electric-purple/30">S</div>
          <span className="font-black text-deep-blue tracking-tighter text-xl text-nowrap">SmartChain</span>
        </Link>
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-deep-blue">✕</button>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = router.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={() => { if (onClose) onClose(); }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${
                isActive 
                  ? 'bg-electric-purple/10 text-electric-purple' 
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 bg-electric-purple rounded-full"></div>}
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="bg-gradient-to-br from-deep-blue to-blue-900 rounded-[2rem] p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-bold opacity-60 uppercase mb-1">0G Newton</p>
            <p className="text-xs font-bold mb-4 leading-tight">Your AI agents are currently 32% more efficient.</p>
            <button className="w-full py-2 bg-electric-purple rounded-xl text-[10px] font-black uppercase tracking-widest">Upgrade Hub</button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
