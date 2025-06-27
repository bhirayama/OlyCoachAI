'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { OlympicBackground } from '@/components/OlympicBackground';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from URL
        const hashFragment = window.location.hash.substring(1);
        const params = new URLSearchParams(hashFragment);

        // Check for errors first
        const error = params.get('error');
        const errorCode = params.get('error_code');
        const errorDescription = params.get('error_description');

        if (error) {
          console.error('Auth callback error:', {
            error,
            errorCode,
            errorDescription
          });

          if (errorCode === 'otp_expired') {
            setStatus('error');
            setMessage('Verification link has expired. Please request a new one.');
            // Redirect to signup page with error
            setTimeout(() => {
              router.push('/auth/signup?error=expired');
            }, 3000);
            return;
          }

          setStatus('error');
          setMessage(`Authentication failed: ${errorDescription || error}`);
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
          return;
        }

        // Get access token and refresh token
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set the session
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            throw sessionError;
          }

          if (data.user) {
            // Check if user profile exists
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', data.user.id)
              .single();

            // Create profile if it doesn't exist
            if (profileError && profileError.code === 'PGRST116') {
              const { error: createError } = await supabase
                .from('user_profiles')
                .insert([
                  {
                    user_id: data.user.id,
                    email: data.user.email,
                    onboarding_completed: false,
                    onboarding_step: 0
                  }
                ]);

              if (createError) {
                console.error('Profile creation error:', createError);
              }
            }

            setStatus('success');
            setMessage('Email confirmed successfully! Redirecting to dashboard...');

            // Redirect to dashboard
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
          }
        } else {
          // Try to get session directly (in case it's already set)
          const { data: { session }, error: getSessionError } = await supabase.auth.getSession();

          if (getSessionError) {
            throw getSessionError;
          }

          if (session) {
            setStatus('success');
            setMessage('Already signed in! Redirecting to dashboard...');
            setTimeout(() => {
              router.push('/dashboard');
            }, 1000);
          } else {
            throw new Error('No valid session found');
          }
        }

      } catch (error) {
        console.error('Auth callback processing error:', error);
        setStatus('error');
        setMessage('Failed to process authentication. Please try signing in again.');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <OlympicBackground>
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-navy-secondary/50 backdrop-blur-sm rounded-xl p-8 max-w-md mx-auto text-center space-y-6">

          {status === 'loading' && (
            <>
              <LoadingSpinner size="lg" />
              <h2 className="text-xl font-semibold text-text-primary">
                Confirming Email
              </h2>
              <p className="text-text-secondary">
                {message}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-text-primary">
                Success!
              </h2>
              <p className="text-text-secondary">
                {message}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-text-primary">
                Verification Failed
              </h2>
              <p className="text-text-secondary">
                {message}
              </p>
            </>
          )}

        </div>
      </div>
    </OlympicBackground>
  );
}