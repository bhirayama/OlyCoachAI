// src/components/auth/AuthModal.tsx - Enhanced with Better Error Handling & UX
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { X, Eye, EyeOff, AlertCircle, Mail, CheckCircle, Clock, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

type ModalState = 'auth' | 'check-email' | 'resend-verification';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface FormTouched {
  email: boolean;
  password: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { signUp, signIn, resendVerification, error, errorType, canRetry, loading, clearError, retryLastAction, checkNetworkStatus } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [modalState, setModalState] = useState<ModalState>('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Form validation state
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({ email: false, password: false });
  const [isFormValid, setIsFormValid] = useState(false);

  // Network status
  const [isOnline, setIsOnline] = useState(true);
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(false);

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  const validatePassword = (password: string, isSignup: boolean = false): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';

    if (isSignup) {
      if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
      if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
      if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    }

    return undefined;
  };

  // Real-time form validation
  useEffect(() => {
    const emailError = touched.email ? validateEmail(email) : undefined;
    const passwordError = touched.password ? validatePassword(password, mode === 'signup') : undefined;

    setFormErrors({
      email: emailError,
      password: passwordError
    });

    setIsFormValid(!emailError && !passwordError && email && password);
  }, [email, password, mode, touched]);

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
      setFormErrors({});
      setTouched({ email: false, password: false });
      setIsFormValid(false);
      clearError();
    }
  }, [isOpen, initialMode, clearError]);

  // Check network status
  useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

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

  // Handle form field blur for validation
  const handleBlur = (field: keyof FormTouched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Handle input changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (formErrors.email && e.target.value) {
      setFormErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Clear error when user starts typing
    if (formErrors.password && e.target.value) {
      setFormErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 AuthModal: Form submitted', { mode, email, isFormValid });

    // Mark all fields as touched for validation
    setTouched({ email: true, password: true });

    // Final validation check
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password, mode === 'signup');

    if (emailError || passwordError) {
      setFormErrors({ email: emailError, password: passwordError });
      return;
    }

    clearError();

    if (mode === 'signup') {
      const result = await signUp(email, password);
      console.log('🔐 AuthModal: Signup result', result);

      if (result.success && result.error === 'CHECK_EMAIL') {
        setVerificationEmail(email);
        setModalState('check-email');
      } else if (result.success) {
        onClose();
        window.location.href = '/dashboard';
      }
    } else {
      const result = await signIn(email, password);
      console.log('🔐 AuthModal: Signin result', result);

      if (result.success) {
        onClose();
        window.location.href = '/dashboard';
      }
    }
  };

  const handleRetry = async () => {
    console.log('🔄 AuthModal: Retrying authentication');
    setFormErrors({});
    clearError();

    const result = await retryLastAction(mode, email, password);

    if (result.success && mode === 'signup' && result.error === 'CHECK_EMAIL') {
      setVerificationEmail(email);
      setModalState('check-email');
    } else if (result.success) {
      onClose();
      window.location.href = '/dashboard';
    }
  };

  const handleNetworkCheck = async () => {
    console.log('🌐 AuthModal: Checking network status');
    setIsCheckingNetwork(true);

    try {
      const networkStatus = await checkNetworkStatus();
      setIsOnline(networkStatus);

      if (networkStatus) {
        // Network is back, clear network-related errors
        if (errorType === 'network') {
          clearError();
        }
      }
    } catch (err) {
      console.error('Network check failed:', err);
    } finally {
      setIsCheckingNetwork(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;

    console.log('📧 AuthModal: Resending verification email');
    setResendMessage('');

    const result = await resendVerification();

    if (result.success) {
      setResendMessage('✅ New verification email sent! Check your inbox.');
      setResendCooldown(60);
    } else {
      setResendMessage(`❌ Failed to resend: ${result.error}`);
    }
  };

  const handleBackToAuth = () => {
    setModalState('auth');
    setMode('login');
    setResendMessage('');
    setResendCooldown(0);
    setFormErrors({});
    setTouched({ email: false, password: false });
    clearError();
  };

  const handleModeSwitch = () => {
    const newMode = mode === 'signup' ? 'login' : 'signup';
    setMode(newMode);
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setFormErrors({});
    setTouched({ email: false, password: false });
    setIsFormValid(false);
    clearError();
  };

  // Error display component with enhanced styling
  const ErrorDisplay: React.FC<{ error: string; errorType: string | null; canRetry: boolean }> = ({
    error,
    errorType,
    canRetry
  }) => {
    const getErrorStyle = () => {
      switch (errorType) {
        case 'network':
          return 'bg-orange-900/20 border-orange-500/30 text-orange-400';
        case 'rate_limit':
          return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400';
        case 'validation':
          return 'bg-blue-900/20 border-blue-500/30 text-blue-400';
        case 'auth':
          return 'bg-red-900/20 border-red-500/30 text-red-400';
        default:
          return 'bg-red-900/20 border-red-500/30 text-red-400';
      }
    };

    const getErrorIcon = () => {
      switch (errorType) {
        case 'network':
          return <WifiOff className="w-5 h-5 flex-shrink-0 mt-0.5" />;
        case 'rate_limit':
          return <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />;
        default:
          return <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />;
      }
    };

    return (
      <div className={`rounded-lg p-4 flex items-start space-x-3 ${getErrorStyle()}`}>
        {getErrorIcon()}
        <div className="flex-1">
          <div className="text-sm font-medium">{error}</div>
          {canRetry && (
            <div className="mt-2 flex gap-2">
              {errorType === 'network' ? (
                <>
                  <button
                    onClick={handleNetworkCheck}
                    disabled={isCheckingNetwork}
                    className="text-xs bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-3 py-1 rounded transition-colors flex items-center gap-1"
                  >
                    {isCheckingNetwork ? (
                      <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Wifi className="w-3 h-3" />
                    )}
                    {isCheckingNetwork ? 'Checking...' : 'Check Connection'}
                  </button>
                  {isOnline && (
                    <button
                      onClick={handleRetry}
                      disabled={loading}
                      className="text-xs bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-3 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Try Again
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleRetry}
                  disabled={loading}
                  className="text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1 rounded transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Try Again
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
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

      {/* Modal */}
      <div className="relative bg-slate-800/95 backdrop-blur-sm rounded-xl max-w-md w-full border border-slate-700/50 shadow-2xl">

        {/* Network Status Indicator */}
        {!isOnline && (
          <div className="bg-orange-600 text-white px-4 py-2 text-sm text-center rounded-t-xl">
            <WifiOff className="w-4 h-4 inline mr-2" />
            No internet connection
          </div>
        )}

        {/* EMAIL VERIFICATION STATE */}
        {modalState === 'check-email' && (
          <>
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

            <div className="p-6 space-y-6 text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>

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

        {/* MAIN AUTH STATE */}
        {modalState === 'auth' && (
          <>
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

            <div className="px-6 pt-4 text-center">
              <h3 className="text-lg font-bold text-white">
                OLYMPIC WEIGHTLIFTING AI
              </h3>
              <p className="text-blue-400 text-sm font-semibold uppercase tracking-wide">
                AI Coaching That Adapts
              </p>
            </div>

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
                    onChange={handleEmailChange}
                    onBlur={() => handleBlur('email')}
                    required
                    autoComplete="email"
                    className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${formErrors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-600 focus:ring-blue-500'
                      }`}
                    placeholder="your@email.com"
                  />
                  {formErrors.email && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.email}
                    </p>
                  )}
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
                      onChange={handlePasswordChange}
                      onBlur={() => handleBlur('password')}
                      required
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      minLength={6}
                      className={`w-full px-4 py-3 pr-12 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${formErrors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-600 focus:ring-blue-500'
                        }`}
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
                  {formErrors.password && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.password}
                    </p>
                  )}
                  {mode === 'signup' && !formErrors.password && password && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-slate-400">Password requirements:</p>
                      <div className="text-xs text-slate-500 space-y-0.5">
                        <div className={`flex items-center gap-1 ${password.length >= 6 ? 'text-green-400' : ''}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 6 ? 'bg-green-400' : 'bg-slate-500'}`} />
                          At least 6 characters
                        </div>
                        <div className={`flex items-center gap-1 ${/(?=.*[a-z])/.test(password) ? 'text-green-400' : ''}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${/(?=.*[a-z])/.test(password) ? 'bg-green-400' : 'bg-slate-500'}`} />
                          Lowercase letter
                        </div>
                        <div className={`flex items-center gap-1 ${/(?=.*[A-Z])/.test(password) ? 'text-green-400' : ''}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${/(?=.*[A-Z])/.test(password) ? 'bg-green-400' : 'bg-slate-500'}`} />
                          Uppercase letter
                        </div>
                        <div className={`flex items-center gap-1 ${/(?=.*\d)/.test(password) ? 'text-green-400' : ''}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${/(?=.*\d)/.test(password) ? 'bg-green-400' : 'bg-slate-500'}`} />
                          Number
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Forgot Password Link */}
              {mode === 'login' && (
                <div className="text-right">
                  <Link
                    href="/auth/forgot-password"
                    onClick={() => onClose()}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Enhanced Error Display */}
              {error && (
                <ErrorDisplay
                  error={error}
                  errorType={errorType}
                  canRetry={canRetry}
                />
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isFormValid || !isOnline}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>
                      {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                    </span>
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
                disabled={loading}
                className="text-blue-400 hover:text-blue-300 disabled:opacity-50 font-medium mt-1 transition-colors duration-200"
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