import React from 'react';

interface OlympicBackgroundProps {
  children: React.ReactNode;
  withPattern?: boolean;
}

export const OlympicBackground: React.FC<OlympicBackgroundProps> = ({
  children,
  withPattern = true
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-primary to-navy-secondary relative overflow-hidden">
      {children}
    </div>
  );
};