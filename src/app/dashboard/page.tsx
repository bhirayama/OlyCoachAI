'use client';

import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

const DashboardContent: React.FC = () => {
  const { user, session } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-navy-secondary rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Welcome to Your Dashboard
          </h1>
          <div className="text-text-secondary space-y-2">
            <p>Email: {user?.email}</p>
            <p>User ID: {user?.id}</p>
            <p>Last Sign In: {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-navy-secondary rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Current Program
            </h3>
            <p className="text-text-secondary">
              No active program yet. Complete onboarding to get started.
            </p>
          </div>

          <div className="bg-navy-secondary rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Recent Sessions
            </h3>
            <p className="text-text-secondary">
              No training sessions logged yet.
            </p>
          </div>

          <div className="bg-navy-secondary rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Progress
            </h3>
            <p className="text-text-secondary">
              Complete your first session to see progress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user, loading, initialized } = useAuth();

  useEffect(() => {
    console.log('📊 Dashboard Page: Mounted with auth state', {
      hasUser: !!user,
      loading,
      initialized,
      userId: user?.id,
      currentURL: window.location.href
    });

    const handleRouteChange = () => {
      console.log('📊 Dashboard Page: Route changed to', window.location.href);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [user, loading, initialized]);

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-navy-primary">
        <Header variant="dashboard" />
        <main>
          <DashboardContent />
        </main>
      </div>
    </ProtectedRoute>
  );
}