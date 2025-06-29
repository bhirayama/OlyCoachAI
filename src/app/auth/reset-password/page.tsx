'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const { updatePassword, user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info' | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [resetComplete, setResetComplete] = useState(false);

  // ✅ FIXED: Handle both PKCE and direct token flows
  useEffect(() => {
    const validateResetToken = async () => {
      console.log('🔐 ResetPassword: Starting PKCE-compatible token validation');

      try {
        // Get all possible URL parameters
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('🔍 ResetPassword: URL analysis:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type,
          error,
          errorDescription,
          allParams: Object.fromEntries(searchParams.entries()),
          fullURL: window.location.href
        });

        // Handle error in URL (expired/invalid token)
        if (error) {
          console.log('❌ ResetPassword: Error in URL parameters:', error, errorDescription);
          setIsValidToken(false);

          if (error === 'access_denied' || errorDescription?.includes('expired')) {
            setMessage('Reset link has expired. Please request a new password reset.');
          } else {
            setMessage('Invalid reset link. Please request a new password reset.');
          }

          setMessageType('error');
          setIsValidating(false);
          return;
        }

        // ✅ Method 1: Direct token validation (if tokens are in URL)
        if (accessToken && refreshToken && type === 'recovery') {
          console.log('🔍 ResetPassword: Direct token flow detected');

          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('❌ ResetPassword: Session validation failed:', sessionError);
            setIsValidToken(false);
            setMessage('Reset link is no longer valid. Please request a new one.');
            setMessageType('error');
            setIsValidating(false);
            return;
          }

          if (sessionData.session && sessionData.user) {
            console.log('✅ ResetPassword: Direct token validation successful');
            setIsValidToken(true);
            setMessage('Reset link verified. Please enter your new password.');
            setMessageType('info');
            setIsValidating(false);
            return;
          }
        }

        // ✅ Method 2: Check existing session (after PKCE redirect)
        console.log('🔍 ResetPassword: Checking existing session (PKCE flow)');

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('❌ ResetPassword: Session check failed:', sessionError);
          setIsValidToken(false);
          setMessage('Failed to validate reset session. Please request a new reset link.');
          setMessageType('error');
          setIsValidating(false);
          return;
        }

        if (session && session.user) {
          console.log('✅ ResetPassword: Valid session found (PKCE successful)', {
            userId: session.user.id,
            email: session.user.email,
            provider: session.user.app_metadata?.provider
          });

          setIsValidToken(true);
          setMessage('Reset link verified. Please enter your new password.');
          setMessageType('info');
          setIsValidating(false);
          return;
        }

        // ✅ Method 3: Listen for auth state changes (PKCE in progress)
        console.log('🔍 ResetPassword: Waiting for PKCE auth state change...');

        // Wait up to 5 seconds for auth state to update
        let authTimeout: NodeJS.Timeout;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('🔐 ResetPassword: Auth state change:', event, !!session);

            if (authTimeout) clearTimeout(authTimeout);

            if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
              if (session && session.user) {
                console.log('✅ ResetPassword: Auth state updated with valid session');
                setIsValidToken(true);
                setMessage('Reset link verified. Please enter your new password.');
                setMessageType('info');
                setIsValidating(false);
                subscription.unsubscribe();
                return;
              }
            }

            if (event === 'SIGNED_OUT') {
              console.log('❌ ResetPassword: User signed out during validation');
              setIsValidToken(false);
              setMessage('Reset session expired. Please request a new reset link.');
              setMessageType('error');
              setIsValidating(false);
              subscription.unsubscribe();
            }
          }
        );

        // Set timeout for auth state detection
        authTimeout = setTimeout(() => {
          console.log('⏰ ResetPassword: Auth state timeout - no valid session detected');
          subscription.unsubscribe();
          setIsValidToken(false);
          setMessage('Reset link validation timed out. Please request a new reset link.');
          setMessageType('error');
          setIsValidating(false);
        }, 5000);

      } catch (error) {
        console.error('❌ ResetPassword: Token validation exception:', error);
        setIsValidToken(false);
        setMessage('Failed to validate reset link. Please try again.');
        setMessageType('error');
        setIsValidating(false);
      }
    };

    validateResetToken();
  }, [searchParams]);

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔐 ResetPassword: Form submitted');

    // Validation
    if (!password || !confirmPassword) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      setMessage(validation.errors.join('. '));
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType(null);

    console.log('🔐 ResetPassword: Updating password');
    const result = await updatePassword(password);

    if (result.success) {
      console.log('✅ ResetPassword: Password updated successfully');
      setMessage('Password updated successfully! Redirecting to dashboard...');
      setMessageType('success');
      setResetComplete(true);

      // Redirect to dashboard after successful reset
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } else {
      console.error('❌ ResetPassword: Update failed:', result.error);
      setMessage(result.error || 'Failed to update password. Please try again.');
      setMessageType('error');
    }

    setIsLoading(false);
  };

  // Loading state while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen bg-navy-primary flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin mx-auto" />
          <p className="text-text-secondary">Verifying reset link...</p>
          <p className="text-xs text-text-disabled">
            This may take a few seconds for PKCE verification
          </p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-navy-primary flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-navy-secondary/50 backdrop-blur-sm rounded-xl p-8 text-center space-y-8">

          <div className="space-y-4">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Invalid Reset Link
              </h1>
              <p className="text-text-secondary">
                This password reset link is invalid or has expired.
              </p>
            </div>
          </div>

          {/* Show specific error message */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">
              {message || 'Reset links expire after 24 hours for security. Please request a new one.'}
            </p>
          </div>

          {/* Debug information */}
          <div className="bg-navy-primary/30 rounded-lg p-4 space-y-2">
            <h4 className="text-text-primary font-semibold text-sm">
              Debug Info:
            </h4>
            <div className="text-xs text-text-disabled text-left">
              <p>URL: {window.location.href}</p>
              <p>Params: {searchParams.toString()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/forgot-password"
              className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Request New Reset Link
            </Link>

            <Link
              href="/"
              className="text-electric-blue hover:text-electric-blue/80 font-medium transition-colors duration-200"
            >
              Back to Home
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // Success state - Password reset complete
  if (resetComplete) {
    return (
      <div className="min-h-screen bg-navy-primary flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-navy-secondary/50 backdrop-blur-sm rounded-xl p-8 text-center space-y-8">

          <div className="space-y-4">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Password Updated!
              </h1>
              <p className="text-text-secondary">
                Your password has been successfully updated. You're now signed in.
              </p>
            </div>
          </div>

          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-400 text-sm">
              🎉 Redirecting to your dashboard...
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/dashboard"
              className="text-electric-blue hover:text-electric-blue/80 font-medium transition-colors duration-200"
            >
              Go to Dashboard Now
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // Main password reset form
  return (
    <div className="min-h-screen bg-navy-primary flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-navy-secondary/50 backdrop-blur-sm rounded-xl p-8 space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-electric-blue" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Set New Password
            </h1>
            <p className="text-text-secondary">
              Choose a strong password for your account
            </p>
          </div>
        </div>

        {/* Reset Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* New Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                autoFocus
                className="w-full px-4 py-3 pr-12 bg-navy-primary/50 border border-navy-primary rounded-lg text-text-primary placeholder-text-disabled focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-colors"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-disabled hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 pr-12 bg-navy-primary/50 border border-navy-primary rounded-lg text-text-primary placeholder-text-disabled focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-colors"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-disabled hover:text-text-secondary transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-navy-primary/30 rounded-lg p-4 space-y-2">
            <h4 className="text-text-primary font-semibold text-sm">
              Password Requirements:
            </h4>
            <ul className="text-xs text-text-disabled space-y-1 list-disc list-inside">
              <li>At least 6 characters long</li>
              <li>Contains uppercase and lowercase letters</li>
              <li>Contains at least one number</li>
            </ul>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`rounded-lg p-4 flex items-start gap-3 ${messageType === 'success'
                ? 'bg-green-900/20 border border-green-500/30 text-green-400'
                : messageType === 'error'
                  ? 'bg-red-900/20 border border-red-500/30 text-red-400'
                  : 'bg-blue-900/20 border border-blue-500/30 text-blue-400'
              }`}>
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm">{message}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="w-full bg-electric-blue hover:bg-electric-blue/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Update Password</span>
              </>
            )}
          </button>

          {/* Security Notice */}
          <div className="bg-navy-primary/20 rounded-lg p-4 text-center">
            <p className="text-xs text-text-disabled">
              🔒 Your password is encrypted and stored securely
            </p>
          </div>

        </form>

      </div>
    </div>
  );
}