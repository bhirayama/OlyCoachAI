// src/components/auth/EmailVerification.tsx - Dashboard Protection Screen
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Mail, RefreshCw, LogOut, CheckCircle, AlertCircle } from 'lucide-react';

export const EmailVerification: React.FC = () => {
  const { user, resendVerification, signOut, checkVerificationStatus } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  // Auto-check verification status periodically
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      console.log('📧 EmailVerification: Auto-checking verification status');

      const result = await checkVerificationStatus();
      if (result.success && !result.error) {
        console.log('✅ EmailVerification: Email verified! Redirecting...');
        window.location.href = '/dashboard';
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkInterval);
  }, [checkVerificationStatus]);

  const handleResend = async () => {
    console.log('📧 EmailVerification: Resending verification email');
    setIsResending(true);
    setMessage('');

    const result = await resendVerification();

    if (result.success) {
      setMessage('✅ New verification email sent! Check your inbox and spam folder.');
      setMessageType('success');
    } else {
      setMessage(`❌ Failed to resend email: ${result.error}`);
      setMessageType('error');
    }

    setIsResending(false);
  };

  const handleManualCheck = async () => {
    console.log('🔍 EmailVerification: Manual verification check');
    setIsChecking(true);
    setMessage('');

    const result = await checkVerificationStatus();

    if (result.success && !result.error) {
      setMessage('🎉 Email verified! Redirecting to dashboard...');
      setMessageType('success');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } else {
      setMessage('📧 Email verification still pending. Please check your email.');
      setMessageType('info');
    }

    setIsChecking(false);
  };

  const handleSignOut = async () => {
    console.log('🔐 EmailVerification: Signing out');
    await signOut();
  };

  return (
    <div className="min-h-screen bg-navy-primary flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-navy-secondary/50 backdrop-blur-sm rounded-xl p-8 text-center space-y-8">

        {/* Header */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-10 h-10 text-electric-blue" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Email Verification Required
            </h1>
            <p className="text-text-secondary">
              Before accessing your dashboard, please verify your email address.
            </p>
          </div>
        </div>

        {/* Email Display */}
        <div className="bg-navy-primary/30 rounded-lg p-4 space-y-2">
          <p className="text-text-secondary text-sm">Verification email sent to:</p>
          <p className="text-electric-blue font-semibold text-lg">
            {user?.email}
          </p>
        </div>

        {/* Instructions */}
        <div className="text-left">
          <div className="bg-navy-primary/30 rounded-lg p-6 space-y-4">
            <h3 className="text-text-primary font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-teal-accent" />
              Verification Steps
            </h3>
            <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
              <li>Check your email inbox (including spam/junk folder)</li>
              <li>Look for an email from "Olympic Weightlifting AI"</li>
              <li>Click the "Verify Email" link in the email</li>
              <li>Return here - you'll be automatically redirected</li>
            </ol>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`rounded-lg p-4 flex items-start gap-3 ${messageType === 'success'
            ? 'bg-green-900/20 border border-green-500/30 text-green-400'
            : messageType === 'error'
              ? 'bg-red-900/20 border border-red-500/30 text-red-400'
              : 'bg-blue-900/20 border border-blue-500/30 text-blue-400'
            }`}>
            {messageType === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm">{message}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Manual Check Button */}
          <button
            onClick={handleManualCheck}
            disabled={isChecking}
            className="w-full bg-electric-blue hover:bg-electric-blue/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isChecking ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>I've Verified My Email</span>
              </>
            )}
          </button>

          {/* Resend Button */}
          <button
            onClick={handleResend}
            disabled={isResending}
            className="w-full bg-navy-primary hover:bg-navy-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary hover:text-text-primary border border-navy-primary hover:border-text-disabled font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isResending ? (
              <>
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>Resend Verification Email</span>
              </>
            )}
          </button>
        </div>

        {/* Help Section */}
        <div className="space-y-4 pt-6 border-t border-navy-primary/30">
          <div className="text-sm text-text-disabled space-y-2">
            <p><strong>Can't find the email?</strong></p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>Check your spam/junk folder</li>
              <li>Make sure you entered the correct email</li>
              <li>Wait a few minutes and try resending</li>
            </ul>
          </div>

          {/* Sign Out Option */}
          <div className="pt-4">
            <p className="text-sm text-text-disabled mb-3">
              Wrong email address or need to start over?
            </p>
            <button
              onClick={handleSignOut}
              className="text-electric-blue hover:text-electric-blue/80 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
            >
              <LogOut className="w-4 h-4" />
              Sign Out and Try Again
            </button>
          </div>
        </div>

        {/* Auto-check Notice */}
        <div className="bg-navy-primary/20 rounded-lg p-3">
          <p className="text-xs text-text-disabled">
            💡 This page automatically checks for verification every 10 seconds
          </p>
        </div>

      </div>
    </div>
  );
};