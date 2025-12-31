'use client';

import { memo } from 'react';

export const GradientBackground = memo(function GradientBackground() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden">
      {/* Animated gradient meshes - pure CSS, no JS */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-50 via-white to-brand-accent-50" />

      {/* Floating gradient orbs with GPU acceleration */}
      <div
        className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-brand-primary-400/30 to-brand-accent-400/30 rounded-full blur-3xl animate-float will-change-transform"
        style={{ transform: 'translate3d(0, 0, 0)' }}
      />
      <div
        className="absolute top-1/4 right-0 w-80 h-80 bg-gradient-to-br from-brand-secondary-400/30 to-brand-primary-400/30 rounded-full blur-3xl animate-float will-change-transform"
        style={{ transform: 'translate3d(0, 0, 0)', animationDelay: '2s' }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-brand-accent-400/30 to-brand-secondary-400/30 rounded-full blur-3xl animate-float will-change-transform"
        style={{ transform: 'translate3d(0, 0, 0)', animationDelay: '4s' }}
      />

      {/* Animated mesh gradient overlay */}
      <div
        className="absolute inset-0 bg-mesh-gradient opacity-20 animate-gradient will-change-transform"
        style={{ backgroundSize: '400% 400%', transform: 'translate3d(0, 0, 0)' }}
      />
    </div>
  );
});
