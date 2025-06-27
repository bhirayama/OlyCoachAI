// components/auth/PasswordValidationDisplay.tsx
'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (password) => password.length >= 8
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (password) => /[A-Z]/.test(password)
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (password) => /[a-z]/.test(password)
  },
  {
    id: 'number',
    label: 'One number',
    test: (password) => /[0-9]/.test(password)
  }
];

interface PasswordValidationDisplayProps {
  password: string;
  className?: string;
}

export const PasswordValidationDisplay: React.FC<PasswordValidationDisplayProps> = ({
  password,
  className = ''
}) => {
  // Only show validation if user has started typing
  if (!password || password.length === 0) {
    return null;
  }

  const validRequirements = passwordRequirements.filter(req => req.test(password));
  const invalidRequirements = passwordRequirements.filter(req => !req.test(password));
  const allValid = validRequirements.length === passwordRequirements.length;

  return (
    <div className={`mt-3 p-3 bg-gray-50 rounded-lg border transition-all duration-300 ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Password Requirements
          </span>
          {allValid && (
            <div className="flex items-center text-green-600">
              <Check className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">All requirements met</span>
            </div>
          )}
        </div>

        <div className="grid gap-1">
          {passwordRequirements.map((requirement) => {
            const isValid = requirement.test(password);

            return (
              <div
                key={requirement.id}
                className={`flex items-center space-x-2 text-sm transition-all duration-200 ${isValid ? 'text-green-600' : 'text-gray-500'
                  }`}
              >
                <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${isValid
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-200 text-gray-400'
                  }`}>
                  {isValid ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                </div>
                <span className={`transition-all duration-200 ${isValid ? 'font-medium' : 'font-normal'
                  }`}>
                  {requirement.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Password Strength Indicator */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Strength</span>
            <span className={`text-xs font-medium ${getStrengthColor(validRequirements.length)}`}>
              {getStrengthLabel(validRequirements.length)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getStrengthBarColor(validRequirements.length)}`}
              style={{ width: `${(validRequirements.length / passwordRequirements.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility functions for strength indication
const getStrengthLabel = (validCount: number): string => {
  switch (validCount) {
    case 0:
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return 'Weak';
  }
};

const getStrengthColor = (validCount: number): string => {
  switch (validCount) {
    case 0:
    case 1:
      return 'text-red-600';
    case 2:
      return 'text-orange-600';
    case 3:
      return 'text-yellow-600';
    case 4:
      return 'text-green-600';
    default:
      return 'text-red-600';
  }
};

const getStrengthBarColor = (validCount: number): string => {
  switch (validCount) {
    case 0:
    case 1:
      return 'bg-red-500';
    case 2:
      return 'bg-orange-500';
    case 3:
      return 'bg-yellow-500';
    case 4:
      return 'bg-green-500';
    default:
      return 'bg-red-500';
  }
};

// Alternative compact version for mobile
export const CompactPasswordValidation: React.FC<PasswordValidationDisplayProps> = ({
  password,
  className = ''
}) => {
  if (!password || password.length === 0) {
    return null;
  }

  const validRequirements = passwordRequirements.filter(req => req.test(password));
  const allValid = validRequirements.length === passwordRequirements.length;

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          {passwordRequirements.map((requirement) => {
            const isValid = requirement.test(password);
            return (
              <div
                key={requirement.id}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${isValid ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                title={requirement.label}
              />
            );
          })}
        </div>
        <span className={`text-xs font-medium ${getStrengthColor(validRequirements.length)}`}>
          {getStrengthLabel(validRequirements.length)}
        </span>
      </div>
      {allValid && (
        <div className="flex items-center mt-1 text-green-600">
          <Check className="w-3 h-3 mr-1" />
          <span className="text-xs">All requirements met</span>
        </div>
      )}
    </div>
  );
};