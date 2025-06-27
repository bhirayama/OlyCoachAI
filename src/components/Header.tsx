"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth'; // Updated import
import { AuthModal } from '@/components/AuthModal';
import { Menu, X, User, LogOut } from 'lucide-react';

interface HeaderProps {
  variant?: 'homepage' | 'dashboard' | 'app';
}

export const Header: React.FC<HeaderProps> = ({ variant = 'homepage' }) => {
  const { user, loading, signOut, isAuthenticated } = useAuth(); // Updated usage
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const result = await signOut();
      if (!result.success) {
        console.error('Sign out failed:', result.error);
      }
    } finally {
      setIsSigningOut(false);
    }
  };

  const openSignInModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const openSignUpModal = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  // Rest of your Header component...
  return (
    <>
      <header className="sticky top-0 z-50 bg-navy-primary/95 backdrop-blur-sm border-b border-navy-secondary/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link
              href={isAuthenticated ? "/dashboard" : "/"}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-electric-blue rounded-lg flex items-center justify-center">
                <span className="text-navy-primary font-bold text-sm">OW</span>
              </div>
              <span className="text-text-primary font-bold text-lg">
                Olympic Weightlifting AI
              </span>
            </Link>

            {/* Auth buttons based on state */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="w-20 h-10 bg-navy-secondary/50 rounded animate-pulse" />
              ) : isAuthenticated ? (
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {isSigningOut ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={openSignInModal}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                    data-testid="sign-in-button"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={openSignUpModal}
                    className="bg-action-orange hover:bg-action-orange/90 text-white px-4 py-2 rounded-lg transition-colors"
                    data-testid="start-trial-button"
                  >
                    Start Free Trial
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
};