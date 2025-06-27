// components/LoadingSpinner.tsx
'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'white' | 'gray' | 'orange';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  className = '',
  text
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4'
  };

  const colorClasses = {
    blue: 'border-electric-blue/30 border-t-electric-blue',
    white: 'border-white/30 border-t-white',
    gray: 'border-gray-300 border-t-gray-600',
    orange: 'border-orange-300 border-t-orange-600'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          rounded-full animate-spin
        `}
        style={{
          borderStyle: 'solid',
          borderTopStyle: 'solid'
        }}
      />
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Specialized loading spinners for different contexts
export const ButtonLoadingSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <LoadingSpinner size="sm" color="white" className={className} />
);

export const PageLoadingSpinner: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <LoadingSpinner size="lg" color="blue" text={text} />
  </div>
);

export const FullPageLoading: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg p-8">
      <LoadingSpinner size="xl" color="blue" text={text} />
    </div>
  </div>
);

// Olympic-themed loading spinner with gradient
export const OlympicLoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  text
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="relative">
        <div
          className={`
            ${sizeClasses[size]} 
            rounded-full animate-spin
          `}
          style={{
            background: 'conic-gradient(from 0deg, #00d4ff, #00b8a3, #ff6b35, #00d4ff)',
            padding: '2px'
          }}
        >
          <div className={`${sizeClasses[size]} bg-white rounded-full`} />
        </div>
      </div>
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-700 font-medium text-center`}>
          {text}
        </p>
      )}
    </div>
  );
};