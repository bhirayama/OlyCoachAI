"use client";

import { useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthResult {
  success: boolean;
  error?: string;
  errorType?: 'network' | 'validation' | 'rate_limit' | 'auth' | 'unknown';
  canRetry?: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  errorType: 'network' | 'validation' | 'rate_limit' | 'auth' | 'unknown' | null;
  canRetry: boolean;
  emailConfirmed: boolean;
  isAuthenticated: boolean;
  requiresVerification: boolean;
}

// Enhanced error message translation with user-friendly feedback
const getReadableErrorMessage = (error: any): { message: string; type: AuthResult['errorType']; canRetry: boolean } => {
  const rawMessage = error?.message || error || 'Unknown error';
  const lowerMessage = rawMessage.toLowerCase();

  console.log('🔍 Auth Error Analysis:', { rawMessage, type: typeof error });

  // Network connection errors
  if (lowerMessage.includes('fetch') ||
    lowerMessage.includes('network') ||
    lowerMessage.includes('failed to fetch') ||
    lowerMessage.includes('connection') ||
    rawMessage.includes('TypeError: Failed to fetch')) {
    return {
      message: 'Network connection failed. Please check your internet connection and try again.',
      type: 'network',
      canRetry: true
    };
  }

  // Authentication errors
  if (lowerMessage.includes('invalid login credentials') ||
    lowerMessage.includes('invalid credentials')) {
    return {
      message: 'Invalid email or password. Please double-check your credentials.',
      type: 'auth',
      canRetry: false
    };
  }

  if (lowerMessage.includes('email not confirmed') ||
    lowerMessage.includes('email_not_confirmed')) {
    return {
      message: 'Please check your email and click the verification link before signing in.',
      type: 'validation',
      canRetry: false
    };
  }

  if (lowerMessage.includes('user already registered') ||
    lowerMessage.includes('user_already_exists')) {
    return {
      message: 'An account with this email already exists. Try signing in instead.',
      type: 'validation',
      canRetry: false
    };
  }

  // Password validation errors
  if (lowerMessage.includes('password should be at least') ||
    lowerMessage.includes('password must be at least')) {
    return {
      message: 'Password must be at least 6 characters long with a mix of letters and numbers.',
      type: 'validation',
      canRetry: false
    };
  }

  if (lowerMessage.includes('password is too weak') ||
    lowerMessage.includes('weak password')) {
    return {
      message: 'Password is too weak. Use at least 8 characters with uppercase, lowercase, and numbers.',
      type: 'validation',
      canRetry: false
    };
  }

  // Rate limiting
  if (lowerMessage.includes('rate limit') ||
    lowerMessage.includes('too many requests') ||
    lowerMessage.includes('email rate limit exceeded')) {
    return {
      message: 'Too many attempts. Please wait 5 minutes before trying again.',
      type: 'rate_limit',
      canRetry: true
    };
  }

  // Email validation
  if (lowerMessage.includes('invalid email') ||
    lowerMessage.includes('email address is invalid')) {
    return {
      message: 'Please enter a valid email address.',
      type: 'validation',
      canRetry: false
    };
  }

  // Signup disabled
  if (lowerMessage.includes('signup is disabled') ||
    lowerMessage.includes('signups not allowed')) {
    return {
      message: 'New account creation is temporarily disabled. Please try again later.',
      type: 'auth',
      canRetry: true
    };
  }

  // Session errors
  if (lowerMessage.includes('session not found') ||
    lowerMessage.includes('no session')) {
    return {
      message: 'Your session has expired. Please sign in again.',
      type: 'auth',
      canRetry: false
    };
  }

  // Server errors
  if (lowerMessage.includes('500') ||
    lowerMessage.includes('internal server error') ||
    lowerMessage.includes('service unavailable')) {
    return {
      message: 'Server is temporarily unavailable. Please try again in a few moments.',
      type: 'network',
      canRetry: true
    };
  }

  // Fallback for unknown errors
  console.warn('⚠️ Auth: Unhandled error type:', rawMessage);
  return {
    message: rawMessage.length > 100 ? 'An unexpected error occurred. Please try again.' : rawMessage,
    type: 'unknown',
    canRetry: true
  };
};

// Network status detection
const checkNetworkStatus = async (): Promise<boolean> => {
  if (!navigator.onLine) {
    return false;
  }

  try {
    // Try to reach a reliable endpoint
    const response = await fetch('https://www.google.com/favicon.ico', {
      mode: 'no-cors',
      timeout: 5000
    });
    return true;
  } catch {
    return false;
  }
};

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    errorType: null,
    canRetry: false,
    emailConfirmed: false,
    isAuthenticated: false,
    requiresVerification: false
  });

  const updateAuthState = useCallback((
    user: User | null,
    loading: boolean = false,
    error: string | null = null,
    errorType: AuthState['errorType'] = null,
    canRetry: boolean = false
  ) => {
    const emailConfirmed = user?.email_confirmed_at ? true : false;
    const isAuthenticated = !!user && emailConfirmed;
    const requiresVerification = !!user && !emailConfirmed;

    setState({
      user,
      loading,
      error,
      errorType,
      canRetry,
      emailConfirmed,
      isAuthenticated,
      requiresVerification
    });
  }, []);

  useEffect(() => {
    console.log('🔐 Auth: Initializing with enhanced error handling');

    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('❌ Auth: Session error:', error);
          const { message, type, canRetry } = getReadableErrorMessage(error);
          updateAuthState(null, false, message, type, canRetry);
          return;
        }

        const user = session?.user || null;
        console.log('🔍 Auth: Initial session:', {
          hasUser: !!user,
          email: user?.email,
          emailConfirmed: user?.email_confirmed_at ? true : false
        });

        updateAuthState(user, false, null, null, false);

      } catch (err) {
        if (!mounted) return;
        console.error('❌ Auth: Initialization failed:', err);
        const { message, type, canRetry } = getReadableErrorMessage(err);
        updateAuthState(null, false, message, type, canRetry);
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
        updateAuthState(user, false, null, null, false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateAuthState]);

  const signIn = useCallback(async (email: string, password: string, retryCount: number = 0): Promise<AuthResult> => {
    console.log('🔐 Auth: Sign in attempt for:', email, retryCount > 0 ? `(retry ${retryCount})` : '');

    // Input validation
    if (!email || !password) {
      const error = !email ? 'Email address is required' : 'Password is required';
      setState(prev => ({ ...prev, error, errorType: 'validation', canRetry: false }));
      return { success: false, error, errorType: 'validation', canRetry: false };
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = 'Please enter a valid email address';
      setState(prev => ({ ...prev, error, errorType: 'validation', canRetry: false }));
      return { success: false, error, errorType: 'validation', canRetry: false };
    }

    try {
      setState(prev => ({ ...prev, error: null, errorType: null, canRetry: false, loading: true }));

      // Check network status for network errors
      if (retryCount === 0) {
        const isOnline = await checkNetworkStatus();
        if (!isOnline) {
          const error = 'No internet connection. Please check your network and try again.';
          setState(prev => ({ ...prev, loading: false, error, errorType: 'network', canRetry: true }));
          return { success: false, error, errorType: 'network', canRetry: true };
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      setState(prev => ({ ...prev, loading: false }));

      if (error) {
        console.error('❌ Auth: Sign in failed:', error.message);
        const { message, type, canRetry } = getReadableErrorMessage(error);
        setState(prev => ({ ...prev, error: message, errorType: type, canRetry }));
        return { success: false, error: message, errorType: type, canRetry };
      }

      console.log('✅ Auth: Sign in successful');
      return { success: true };

    } catch (err) {
      console.error('❌ Auth: Sign in error:', err);
      const { message, type, canRetry } = getReadableErrorMessage(err);
      setState(prev => ({ ...prev, loading: false, error: message, errorType: type, canRetry }));
      return { success: false, error: message, errorType: type, canRetry };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, retryCount: number = 0): Promise<AuthResult> => {
    console.log('🔐 Auth: Sign up attempt for:', email, retryCount > 0 ? `(retry ${retryCount})` : '');

    // Input validation
    if (!email || !password) {
      const error = !email ? 'Email address is required' : 'Password is required';
      setState(prev => ({ ...prev, error, errorType: 'validation', canRetry: false }));
      return { success: false, error, errorType: 'validation', canRetry: false };
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = 'Please enter a valid email address';
      setState(prev => ({ ...prev, error, errorType: 'validation', canRetry: false }));
      return { success: false, error, errorType: 'validation', canRetry: false };
    }

    // Password strength validation
    if (password.length < 6) {
      const error = 'Password must be at least 6 characters long';
      setState(prev => ({ ...prev, error, errorType: 'validation', canRetry: false }));
      return { success: false, error, errorType: 'validation', canRetry: false };
    }

    try {
      setState(prev => ({ ...prev, error: null, errorType: null, canRetry: false, loading: true }));

      // Check network status for network errors
      if (retryCount === 0) {
        const isOnline = await checkNetworkStatus();
        if (!isOnline) {
          const error = 'No internet connection. Please check your network and try again.';
          setState(prev => ({ ...prev, loading: false, error, errorType: 'network', canRetry: true }));
          return { success: false, error, errorType: 'network', canRetry: true };
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      setState(prev => ({ ...prev, loading: false }));

      if (error) {
        console.error('❌ Auth: Sign up failed:', error.message);
        const { message, type, canRetry } = getReadableErrorMessage(error);
        setState(prev => ({ ...prev, error: message, errorType: type, canRetry }));
        return { success: false, error: message, errorType: type, canRetry };
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
        updateAuthState(user, false, null, null, false);
        return { success: true, error: 'CHECK_EMAIL' };
      }

      console.log('✅ Auth: Sign up auto-confirmed');
      return { success: true };

    } catch (err) {
      console.error('❌ Auth: Sign up error:', err);
      const { message, type, canRetry } = getReadableErrorMessage(err);
      setState(prev => ({ ...prev, loading: false, error: message, errorType: type, canRetry }));
      return { success: false, error: message, errorType: type, canRetry };
    }
  }, [updateAuthState]);

  const signOut = useCallback(async (): Promise<AuthResult> => {
    console.log('🔐 Auth: Sign out initiated');

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Auth: Sign out failed:', error.message);
        const { message, type, canRetry } = getReadableErrorMessage(error);
        setState(prev => ({ ...prev, error: message, errorType: type, canRetry }));
        return { success: false, error: message, errorType: type, canRetry };
      }

      console.log('✅ Auth: Sign out successful');
      setTimeout(() => {
        window.location.href = '/';
      }, 100);

      return { success: true };

    } catch (err) {
      console.error('❌ Auth: Sign out error:', err);
      const { message, type, canRetry } = getReadableErrorMessage(err);
      setState(prev => ({ ...prev, error: message, errorType: type, canRetry }));
      return { success: false, error: message, errorType: type, canRetry };
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<AuthResult> => {
    console.log('🔐 Auth: Password reset request for:', email);

    // Email validation
    if (!email) {
      const error = 'Email address is required';
      return { success: false, error, errorType: 'validation', canRetry: false };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = 'Please enter a valid email address';
      return { success: false, error, errorType: 'validation', canRetry: false };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        console.error('❌ Auth: Password reset request failed:', error.message);
        const { message, type, canRetry } = getReadableErrorMessage(error);
        return { success: false, error: message, errorType: type, canRetry };
      }

      console.log('✅ Auth: Password reset email sent');
      return { success: true };

    } catch (err) {
      console.error('❌ Auth: Password reset request error:', err);
      const { message, type, canRetry } = getReadableErrorMessage(err);
      return { success: false, error: message, errorType: type, canRetry };
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string): Promise<AuthResult> => {
    console.log('🔐 Auth: Updating password');

    // Password validation
    if (!newPassword) {
      const error = 'New password is required';
      return { success: false, error, errorType: 'validation', canRetry: false };
    }

    if (newPassword.length < 6) {
      const error = 'Password must be at least 6 characters long';
      return { success: false, error, errorType: 'validation', canRetry: false };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ Auth: Password update failed:', error.message);
        const { message, type, canRetry } = getReadableErrorMessage(error);
        return { success: false, error: message, errorType: type, canRetry };
      }

      console.log('✅ Auth: Password updated successfully');

      if (data.user) {
        updateAuthState(data.user, false, null, null, false);
      }

      return { success: true };

    } catch (err) {
      console.error('❌ Auth: Password update error:', err);
      const { message, type, canRetry } = getReadableErrorMessage(err);
      return { success: false, error: message, errorType: type, canRetry };
    }
  }, [updateAuthState]);

  const resendVerification = useCallback(async (): Promise<AuthResult> => {
    if (!state.user?.email) {
      return { success: false, error: 'No email address found', errorType: 'validation', canRetry: false };
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
        const { message, type, canRetry } = getReadableErrorMessage(error);
        return { success: false, error: message, errorType: type, canRetry };
      }

      console.log('✅ Auth: Verification email resent');
      return { success: true };

    } catch (err) {
      console.error('❌ Auth: Resend error:', err);
      const { message, type, canRetry } = getReadableErrorMessage(err);
      return { success: false, error: message, errorType: type, canRetry };
    }
  }, [state.user?.email]);

  const checkVerificationStatus = useCallback(async (): Promise<AuthResult> => {
    console.log('🔐 Auth: Checking verification status');

    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        const { message, type, canRetry } = getReadableErrorMessage(error);
        return { success: false, error: message, errorType: type, canRetry };
      }

      const user = session?.user;
      if (!user) {
        return { success: false, error: 'No user session found', errorType: 'auth', canRetry: false };
      }

      const emailConfirmed = user.email_confirmed_at ? true : false;
      updateAuthState(user, false, null, null, false);

      return {
        success: true,
        error: emailConfirmed ? undefined : 'Email verification still required'
      };

    } catch (err) {
      const { message, type, canRetry } = getReadableErrorMessage(err);
      return { success: false, error: message, errorType: type, canRetry };
    }
  }, [updateAuthState]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, errorType: null, canRetry: false }));
  }, []);

  // Retry function for network errors
  const retryLastAction = useCallback(async (action: 'signIn' | 'signUp', email: string, password: string): Promise<AuthResult> => {
    console.log('🔄 Auth: Retrying last action:', action);

    if (action === 'signIn') {
      return await signIn(email, password, 1);
    } else {
      return await signUp(email, password, 1);
    }
  }, [signIn, signUp]);

  return {
    // Core state
    user: state.user,
    loading: state.loading,
    error: state.error,
    errorType: state.errorType,
    canRetry: state.canRetry,

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
    checkVerificationStatus,
    requestPasswordReset,
    updatePassword,
    retryLastAction,

    // Utility functions
    checkNetworkStatus
  };
};

export type { AuthResult };