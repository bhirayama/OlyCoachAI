// src/components/auth/EmailVerification.tsx
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const EmailVerification: React.FC = () => {
  const { user, resendVerification, signOut } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage('');

    const result = await resendVerification();

    if (result.success) {
      setResendMessage('Verification email sent! Check your inbox.');
    } else {
      setResendMessage(`Failed to resend: ${result.error}`);
    }

    setIsResending(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-navy-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-navy-secondary/50 backdrop-blur-sm rounded-xl p-8 text-center space-y-6">

        {/* Header */}
        <div className="space-y-2">
          <div className="w-16 h-16 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Check Your Email</h1>
          <p className="text-text-secondary">
            We sent a verification link to:
          </p>
          <p className="text-electric-blue font-semibold">
            {user?.email}
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-4 text-left">
          <div className="bg-navy-primary/30 rounded-lg p-4 space-y-2">
            <h3 className="text-text-primary font-semibold">Next Steps:</h3>
            <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the verification link</li>
              <li>Return here to access your dashboard</li>
            </ol>
          </div>
        </div>

        {/* Resend Section */}
        <div className="space-y-3">
          <button
            onClick={handleResend}
            disabled={isResending}
            className="w-full bg-electric-blue hover:bg-electric-blue/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </button>

          {resendMessage && (
            <p className={`text-sm ${resendMessage.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
              {resendMessage}
            </p>
          )}
        </div>

        {/* Sign Out Option */}
        <div className="pt-4 border-t border-navy-primary/30">
          <p className="text-sm text-text-disabled mb-3">
            Wrong email address?
          </p>
          <button
            onClick={handleSignOut}
            className="text-electric-blue hover:text-electric-blue/80 text-sm font-medium transition-colors duration-200"
          >
            Sign out and try again
          </button>
        </div>

      </div>
    </div>
  );
};