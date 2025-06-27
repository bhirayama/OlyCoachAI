"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { circuitBreaker } from '@/utils/redirectCircuitBreaker';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
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
  requireAuth = true
}) => {
  const { user, loading, initialized, error } = useAuth();
  const [shouldRender, setShouldRender] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    console.log('🛡️ ProtectedRoute: State check', {
      initialized,
      hasUser: !!user,
      loading,
      requireAuth,
      shouldRender,
      redirectAttempted,
      currentPath: window.location.pathname
    });

    // Don't do anything until auth is initialized
    if (!initialized) {
      console.log('🛡️ ProtectedRoute: Waiting for auth initialization');
      setShouldRender(false);
      return;
    }

    // Auth is initialized, make decisions
    if (requireAuth && !user) {
      console.log('🛡️ ProtectedRoute: Auth required but no user found');
      setShouldRender(false);

      if (!redirectAttempted) {
        console.log('🛡️ ProtectedRoute: Attempting redirect to:', redirectTo);

        // Use circuit breaker
        if (circuitBreaker.logRedirect(redirectTo, 'ProtectedRoute')) {
          setRedirectAttempted(true);

          // Use window.location instead of router to force navigation
          setTimeout(() => {
            window.location.href = redirectTo;
          }, 50);
        } else {
          // Circuit breaker blocked redirect - show error state
          setShouldRender(false);
        }
      }
    } else if (requireAuth && user) {
      console.log('🛡️ ProtectedRoute: User authenticated, rendering content');
      setShouldRender(true);
      setRedirectAttempted(false); // Reset for future use
    } else if (!requireAuth) {
      console.log('🛡️ ProtectedRoute: Public route, rendering content');
      setShouldRender(true);
    }
  }, [user, initialized, loading, redirectTo, requireAuth, redirectAttempted]);

  // Show loading while auth initializes
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-navy-primary flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-text-secondary">
            {!initialized ? 'Initializing authentication...' : 'Loading...'}
          </p>
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
              circuitBreaker.reset();
              setRedirectAttempted(false);
              window.location.reload();
            }}
            className="bg-electric-blue text-white px-4 py-2 rounded hover:bg-electric-blue/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
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