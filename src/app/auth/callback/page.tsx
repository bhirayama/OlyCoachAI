'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing verification...');
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('🔐 Auth Callback: Starting verification process');

      // ✅ ENHANCED: Capture full URL details for debugging
      const fullURL = window.location.href;
      const hash = window.location.hash;
      const search = window.location.search;

      console.log('🔍 Auth Callback: URL Analysis:', {
        fullURL,
        hash,
        search,
        hasHash: hash.length > 0,
        hasSearch: search.length > 0
      });

      // Get all possible parameters
      const urlParams = new URLSearchParams(search);
      const hashParams = new URLSearchParams(hash.substring(1)); // Remove # from hash

      const code = urlParams.get('code') || hashParams.get('code');
      const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
      const error = urlParams.get('error') || hashParams.get('error');
      const errorCode = urlParams.get('error_code') || hashParams.get('error_code');
      const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');

      const debugData = {
        code: code ? `${code.substring(0, 10)}...` : 'none',
        accessToken: accessToken ? 'present' : 'none',
        refreshToken: refreshToken ? 'present' : 'none',
        error: error || 'none',
        errorCode: errorCode || 'none',
        errorDescription: errorDescription || 'none'
      };

      console.log('🔍 Auth Callback: Parameters found:', debugData);
      setDebugInfo(JSON.stringify(debugData, null, 2));

      // Handle errors first
      if (error || errorCode) {
        console.error('❌ Auth Callback: Error in URL:', {
          error,
          errorCode,
          errorDescription
        });

        if (errorCode === 'otp_expired') {
          setStatus('error');
          setMessage('Your verification link has expired. Please request a new one.');
        } else if (error === 'access_denied') {
          setStatus('error');
          setMessage('Verification was denied or the link is invalid.');
        } else {
          setStatus('error');
          setMessage(`Verification failed: ${errorDescription || error}`);
        }

        setTimeout(() => {
          router.push('/?auth=signup&error=verification_failed');
        }, 5000);
        return;
      }

      // ✅ Method 1: Try code exchange (PKCE flow)
      if (code) {
        console.log('🔐 Auth Callback: Found auth code, exchanging for session...');

        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('❌ Auth Callback: Code exchange failed:', exchangeError);
            setStatus('error');
            setMessage(`Code exchange failed: ${exchangeError.message}`);
            setTimeout(() => {
              router.push('/?auth=signup&error=code_exchange_failed');
            }, 5000);
            return;
          }

          if (data.session && data.user) {
            console.log('✅ Auth Callback: Code exchange successful!', {
              userId: data.user.id,
              email: data.user.email,
              emailConfirmed: data.user.email_confirmed_at
            });

            setStatus('success');
            setMessage('Email verified successfully! Redirecting to dashboard...');

            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
            return;
          }

        } catch (error) {
          console.error('❌ Auth Callback: Exception during code exchange:', error);
          setStatus('error');
          setMessage('An error occurred during code exchange.');
          setTimeout(() => {
            router.push('/?auth=signup&error=exchange_exception');
          }, 5000);
          return;
        }
      }

      // ✅ Method 2: Try implicit flow (if access_token present)
      if (accessToken) {
        console.log('🔐 Auth Callback: Found access token, setting session...');

        try {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (sessionError) {
            console.error('❌ Auth Callback: Session set failed:', sessionError);
            setStatus('error');
            setMessage(`Session setup failed: ${sessionError.message}`);
            setTimeout(() => {
              router.push('/?auth=signup&error=session_setup_failed');
            }, 5000);
            return;
          }

          if (data.session && data.user) {
            console.log('✅ Auth Callback: Session set successful!');
            setStatus('success');
            setMessage('Email verified successfully! Redirecting to dashboard...');

            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
            return;
          }

        } catch (error) {
          console.error('❌ Auth Callback: Exception during session setup:', error);
          setStatus('error');
          setMessage('An error occurred during session setup.');
          setTimeout(() => {
            router.push('/?auth=signup&error=session_exception');
          }, 5000);
          return;
        }
      }

      // ✅ Method 3: Check for existing session
      console.log('🔍 Auth Callback: No auth parameters, checking existing session...');

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('❌ Auth Callback: Session check failed:', sessionError);
          setStatus('error');
          setMessage('Failed to verify session. Please try signing in.');
          setTimeout(() => {
            router.push('/?auth=login&error=session_error');
          }, 5000);
          return;
        }

        if (session && session.user) {
          console.log('✅ Auth Callback: Existing session found');
          setStatus('success');
          setMessage('Already signed in! Redirecting to dashboard...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          console.warn('⚠️ Auth Callback: No verification data found');
          setStatus('error');
          setMessage('No verification code found. Please check your email link format and try again.');
          // Don't auto-redirect here, let user see the debug info
        }

      } catch (error) {
        console.error('❌ Auth Callback: Exception during session check:', error);
        setStatus('error');
        setMessage('An unexpected error occurred.');
        setTimeout(() => {
          router.push('/?auth=signup&error=callback_exception');
        }, 5000);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 text-center">

        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Verifying Your Email
            </h2>
            <p className="text-slate-300">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Email Verified!
            </h2>
            <p className="text-slate-300">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Verification Issue
            </h2>
            <p className="text-slate-300 mb-6">{message}</p>

            {/* ✅ NEW: Debug information display */}
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-blue-400 text-sm mb-2">
                Show Debug Information
              </summary>
              <pre className="bg-slate-900 p-3 rounded text-xs text-slate-300 overflow-auto">
                {debugInfo}
              </pre>
              <p className="text-xs text-slate-400 mt-2">
                Current URL: {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
              </p>
            </details>

            <button
              onClick={() => router.push('/?auth=signup')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}