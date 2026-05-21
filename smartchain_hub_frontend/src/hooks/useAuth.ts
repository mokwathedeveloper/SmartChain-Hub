import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import { User } from '@supabase/supabase-js';

export function useAuth(requireAuth: boolean = true) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (requireAuth && !session && (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT')) {
        routerRef.current.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [requireAuth]);

  return { user, loading };
}
