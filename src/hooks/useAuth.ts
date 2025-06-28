"use client";

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthResult {
  success: boolean;
  error?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔐 Auth Debug: Initializing');

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.log('🔐 Auth Debug: Session error', error.message);
          setError(error.message);
        } else {
          console.log('🔐 Auth Debug: Initial session', { user: !!session?.user });
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.log('🔐 Auth Debug: Initialization failed', err);
        setError('Failed to initialize auth');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth Debug: State change', { event, user: !!session?.user });
        setUser(session?.user ?? null);
        setError(null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    console.log('🔐 Auth Debug: Sign in attempt', { email });

    try {
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.log('🔐 Auth Debug: Sign in failed', error.message);
        setError(error.message);
        return { success: false, error: error.message };
      }

      console.log('🔐 Auth Debug: Sign in success');
      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      console.log('🔐 Auth Debug: Sign in error', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    console.log('🔐 Auth Debug: Sign up attempt', { email });

    try {
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        console.log('🔐 Auth Debug: Sign up failed', error.message);
        setError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user && !data.session) {
        console.log('🔐 Auth Debug: Sign up success - email confirmation required');
        return { success: true, error: 'Please check your email to confirm your account' };
      }

      console.log('🔐 Auth Debug: Sign up success - auto confirmed');
      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      console.log('🔐 Auth Debug: Sign up error', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    console.log('🔐 Auth Debug: Sign out initiated');

    try {
      setError(null);

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.log('🔐 Auth Debug: Sign out failed', error.message);
        setError(error.message);
        return { success: false, error: error.message };
      }

      console.log('🔐 Auth Debug: Sign out success');

      // Simple redirect - no circuit breaker
      setTimeout(() => {
        window.location.href = '/';
      }, 100);

      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      console.log('🔐 Auth Debug: Sign out error', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
    isAuthenticated: !!user
  };
};