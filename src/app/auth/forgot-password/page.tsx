'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    if (!validateEmail(email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }

    console.log('🔐 ForgotPassword: Requesting reset for:', email);
    setIsLoading(true);
    setMessage('');
    setMessageType(null);

    const result = await requestPasswordReset(email);

    if (result.success) {
      console.log('✅ ForgotPassword: Reset email sent successfully');
      setMessage('Password reset email sent! Check your inbox and spam folder.');
      setMessageType('success');
      setEmailSent(true);
    } else {
      console.error('❌ ForgotPassword: Reset failed:', result.error);
      setMessage(result.error || 'Failed to send reset email. Please try again.');
      setMessageType('error');
    }

    setIsLoading(false);
  };

  const handleTryAgain = () => {
    setEmailSent(false);
    setMessage('');
    setMessageType(null);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-navy-primary flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-navy-secondary/50 backdrop-blur-sm rounded-xl p-8 space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-10 h-10 text-electric-blue" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Reset Your Password
            </h1>
            <p className="text-text-secondary">
              {emailSent
                ? 'We\'ve sent you a password reset link'
                : 'Enter your email address and we\'ll send you a link to reset your password'
              }
            </p>
          </div>
        </div>

        {/* Success State - Email Sent */}
        {emailSent ? (
          <div className="space-y-6">
            {/* Email Display */}
            <div className="bg-navy-primary/30 rounded-lg p-4 space-y-2">
              <p className="text-text-secondary text-sm">Reset link sent to:</p>
              <p className="text-electric-blue font-semibold text-lg break-all">
                {email}
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-navy-primary/30 rounded-lg p-6 space-y-4">
              <h3 className="text-text-primary font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-accent" />
                Next Steps
              </h3>
              <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
                <li>Check your email inbox (including spam/junk folder)</li>
                <li>Look for an email from "Olympic Weightlifting AI"</li>
                <li>Click the "Reset Password" link in the email</li>
                <li>Enter your new password</li>
              </ol>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={handleTryAgain}
                className="w-full bg-navy-primary hover:bg-navy-primary/80 text-text-secondary hover:text-text-primary border border-navy-primary hover:border-text-disabled font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send to Different Email
              </button>

              <Link
                href="/"
                className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          /* Request Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                className="w-full px-4 py-3 bg-navy-primary/50 border border-navy-primary rounded-lg text-text-primary placeholder-text-disabled focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-colors"
                placeholder="your@email.com"
              />
            </div>

            {/* Status Message */}
            {message && (
              <div className={`rounded-lg p-4 flex items-start gap-3 ${messageType === 'success'
                  ? 'bg-green-900/20 border border-green-500/30 text-green-400'
                  : 'bg-red-900/20 border border-red-500/30 text-red-400'
                }`}>
                {messageType === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm">{message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-electric-blue hover:bg-electric-blue/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>

            {/* Back to Sign In */}
            <div className="text-center pt-4 border-t border-navy-primary/30">
              <p className="text-text-secondary text-sm mb-3">
                Remember your password?
              </p>
              <Link
                href="/"
                className="text-electric-blue hover:text-electric-blue/80 font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}

        {/* Help Section */}
        <div className="bg-navy-primary/20 rounded-lg p-4 space-y-2">
          <h4 className="text-text-primary font-semibold text-sm">
            Need Help?
          </h4>
          <div className="text-xs text-text-disabled space-y-1">
            <p>• Make sure you enter the email address associated with your account</p>
            <p>• Check your spam/junk folder if you don't see the email</p>
            <p>• Reset links expire after 24 hours for security</p>
          </div>
        </div>

      </div>
    </div>
  );
}