'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function OnboardingPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-primary flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-text-secondary">Loading onboarding...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to home if not authenticated
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-primary to-navy-secondary">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-8">
            Welcome to Olympic Weightlifting AI
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Let&apos;s set up your personalized training program
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