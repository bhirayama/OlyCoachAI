// app/dashboard/DashboardClient.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export const DashboardClient: React.FC = () => {
  const { user, loading, isAuthenticated, redirectToHome } = useAuth();

  // SIMPLE route protection
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('🔒 Not authenticated, redirecting to home');
      redirectToHome();
    }
  }, [loading, isAuthenticated, redirectToHome]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>

      <div className="bg-navy-secondary rounded-lg p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Welcome back, {user?.email}
        </h2>
        <p className="text-text-secondary">
          Your training dashboard content here...
        </p>
      </div>
    </div>
  );
};