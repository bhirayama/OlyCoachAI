// src/components/auth/AuthModal.tsx - Enhanced with Fixed Colors & Better UX
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { X, Eye, EyeOff, AlertCircle, Mail, CheckCircle, Clock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

type ModalState = 'auth' | 'check-email' | 'resend-verification';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { signUp, signIn, resendVerification, error, loading, clearError } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [modalState, setModalState] = useState<ModalState>('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setModalState('auth');
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setVerificationEmail('');
      setResendMessage('');
      setResendCooldown(0);
      clearError();
    }
  }, [isOpen, initialMode, clearError]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Resend cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 AuthModal: Form submitted', { mode, email });
    clearError();

    if (mode === 'signup') {
      const result = await signUp(email, password);
      console.log('🔐 AuthModal: Signup result', result);

      if (result.success && result.error === 'CHECK_EMAIL') {
        // ✅ ENHANCED: Show email verification screen
        setVerificationEmail(email);
        setModalState('check-email');
      } else if (result.success) {
        // Auto-confirmed signup, close modal and redirect
        onClose();
        window.location.href = '/dashboard';
      }
    } else {
      const result = await signIn(email, password);
      console.log('🔐 AuthModal: Signin result', result);

      if (result.success) {
        // ✅ FIXED: Close modal and redirect to dashboard immediately
        onClose();
        window.location.href = '/dashboard';
      }
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;

    console.log('📧 AuthModal: Resending verification email');
    setResendMessage('');

    const result = await resendVerification();

    if (result.success) {
      setResendMessage('✅ New verification email sent! Check your inbox.');
      setResendCooldown(60); // 60 second cooldown
    } else {
      setResendMessage(`❌ Failed to resend: ${result.error}`);
    }
  };

  const handleBackToAuth = () => {
    setModalState('auth');
    setMode('login'); // Switch to login after email verification attempt
    setResendMessage('');
    setResendCooldown(0);
    clearError();
  };

  const handleModeSwitch = () => {
    const newMode = mode === 'signup' ? 'login' : 'signup';
    setMode(newMode);
    setEmail('');
    setPassword('');
    setShowPassword(false);
    clearError();
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - FIXED: Use proper color classes */}
      <div className="relative bg-slate-800/95 backdrop-blur-sm rounded-xl max-w-md w-full border border-slate-700/50 shadow-2xl">

        {/* ✅ EMAIL VERIFICATION STATE */}
        {modalState === 'check-email' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Email Verification Content */}
            <div className="p-6 space-y-6 text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">
                  Verification Email Sent
                </h3>
                <p className="text-slate-300">
                  We sent a verification link to:
                </p>
                <p className="text-blue-400 font-semibold text-lg break-all">
                  {verificationEmail}
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-slate-900/50 rounded-lg p-4 text-left space-y-2">
                <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Next Steps:
                </h4>
                <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside ml-6">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the verification link</li>
                  <li>Return here to sign in</li>
                </ol>
              </div>

              {/* Resend Section */}
              <div className="space-y-3">
                <button
                  onClick={handleResendVerification}
                  disabled={loading || resendCooldown > 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>Resend in {resendCooldown}s</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Resend Verification Email</span>
                    </>
                  )}
                </button>

                {resendMessage && (
                  <div className={`p-3 rounded-lg text-sm ${resendMessage.includes('❌')
                    ? 'bg-red-900/20 border border-red-500/30 text-red-400'
                    : 'bg-green-900/20 border border-green-500/30 text-green-400'
                    }`}>
                    {resendMessage}
                  </div>
                )}
              </div>

              {/* Back to Sign In */}
              <div className="pt-4 border-t border-slate-700/50">
                <button
                  onClick={handleBackToAuth}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          </>
        )}

        {/* ✅ MAIN AUTH STATE */}
        {modalState === 'auth' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <h2 className="text-2xl font-bold text-white">
                {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Branding */}
            <div className="px-6 pt-4 text-center">
              <h3 className="text-lg font-bold text-white">
                OLYMPIC WEIGHTLIFTING AI
              </h3>
              <p className="text-blue-400 text-sm font-semibold uppercase tracking-wide">
                AI Coaching That Adapts
              </p>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
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
                      minLength={6}
                      className="w-full px-4 py-3 pr-12 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {mode === 'signup' && (
                    <p className="text-xs text-slate-400 mt-1">
                      Minimum 6 characters
                    </p>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-400">{error}</div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
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
            <div className="px-6 pb-6 text-center border-t border-slate-700/50 pt-4">
              <p className="text-slate-400 text-sm">
                {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <button
                onClick={handleModeSwitch}
                className="text-blue-400 hover:text-blue-300 font-medium mt-1 transition-colors duration-200"
              >
                {mode === 'signup' ? 'Sign In' : 'Create Free Account'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};