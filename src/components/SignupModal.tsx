// components/SignupModal.tsx
'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { PasswordValidationDisplay } from '@/components/auth/PasswordValidationDisplay';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Zod schema for validation
const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;
type ModalState = 'form' | 'loading' | 'success';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin
}) => {
  const [modalState, setModalState] = useState<ModalState>('form');
  const [userEmail, setUserEmail] = useState<string>('');
  const { signUp, error, clearError } = useAuth();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange'
  });

  const { register, handleSubmit, watch, formState: { errors, isValid }, reset } = form;
  const watchedPassword = watch('password') || '';

  const handleSignup = async (data: SignupFormData) => {
    try {
      setModalState('loading');
      clearError();

      await signUp(data.email, data.password);

      // If we get here, signup was successful
      setUserEmail(data.email);
      setModalState('success');
    } catch (error) {
      setModalState('form');
      console.error('Signup error:', error);
    }
  };

  const handleClose = () => {
    if (modalState !== 'loading') {
      setModalState('form');
      setUserEmail('');
      reset();
      clearError();
      onClose();
    }
  };

  const handleBackToForm = () => {
    setModalState('form');
    setUserEmail('');
    reset();
    clearError();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={modalState !== 'loading' ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {modalState === 'success' && (
                <button
                  onClick={handleBackToForm}
                  className="p-1 text-white/80 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-xl font-bold text-white">
                {modalState === 'success' ? 'Welcome to OlyCoachAI' :
                  modalState === 'loading' ? 'Creating Account...' : 'Create Your Account'}
              </h2>
            </div>
            {modalState !== 'loading' && (
              <button
                onClick={handleClose}
                className="p-1 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {modalState === 'success' && <SuccessScreen email={userEmail} />}
          {modalState === 'loading' && <LoadingScreen />}
          {modalState === 'form' && (
            <SignupForm
              onSubmit={handleSignup}
              onSwitchToLogin={onSwitchToLogin}
              form={form}
              watchedPassword={watchedPassword}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Success Screen Component
const SuccessScreen: React.FC<{ email: string }> = ({ email }) => (
  <div className="text-center space-y-6">
    <div className="flex justify-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
    </div>

    <div className="space-y-2">
      <h3 className="text-2xl font-bold text-gray-900">Check Your Email</h3>
      <p className="text-gray-600">
        We've sent a confirmation link to:
      </p>
      <p className="font-semibold text-blue-600 break-all">
        {email}
      </p>
    </div>

    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
      <div className="flex items-start space-x-3">
        <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800 text-left">
          <p className="font-medium mb-2">Next Steps:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Check your email inbox (and spam folder)</li>
            <li>Click the confirmation link</li>
            <li>Complete your Olympic lifting profile</li>
            <li>Start your personalized training program!</li>
          </ol>
        </div>
      </div>
    </div>

    <p className="text-sm text-gray-500">
      Didn't receive the email? Check your spam folder or contact support.
    </p>
  </div>
);

// Loading Screen Component
const LoadingScreen: React.FC = () => (
  <div className="text-center space-y-6 py-8">
    <LoadingSpinner size="lg" />
    <div className="space-y-2">
      <h3 className="text-xl font-semibold text-gray-900">Creating Your Account</h3>
      <p className="text-gray-600">
        Setting up your Olympic weightlifting journey...
      </p>
    </div>
  </div>
);

// Signup Form Component
interface SignupFormProps {
  onSubmit: (data: SignupFormData) => void;
  onSwitchToLogin: () => void;
  form: any;
  watchedPassword: string;
  error: string | null;
}

const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit,
  onSwitchToLogin,
  form,
  watchedPassword,
  error
}) => {
  const { register, handleSubmit, formState: { errors, isValid } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          {...register('email')}
          type="email"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
          placeholder="your@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          {...register('password')}
          type="password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
          placeholder="Create a strong password"
        />

        {/* Real-time Password Validation */}
        <PasswordValidationDisplay password={watchedPassword} />

        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <input
          {...register('confirmPassword')}
          type="password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
          placeholder="Confirm your password"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isValid}
        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Create Account
      </button>

      {/* Switch to Login */}
      <div className="text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in here
          </button>
        </p>
      </div>
    </form>
  );
};