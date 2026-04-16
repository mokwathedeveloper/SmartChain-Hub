import React from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';

const ProfileSection = () => {
  const { user } = useAuth(false);
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <Link href="/profile">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer">
          {user.email?.[0]?.toUpperCase() || 'U'}
        </div>
      </Link>
      <div className="hidden md:block">
        <p className="text-xs font-semibold text-gray-700 leading-none">{user.email?.split('@')[0]}</p>
        <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-600 mt-0.5">Logout</button>
      </div>
    </div>
  );
};

export default ProfileSection;
