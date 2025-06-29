'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing verification...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('🔐 Auth Callback: Starting');

      try {
        // ✅ SIMPLIFIED: Let Supabase handle the callback automatically
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Auth Callback: Session error:', error);
          setStatus('error');
          setMessage('Verification failed. Please try again.');
          setTimeout(() => router.push('/?auth=signup&error=callback_failed'), 3000);
          return;
        }

        if (data.session) {
          console.log('✅ Auth Callback: Session found, redirecting to dashboard');
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to dashboard...');
          setTimeout(() => router.push('/dashboard'), 2000);
        } else {
          console.log('⚠️ Auth Callback: No session found');
          setStatus('error');
          setMessage('No active session found. Please sign in again.');
          setTimeout(() => router.push('/?auth=login'), 3000);
        }

      } catch (error) {
        console.error('❌ Auth Callback: Exception:', error);
        setStatus('error');
        setMessage('An unexpected error occurred.');
        setTimeout(() => router.push('/?auth=signup&error=callback_exception'), 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

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