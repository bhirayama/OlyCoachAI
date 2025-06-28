// src/components/auth/AuthModal.tsx - UPDATE existing file
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const AuthModal: React.FC = () => {
  const { signUp, signIn, error, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      const result = await signUp(email, password);
      if (result.success && result.requiresVerification) {
        setShowVerificationMessage(true);
      }
    } else {
      await signIn(email, password);
    }
  };

  // Show verification message after successful signup
  if (showVerificationMessage) {
    return (
      <div className="min-h-screen bg-navy-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-navy-secondary/50 backdrop-blur-sm rounded-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Account Created!</h2>
          <p className="text-text-secondary">
            Please check your email and click the verification link to continue.
          </p>
          <button
            onClick={() => setShowVerificationMessage(false)}
            className="text-electric-blue hover:text-electric-blue/80 text-sm font-medium"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-navy-secondary/50 backdrop-blur-sm rounded-xl p-8 space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">
            OLYMPIC WEIGHTLIFTING AI
          </h1>
          <p className="text-electric-blue text-sm font-semibold uppercase tracking-wide">
            AI Coaching That Adapts
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-navy-primary border border-navy-primary rounded-lg text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-navy-primary border border-navy-primary rounded-lg text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-action-orange hover:bg-action-orange/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Toggle Sign Up/Sign In */}
        <div className="text-center">
          <p className="text-text-disabled text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-electric-blue hover:text-electric-blue/80 font-medium mt-1 transition-colors duration-200"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

      </div>
    </div>
  );
};