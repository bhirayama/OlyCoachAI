'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TouchOptimizedButton } from '@/components/TouchOptimized';

interface ResendVerificationProps {
  email: string;
}

export const ResendVerification: React.FC<ResendVerificationProps> = ({ email }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      setMessage('✅ New verification email sent! Check your inbox.');
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage('❌ Failed to send verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-navy-secondary/50 rounded-lg p-6 text-center space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">
        Email Verification Required
      </h3>
      <p className="text-text-secondary">
        Your verification link has expired. Send a new one to: <br />
        <span className="font-medium text-electric-blue">{email}</span>
      </p>

      {message && (
        <div className={`p-3 rounded-lg ${message.includes('✅')
            ? 'bg-green-900/20 border border-green-500/30 text-green-400'
            : 'bg-red-900/20 border border-red-500/30 text-red-400'
          }`}>
          {message}
        </div>
      )}

      <TouchOptimizedButton
        onClick={handleResend}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Sending...' : 'Send New Verification Email'}
      </TouchOptimizedButton>
    </div>
  );
};