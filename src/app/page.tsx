// src/app/page.tsx - Updated to redirect authenticated users automatically
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthModal';

export default function HomePage() {
  console.log('🏠 HomePage: Rendering')

  const { user, loading, isAuthenticated, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // ✅ FIXED: Auto-redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      console.log('🏠 HomePage: Authenticated user detected, redirecting to dashboard');
      window.location.href = '/dashboard';
    }
  }, [loading, isAuthenticated]);

  const handleSignIn = () => {
    console.log('🏠 HomePage: ✅ Sign In button clicked - opening modal');
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    console.log('🏠 HomePage: ✅ Sign Up button clicked - opening modal');
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    console.log('🏠 HomePage: Signing out');
    await signOut();
  };

  const closeModal = () => {
    console.log('🏠 HomePage: ✅ Closing auth modal');
    setShowAuthModal(false);
  };

  if (loading) {
    console.log('🏠 HomePage: Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // ✅ FIXED: Don't render homepage content for authenticated users (they get redirected)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl">Redirecting to dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="text-2xl font-bold text-white">
          OlyCoachAI
        </div>

        {/* ✅ SIMPLIFIED: Only show auth buttons for non-authenticated users */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSignIn}
            className="text-white/80 hover:text-white transition-colors px-4 py-2"
            data-testid="sign-in-button"
          >
            Sign In
          </button>
          <button
            onClick={handleSignUp}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            data-testid="start-trial-button"
          >
            Start Free Trial
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-4xl">
          {/* Hero Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Olympic Weightlifting
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Powered by AI
            </span>
          </h1>

          {/* Hero Description */}
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Real-time coaching that adapts to your daily performance.
            Train smarter, lift heavier, achieve your Olympic lifting goals.
          </p>

          {/* ✅ SIMPLIFIED: Only show signup CTA for non-authenticated users */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={handleSignUp}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Start Free Trial
            </button>
            <button
              onClick={handleSignIn}
              className="border-2 border-white/20 hover:border-white/40 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all hover:bg-white/5"
            >
              Sign In
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-4">Adaptive Programming</h3>
              <p className="text-blue-200 leading-relaxed">
                AI adjusts your training based on daily readiness and performance feedback
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-4">Real-Time Coaching</h3>
              <p className="text-blue-200 leading-relaxed">
                Get instant load adjustments and form cues during your workout
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-white mb-4">Proven Results</h3>
              <p className="text-blue-200 leading-relaxed">
                Based on methodologies used by Olympic champions and elite coaches
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(135deg, rgba(59,130,246,0.1) 1px, transparent 1px),
              linear-gradient(45deg, rgba(59,130,246,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px, 120px 120px',
            backgroundPosition: '0 0, 30px 30px'
          }}
        />
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={closeModal}
        initialMode={authMode}
      />
    </div>
  );
}