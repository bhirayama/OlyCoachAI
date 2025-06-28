// src/lib/supabase-server.ts - SERVER ONLY
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './supabase';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// ✅ SERVER: For use in route handlers and server components
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie setting errors gracefully
            console.warn('Failed to set cookie:', name, error);
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie removal errors gracefully
            console.warn('Failed to remove cookie:', name, error);
          }
        },
      },
    }
  );
}