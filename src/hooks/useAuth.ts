// src/hooks/useAuth.ts
"use client";

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    console.log('🔐 Auth: Initializing auth state check');

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Auth: Session error:', error);
          setState(prev => ({
            ...prev,
            loading: false,
            error: error.message,
            user: null,
            emailConfirmed: false,
            isAuthenticated: false,
            requiresVerification: false
          }));
          return;
        }

        const user = session?.user || null;
        const emailConfirmed = user?.email_confirmed_at ? true : false;
        const isAuthenticated = !!user && emailConfirmed;
        const requiresVerification = !!user && !emailConfirmed;

        console.log('🔍 Auth: Initial session state:', {
          hasUser: !!user,
          emailConfirmed,
          isAuthenticated,
          requiresVerification,
          email: user?.email,
          emailConfirmedAt: user?.email_confirmed_at
        });

        setState({
          user,
          loading: false,
          error: null,
          emailConfirmed,
          isAuthenticated,
          requiresVerification
        });

      } catch (err) {
        console.error('❌ Auth: Initialization failed:', err);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to initialize authentication',
          user: null,
          emailConfirmed: false,
          isAuthenticated: false,
          requiresVerification: false
        }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth: State change event:', event, {
          hasUser: !!session?.user,
          email: session?.user?.email,
          emailConfirmedAt: session?.user?.email_confirmed_at
        });

        const user = session?.user || null;
        const emailConfirmed = user?.email_confirmed_at ? true : false;
        const isAuthenticated = !!user && emailConfirmed;
        const requiresVerification = !!user && !emailConfirmed;

        setState({
          user,
          loading: false,
          error: null,
          emailConfirmed,
          isAuthenticated,
          requiresVerification
        });
      }
    );

    return () => {
      console.log('🔐 Auth: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    console.log('🔐 Auth: Sign in attempt for:', email);

    try {
      setState(prev => ({ ...prev, error: null, loading: true }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Auth: Sign in failed:', error.message);
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
        return { success: false, error: error.message };
      }

      const user = data.user;
      const emailConfirmed = user?.email_confirmed_at ? true : false;
      const isAuthenticated = !!user && emailConfirmed;
      const requiresVerification = !!user && !emailConfirmed;

      console.log('✅ Auth: Sign in successful', {
        emailConfirmed,
        isAuthenticated,
        requiresVerification
      });

      setState(prev => ({
        ...prev,
        loading: false,
        user,
        emailConfirmed,
        isAuthenticated,
        requiresVerification,
        error: null
      }));

      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      console.error('❌ Auth: Sign in error:', errorMessage);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    console.log('🔐 Auth: Sign up attempt for:', email);

    try {
      setState(prev => ({ ...prev, error: null, loading: true }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        console.error('❌ Auth: Sign up failed:', error.message);
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
        return { success: false, error: error.message };
      }

      const user = data.user;
      const session = data.session;

      if (user && !session) {
        // Email confirmation required
        console.log('🔐 Auth: Sign up successful - email confirmation required');
        setState(prev => ({
          ...prev,
          loading: false,
          user,
          emailConfirmed: false,
          isAuthenticated: false,
          requiresVerification: true,
          error: null
        }));
        return {
          success: true,
          error: 'Please check your email to confirm your account before signing in.'
        };
      }

      // Auto-confirmed (development mode)
      console.log('✅ Auth: Sign up successful - auto confirmed');
      setState(prev => ({
        ...prev,
        loading: false,
        user,
        emailConfirmed: true,
        isAuthenticated: true,
        requiresVerification: false,
        error: null
      }));

      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      console.error('❌ Auth: Sign up error:', errorMessage);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    console.log('🔐 Auth: Sign out initiated');

    try {
      setState(prev => ({ ...prev, error: null }));

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Auth: Sign out failed:', error.message);
        setState(prev => ({ ...prev, error: error.message }));
        return { success: false, error: error.message };
      }

      console.log('✅ Auth: Sign out successful');

      setState({
        user: null,
        loading: false,
        error: null,
        emailConfirmed: false,
        isAuthenticated: false,
        requiresVerification: false
      });

      // Simple redirect after state update
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
  };

  const resendVerification = async (): Promise<AuthResult> => {
    if (!state.user?.email) {
      console.error('❌ Auth: No email found for resend verification');
      return { success: false, error: 'No email address found' };
    }

    console.log('🔐 Auth: Resending verification email to:', state.user.email);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: state.user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        console.error('❌ Auth: Resend verification failed:', error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ Auth: Verification email resent successfully');
      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend verification email';
      console.error('❌ Auth: Resend verification error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    console.log('🔐 Auth: Clearing error state');
    setState(prev => ({ ...prev, error: null }));
  };

  const refreshSession = async (): Promise<AuthResult> => {
    console.log('🔐 Auth: Refreshing session');

    try {
      setState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('❌ Auth: Session refresh failed:', error.message);
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
        return { success: false, error: error.message };
      }

      const user = data.session?.user || null;
      const emailConfirmed = user?.email_confirmed_at ? true : false;
      const isAuthenticated = !!user && emailConfirmed;
      const requiresVerification = !!user && !emailConfirmed;

      console.log('✅ Auth: Session refreshed successfully');

      setState(prev => ({
        ...prev,
        loading: false,
        user,
        emailConfirmed,
        isAuthenticated,
        requiresVerification,
        error: null
      }));

      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Session refresh failed';
      console.error('❌ Auth: Session refresh error:', errorMessage);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  };

  // Return all auth state and methods
  return {
    // Core state
    user: state.user,
    loading: state.loading,
    error: state.error,

    // Email verification state
    emailConfirmed: state.emailConfirmed,
    isAuthenticated: state.isAuthenticated,
    requiresVerification: state.requiresVerification,

    // Auth methods
    signIn,
    signUp,
    signOut,
    resendVerification,
    clearError,
    refreshSession
  };
};

// Export types for use in other components
export type { AuthResult };