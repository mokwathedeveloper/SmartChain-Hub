import { createClient } from '@supabase/supabase-js';

// Trim keys to remove any trailing newlines injected by env var tools
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
