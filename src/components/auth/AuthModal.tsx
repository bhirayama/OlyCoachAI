"use client";

import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp, error, clearError } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setFormData({ email: '', password: '', firstName: '', lastName: '' });
      setFormErrors({});
      setShowPassword(false);
      clearError();
    }
  }, [isOpen, initialMode, clearError]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (mode === 'signup') {
      if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        errors.lastName = 'Last name is required';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let result;

      if (mode === 'login') {
        result = await signIn(formData.email, formData.password);

        if (result.success) {
          console.log('🔐 Auth Debug: Login successful, redirecting');
          onClose();
          // Simple redirect to dashboard
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 100);
        } else {
          setFormErrors({ submit: result.error || 'Login failed' });
        }
      } else {
        result = await signUp(formData.email, formData.password);

        if (result.success) {
          if (result.error) {
            // Email confirmation required
            setFormErrors({ submit: result.error });
          } else {
            console.log('🔐 Auth Debug: Signup successful, redirecting');
            onClose();
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 100);
          }
        } else {
          setFormErrors({ submit: result.error || 'Signup failed' });
        }
      }
    } catch (err) {
      console.error('🔐 Auth Debug: Form submission error', err);
      setFormErrors({
        submit: err instanceof Error ? err.message : 'An unexpected error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setFormErrors({});
    setFormData(prev => ({ ...prev, firstName: '', lastName: '' }));
    clearError();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="auth-modal"
    >
      <div className="w-full max-w-md bg-navy-secondary rounded-xl shadow-2xl transform transition-all">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-navy-primary/20">
          <h2 className="text-xl font-bold text-text-primary">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-text-disabled hover:text-text-primary transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Error Display */}
          {(error || formErrors.submit) && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error">{error || formErrors.submit}</p>
            </div>
          )}

          {/* Name fields for signup */}
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-disabled" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-navy-primary border border-navy-primary/50 rounded-lg text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                {formErrors.firstName && (
                  <p className="text-xs text-error mt-1">{formErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-disabled" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-navy-primary border border-navy-primary/50 rounded-lg text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
                {formErrors.lastName && (
                  <p className="text-xs text-error mt-1">{formErrors.lastName}</p>
                )}
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-disabled" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-navy-primary border border-navy-primary/50 rounded-lg text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent"
                placeholder="john@example.com"
                data-testid="email-input"
              />
            </div>
            {formErrors.email && (
              <p className="text-xs text-error mt-1">{formErrors.email}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-disabled" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-12 py-2 bg-navy-primary border border-navy-primary/50 rounded-lg text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent"
                placeholder="••••••••"
                data-testid="password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-disabled hover:text-text-primary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formErrors.password && (
              <p className="text-xs text-error mt-1">{formErrors.password}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-electric hover:bg-electric/90 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            data-testid="submit-button"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>

          {/* Mode switch */}
          <div className="text-center">
            <p className="text-sm text-text-disabled">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={switchMode}
                className="text-electric hover:text-electric/80 font-medium"
                data-testid="switch-mode-button"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};