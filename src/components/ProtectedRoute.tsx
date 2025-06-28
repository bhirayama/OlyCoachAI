// src/components/ProtectedRoute.tsx
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
    console.log('🛡️ ProtectedRoute: State check', {
      hasUser: !!user,
      isAuthenticated,
      requiresVerification,
      loading,
      requireAuth,
      requireEmailVerification,
      redirectAttempted,
      currentPath: window.location.pathname,
      emailConfirmed: user?.email_confirmed_at ? 'yes' : 'no'
    });

    // Don't do anything while loading
    if (loading) {
      setShouldRender(false);
      return;
    }

    // Auth is loaded, make decisions
    if (requireAuth && !user) {
      console.log('🛡️ ProtectedRoute: Auth required but no user found');
      setShouldRender(false);

      if (!redirectAttempted) {
        console.log('🛡️ ProtectedRoute: Attempting redirect to:', redirectTo);
        setRedirectAttempted(true);

        // Simple redirect - no circuit breaker
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 50);
      }
    } else if (requireAuth && user && requireEmailVerification && requiresVerification) {
      console.log('🛡️ ProtectedRoute: User exists but email verification required');
      // Don't redirect, but don't render children either - EmailVerification will be shown
      setShouldRender(false);
      setRedirectAttempted(false);
    } else if (requireAuth && isAuthenticated) {
      console.log('🛡️ ProtectedRoute: User fully authenticated and verified, rendering content');
      setShouldRender(true);
      setRedirectAttempted(false);
    } else if (!requireAuth) {
      console.log('🛡️ ProtectedRoute: Public route, rendering content');
      setShouldRender(true);
    }
  }, [user, loading, isAuthenticated, requiresVerification, redirectTo, requireAuth, requireEmailVerification, redirectAttempted]);

  // Show loading while auth initializes
  if (loading) {
    return (
      <div className="min-h-screen bg-navy-primary flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-navy-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-navy-secondary rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Authentication Error
          </h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={() => {
              setRedirectAttempted(false);
              window.location.reload();
            }}
            className="bg-electric-blue hover:bg-electric-blue/90 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show email verification if user exists but email not verified
  if (requireAuth && user && requireEmailVerification && requiresVerification) {
    console.log('🛡️ ProtectedRoute: 📧 Showing email verification screen');
    return <EmailVerification />;
  }

  // Show loading if redirect is in progress
  if (requireAuth && !user && redirectAttempted) {
    return (
      <div className="min-h-screen bg-navy-primary flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-text-secondary">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Only render content when explicitly allowed
  if (!shouldRender) {
    return (
      <div className="min-h-screen bg-navy-primary flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  console.log('🛡️ ProtectedRoute: ✅ Rendering protected content');
  return <>{children}</>;
};

// Convenience wrapper for dashboard routes that require full verification
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

// Convenience wrapper for routes that only require auth (no email verification)
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