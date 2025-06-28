import React from 'react';

interface OlympicBackgroundProps {
  children: React.ReactNode;
}

export const OlympicBackground: React.FC<OlympicBackgroundProps> = ({
  children
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-primary to-navy-secondary relative overflow-hidden">
      {children}
    </div>
  );
};