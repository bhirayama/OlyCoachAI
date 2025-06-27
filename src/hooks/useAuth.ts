"use client";

import { useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { circuitBreaker } from '@/utils/redirectCircuitBreaker';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    initialized: false
  });

  const debugLog = useCallback((message: string, data?: any) => {
    console.log(`🔐 Auth Debug: ${message}`, data || '');
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      debugLog('Starting auth initialization');

      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) {
          debugLog('Component unmounted during session fetch');
          return;
        }

        if (error) {
          debugLog('Session fetch error:', error);
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: error.message,
            initialized: true
          });
          return;
        }

        debugLog('Initial session state:', {
          hasSession: !!session,
          userId: session?.user?.id,
          expiresAt: session?.expires_at,
          currentURL: window.location.href
        });

        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
          initialized: true
        });

      } catch (error) {
        debugLog('Auth initialization failed:', error);
        if (mounted) {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Auth failed',
            initialized: true
          });
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        debugLog('Auth state change event:', {
          event,
          hasSession: !!session,
          userId: session?.user?.id,
          timestamp: new Date().toISOString(),
          currentURL: window.location.href
        });

        if (!mounted) {
          debugLog('Component unmounted during auth change');
          return;
        }

        setAuthState(prev => ({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
          initialized: true
        }));
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      debugLog('Auth cleanup completed');
    };
  }, [debugLog]);

  const signOut = async () => {
    debugLog('Sign out initiated');
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signOut();

      if (error) {
        debugLog('Sign out error:', error);
        setAuthState(prev => ({
          ...prev,
          error: error.message,
          loading: false
        }));
        return { success: false, error: error.message };
      }

      debugLog('Sign out successful');

      // Use circuit breaker for sign out redirect
      if (circuitBreaker.logRedirect('/', 'signOut')) {
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }

      return { success: true };
    } catch (error) {
      debugLog('Unexpected sign out error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
      return { success: false, error: errorMessage };
    }
  };

  const signIn = async (email: string, password: string) => {
    debugLog('Sign in attempt for:', email);
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        debugLog('Sign in error:', error);
        setAuthState(prev => ({
          ...prev,
          error: error.message,
          loading: false
        }));
        return { success: false, error: error.message };
      }

      debugLog('Sign in successful:', data.user?.id);
      return { success: true, user: data.user };
    } catch (error) {
      debugLog('Unexpected sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...authState,
    signOut,
    signIn,
    isAuthenticated: authState.initialized && !!authState.user
  };
};