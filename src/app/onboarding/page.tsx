'use client';

import React from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { PageLoadingSpinner } from '@/components/LoadingSpinner';

export default function OnboardingPage() {
  const { user, loading } = useRequireAuth();

  if (loading) {
    return <PageLoadingSpinner text="Loading onboarding..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-primary to-navy-secondary">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-8">
            Welcome to Olympic Weightlifting AI
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Let's set up your personalized training program
          </p>
          <div className="bg-white rounded-xl p-8">
            <p className="text-gray-600">
              Onboarding flow will be implemented here.
              <br />
              User: {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}