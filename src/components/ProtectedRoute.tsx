// src/components/ProtectedRoute.tsx - Enhanced with Email Verification
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { EmailVerification } from '@/components/auth/EmailVerification';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  requireEmailVerification?: boolean;
}

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`border-electric-blue/30 border-t-electric-blue rounded-full animate-spin ${sizeClasses[size]}`}
      />
    </div>
  );
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/',
  requireAuth = true,
  requireEmailVerification = true
}) => {
  const { user, loading, error, isAuthenticated, requiresVerification } = useAuth();
  const [shouldRender, setShouldRender] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    console.log('🛡️ ProtectedRoute: Enhanced state check', {
      hasUser: !!user,
      isAuthenticated,
      requiresVerification,
      loading,
      requireAuth,
      requireEmailVerification,
      redirectAttempted,
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
      emailConfirmed: user?.email_confirmed_at ? 'yes' : 'no',
      // ✅ NEW: Clear route decision logging
      routeDecision: loading
        ? 'LOADING'
        : !requireAuth
          ? 'PUBLIC_ROUTE'
          : !user
            ? 'REDIRECT_TO_HOME'
            : requiresVerification && requireEmailVerification
              ? 'SHOW_EMAIL_VERIFICATION'
              : isAuthenticated
                ? 'ALLOW_ACCESS'
                : 'DEFAULT_LOADING'
    });

    // Don't do anything while loading
    if (loading) {
      setShouldRender(false);
      return;
    }

    // ✅ DECISION TREE: Clear route protection logic

    // 1. Public route - no protection needed
    if (!requireAuth) {
      console.log('🛡️ ProtectedRoute: ✅ Public route - allowing access');
      setShouldRender(true);
      setRedirectAttempted(false);
      return;
    }

    // 2. No user - redirect to login
    if (!user) {
      console.log('🛡️ ProtectedRoute: ❌ No user - redirecting to login');
      setShouldRender(false);

      if (!redirectAttempted && typeof window !== 'undefined') {
        console.log('🛡️ ProtectedRoute: 🔄 Attempting redirect to:', redirectTo);
        setRedirectAttempted(true);
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 50);
      }
      return;
    }

    // 3. User exists but needs email verification
    if (requireEmailVerification && requiresVerification) {
      console.log('🛡️ ProtectedRoute: 📧 User needs email verification');
      setShouldRender(false); // EmailVerification component will be shown instead
      setRedirectAttempted(false);
      return;
    }

    // 4. User exists and is fully authenticated
    if (isAuthenticated) {
      console.log('🛡️ ProtectedRoute: ✅ User fully authenticated - allowing access');
      setShouldRender(true);
      setRedirectAttempted(false);
      return;
    }

    // 5. Fallback - something unexpected
    console.log('🛡️ ProtectedRoute: ⚠️ Unexpected state - showing loading');
    setShouldRender(false);

  }, [user, loading, isAuthenticated, requiresVerification, redirectTo, requireAuth, requireEmailVerification, redirectAttempted]);

  // Show loading while auth initializes
  if (loading) {
    return (
      <div className="min-h-screen bg-navy-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-text-secondary">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-navy-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-navy-secondary rounded-xl p-6 text-center space-y-4">
          <h2 className="text-xl font-bold text-text-primary">
            Authentication Error
          </h2>
          <p className="text-text-secondary">{error}</p>
          <button
            onClick={() => {
              setRedirectAttempted(false);
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            className="bg-electric-blue hover:bg-electric-blue/90 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ✅ ENHANCED: Show email verification screen
  if (requireAuth && user && requireEmailVerification && requiresVerification) {
    console.log('🛡️ ProtectedRoute: 📧 Rendering email verification screen');
    return <EmailVerification />;
  }

  // Show loading while redirect is in progress
  if (requireAuth && !user && redirectAttempted) {
    return (
      <div className="min-h-screen bg-navy-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-text-secondary">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Only render content when explicitly allowed
  if (!shouldRender) {
    return (
      <div className="min-h-screen bg-navy-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-text-secondary">Verifying access...</p>
        </div>
      </div>
    );
  }

  console.log('🛡️ ProtectedRoute: ✅ Rendering protected content');
  return <>{children}</>;
};

// ✅ ENHANCED: Dashboard route wrapper with strict verification
export const DashboardProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requireEmailVerification={true}
      redirectTo="/"
    >
      {children}
    </ProtectedRoute>
  );
};

// Auth-only route wrapper (no email verification required)
export const AuthProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requireEmailVerification={false}
      redirectTo="/"
    >
      {children}
    </ProtectedRoute>
  );
};

// Public route wrapper (no protection)
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute
      requireAuth={false}
      requireEmailVerification={false}
    >
      {children}
    </ProtectedRoute>
  );
};