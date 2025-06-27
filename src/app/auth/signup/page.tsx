'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { OlympicBackground } from '@/components/OlympicBackground';
import { TouchOptimizedButton } from '@/components/TouchOptimized';
import { ResendVerification } from '@/components/ResendVerification';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [error, setError] = useState('');

  // Check for expired error from callback
  React.useEffect(() => {
    if (searchParams.get('error') === 'expired') {
      setError('Your verification link has expired. Please sign up again or resend verification.');
    }
  }, [searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      if (data.user && !data.session) {
        // Email confirmation required
        setShowVerification(true);
      } else if (data.session) {
        // Auto-confirmed (email confirmations disabled)
        router.push('/dashboard');
      }

    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (showVerification) {
    return (
      <OlympicBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md mx-auto">
            <ResendVerification email={email} />
          </div>
        </div>
      </OlympicBackground>
    );
  }

  return (
    <OlympicBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-navy-secondary/50 backdrop-blur-sm rounded-xl p-8 max-w-md w-full">

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Create Account
            </h1>
            <p className="text-text-secondary">
              Join OlyCoachAI to start your Olympic weightlifting journey
            </p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-navy-primary border border-gray-600 rounded-lg text-text-primary placeholder-text-disabled focus:border-electric-blue focus:outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-navy-primary border border-gray-600 rounded-lg text-text-primary placeholder-text-disabled focus:border-electric-blue focus:outline-none"
                placeholder="Create a strong password"
              />
            </div>

            <TouchOptimizedButton
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </TouchOptimizedButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className="text-electric-blue hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>

        </div>
      </div>
    </OlympicBackground>
  );
}