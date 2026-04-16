import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import { User } from '@supabase/supabase-js';

export function useAuth(requireAuth: boolean = true) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (requireAuth && !session) {
        router.push('/login');
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (requireAuth && !session) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [requireAuth, router]);

  return { user, loading };
}
