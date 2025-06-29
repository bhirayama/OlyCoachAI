"use client";

import { useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  emailConfirmed: boolean;
  isAuthenticated: boolean;
  requiresVerification: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    emailConfirmed: false,
    isAuthenticated: false,
    requiresVerification: false
  });

  const updateAuthState = useCallback((user: User | null, loading: boolean = false, error: string | null = null) => {
    const emailConfirmed = user?.email_confirmed_at ? true : false;
    const isAuthenticated = !!user && emailConfirmed;
    const requiresVerification = !!user && !emailConfirmed;

    setState({
      user,
      loading,
      error,
      emailConfirmed,
      isAuthenticated,
      requiresVerification
    });
  }, []);

  useEffect(() => {
    console.log('🔐 Auth: Initializing');

    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('❌ Auth: Session error:', error);
          updateAuthState(null, false, error.message);
          return;
        }

        const user = session?.user || null;
        console.log('🔍 Auth: Initial session:', {
          hasUser: !!user,
          email: user?.email,
          emailConfirmed: user?.email_confirmed_at ? true : false
        });

        updateAuthState(user, false, null);

      } catch (err) {
        if (!mounted) return;
        console.error('❌ Auth: Initialization failed:', err);
        updateAuthState(null, false, 'Failed to initialize authentication');
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log('🔐 Auth: State change:', event, {
          hasUser: !!session?.user,
          email: session?.user?.email
        });

        const user = session?.user || null;
        updateAuthState(user, false, null);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateAuthState]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    console.log('🔐 Auth: Sign in attempt for:', email);

    try {
      setState(prev => ({ ...prev, error: null, loading: true }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      setState(prev => ({ ...prev, loading: false }));

      if (error) {
        console.error('❌ Auth: Sign in failed:', error.message);
        setState(prev => ({ ...prev, error: error.message }));
        return { success: false, error: error.message };
      }

      console.log('✅ Auth: Sign in successful');
      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      console.error('❌ Auth: Sign in error:', errorMessage);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    console.log('🔐 Auth: Sign up attempt for:', email);

    try {
      setState(prev => ({ ...prev, error: null, loading: true }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      setState(prev => ({ ...prev, loading: false }));

      if (error) {
        console.error('❌ Auth: Sign up failed:', error.message);
        setState(prev => ({ ...prev, error: error.message }));
        return { success: false, error: error.message };
      }

      const user = data.user;
      const session = data.session;

      console.log('🔍 Auth: Signup response:', {
        hasUser: !!user,
        hasSession: !!session,
        userEmail: user?.email
      });

      if (user && !session) {
        console.log('📧 Auth: Email confirmation required');
        updateAuthState(user, false, null);
        return { success: true, error: 'CHECK_EMAIL' };
      }

      console.log('✅ Auth: Sign up auto-confirmed');
      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      console.error('❌ Auth: Sign up error:', errorMessage);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [updateAuthState]);

  const signOut = useCallback(async (): Promise<AuthResult> => {
    console.log('🔐 Auth: Sign out initiated');

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Auth: Sign out failed:', error.message);
        setState(prev => ({ ...prev, error: error.message }));
        return { success: false, error: error.message };
      }

      console.log('✅ Auth: Sign out successful');
      setTimeout(() => {
        window.location.href = '/';
      }, 100);

      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      console.error('❌ Auth: Sign out error:', errorMessage);
      setState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const resendVerification = useCallback(async (): Promise<AuthResult> => {
    if (!state.user?.email) {
      return { success: false, error: 'No email address found' };
    }

    console.log('🔐 Auth: Resending verification email');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: state.user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('❌ Auth: Resend failed:', error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ Auth: Verification email resent');
      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend';
      console.error('❌ Auth: Resend error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [state.user?.email]);

  const checkVerificationStatus = useCallback(async (): Promise<AuthResult> => {
    console.log('🔐 Auth: Checking verification status');

    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        return { success: false, error: error.message };
      }

      const user = session?.user;
      if (!user) {
        return { success: false, error: 'No user session found' };
      }

      const emailConfirmed = user.email_confirmed_at ? true : false;
      updateAuthState(user, false, null);

      return {
        success: true,
        error: emailConfirmed ? undefined : 'Email verification still required'
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification check failed';
      return { success: false, error: errorMessage };
    }
  }, [updateAuthState]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // Core state
    user: state.user,
    loading: state.loading,
    error: state.error,

    // Verification state
    emailConfirmed: state.emailConfirmed,
    isAuthenticated: state.isAuthenticated,
    requiresVerification: state.requiresVerification,

    // Methods
    signIn,
    signUp,
    signOut,
    resendVerification,
    clearError,
    checkVerificationStatus
  };
};

export type { AuthResult };