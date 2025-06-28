// src/components/auth/AuthModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { X, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { signUp, signIn, error, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setShowVerificationMessage(false);
    }
  }, [isOpen, initialMode]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 AuthModal: Form submitted', { mode, email });

    if (mode === 'signup') {
      const result = await signUp(email, password);
      console.log('🔐 AuthModal: Signup result', result);

      if (result.success && result.error?.includes('email')) {
        // Show verification message for email confirmation
        setShowVerificationMessage(true);
      } else if (result.success) {
        // Auto-confirmed signup, close modal
        onClose();
      }
    } else {
      const result = await signIn(email, password);
      console.log('🔐 AuthModal: Signin result', result);

      if (result.success) {
        onClose();
      }
    }
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  // Show verification message after successful signup
  if (showVerificationMessage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Verification Message */}
        <div className="relative bg-navy-secondary/95 backdrop-blur-sm rounded-xl p-8 max-w-md w-full text-center space-y-6 border border-navy-primary/30">
          <div className="w-16 h-16 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Check Your Email</h2>
          <p className="text-text-secondary">
            We sent a verification link to:
            <br />
            <span className="text-electric-blue font-semibold">{email}</span>
          </p>
          <p className="text-sm text-text-disabled">
            Click the link in your email to verify your account, then return here to sign in.
          </p>
          <button
            onClick={() => setShowVerificationMessage(false)}
            className="text-electric-blue hover:text-electric-blue/80 text-sm font-medium transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-navy-secondary/95 backdrop-blur-sm rounded-xl max-w-md w-full border border-navy-primary/30">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-navy-primary/30">
          <h2 className="text-2xl font-bold text-text-primary">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-navy-primary/50 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Branding */}
        <div className="px-6 pt-4 text-center">
          <h3 className="text-lg font-bold text-text-primary">
            OLYMPIC WEIGHTLIFTING AI
          </h3>
          <p className="text-electric-blue text-sm font-semibold uppercase tracking-wide">
            AI Coaching That Adapts
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-navy-primary/50 border border-navy-primary rounded-lg text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-colors"
                placeholder="your@email.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="w-full px-4 py-3 pr-12 bg-navy-primary/50 border border-navy-primary rounded-lg text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-disabled hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-text-disabled mt-1">
                  Minimum 6 characters
                </p>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-status-error/10 border border-status-error/20 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5" />
              <div className="text-sm text-status-error">{error}</div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-action-orange hover:bg-action-orange/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="px-6 pb-6 text-center border-t border-navy-primary/30 pt-4">
          <p className="text-text-disabled text-sm">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup');
              setEmail('');
              setPassword('');
              setShowPassword(false);
            }}
            className="text-electric-blue hover:text-electric-blue/80 font-medium mt-1 transition-colors duration-200"
          >
            {mode === 'signup' ? 'Sign In' : 'Create Free Account'}
          </button>
        </div>

      </div>
    </div>
  );
};