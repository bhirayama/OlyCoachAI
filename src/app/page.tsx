'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthModal';
import { PublicRoute } from '@/components/ProtectedRoute';

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { user, isAuthenticated, signOut } = useAuth();

  const handleSignIn = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    console.log('🔐 Auth Debug: Homepage sign out');
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="text-2xl font-bold text-white">
          OlyCoachAI
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-white/80">Welcome, {user?.email}</span>
              <button
                onClick={handleSignOut}
                className="text-white/80 hover:text-white transition-colors"
              >
                Sign Out
              </button>

              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
              Dashboard
            </a>
        </>
        ) : (
        <>
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
        </>
          )}
    </div>
      </header >

    <main className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="text-center max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6"
        >
          Olympic Weightlifting
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Powered by AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
        >
          Real-time coaching that adapts to your daily performance.
          Train smarter, lift heavier, achieve your Olympic lifting goals.
        </motion.p>

        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={handleSignUp}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105"
            >
              Start Free Trial
            </button>
            <button
              onClick={handleSignIn}
              className="border-2 border-white/20 hover:border-white/40 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all"
            >
              Sign In
            </button>
          </motion.div>
        )}

        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >

            href="/dashboard"
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105"
              >
            Go to Dashboard
          </a>
              
                href="/onboarding"
        className="border-2 border-white/20 hover:border-white/40 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all"
              >
        Complete Setup
      </a>
    </motion.div>
          )
}
        </div >
      </main >

  <AuthModal
    isOpen={showAuthModal}
    onClose={() => setShowAuthModal(false)}
    initialMode={authMode}
  />
    </div >
  );
}