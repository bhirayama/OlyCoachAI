"use client";

import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { circuitBreaker } from '@/utils/redirectCircuitBreaker';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
  className?: string;
}> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
  className = ''
}) => {
    const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-electric-blue";
    const variantClasses = {
      primary: "bg-electric-blue text-white hover:bg-electric-blue/90 disabled:opacity-50",
      ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/10"
    };

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

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

  const { signIn, loading } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setFormData({ email: '', password: '', firstName: '', lastName: '' });
      setFormErrors({});
      setShowPassword(false);
    }
  }, [isOpen, initialMode]);

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
      if (mode === 'login') {
        const result = await signIn(formData.email, formData.password);

        if (result.success) {
          console.log('✅ Login successful in modal');
          onClose();

          // Use circuit breaker for login redirect
          const currentPath = window.location.pathname;
          if (currentPath === '/' || currentPath.startsWith('/auth')) {
            if (circuitBreaker.logRedirect('/dashboard', 'AuthModal-login')) {
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 100);
            }
          }

        } else {
          setFormErrors({ submit: result.error || 'Sign in failed' });
        }
      } else {
        console.log('✅ Signup flow initiated');
        onClose();

        if (circuitBreaker.logRedirect('/onboarding', 'AuthModal-signup')) {
          window.location.href = '/onboarding';
        }
      }
    } catch (error) {
      console.error('❌ Auth error:', error);
      setFormErrors({
        submit: error instanceof Error ? error.message : 'An unexpected error occurred'
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
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="auth-modal"
    >
      <div className="w-full max-w-md bg-navy-secondary rounded-xl shadow-2xl transform transition-all">

        <div className="flex items-center justify-between p-6 border-b border-navy-primary/20">
          <h2 className="text-xl font-bold text-text-primary">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-text-disabled hover:text-text-primary transition-colors"
            aria-label="Close modal"
            data-testid="close-modal-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

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
                    className="w-full pl-10 pr-4 py-2 bg-navy-primary border border-navy-primary/50 rounded-lg text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                {formErrors.firstName && (
                  <p className="text-xs text-status-error mt-1">{formErrors.firstName}</p>
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
                    className="w-full pl-10 pr-4 py-2 bg-navy-primary border border-navy-primary/50 rounded-lg text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
                {formErrors.lastName && (
                  <p className="text-xs text-status-error mt-1">{formErrors.lastName}</p>
                )}
              </div>
            </div>
          )}

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
                className="w-full pl-10 pr-4 py-2 bg-navy-primary border border-navy-primary/50 rounded-lg text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                placeholder="john@example.com"
                data-testid="email-input"
              />
            </div>
            {formErrors.email && (
              <p className="text-xs text-status-error mt-1">{formErrors.email}</p>
            )}
          </div>

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
                className="w-full pl-10 pr-12 py-2 bg-navy-primary border border-navy-primary/50 rounded-lg text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
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
              <p className="text-xs text-status-error mt-1">{formErrors.password}</p>
            )}
          </div>

          {formErrors.submit && (
            <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-lg">
              <p className="text-sm text-status-error">{formErrors.submit}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full bg-electric-blue hover:bg-electric-blue/90"
            data-testid="submit-button"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-text-disabled">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={switchMode}
                className="text-electric-blue hover:text-electric-blue/80 font-medium"
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