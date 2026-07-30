import React from 'react';

export default function LoadingSkeleton({ className = 'h-32' }) {
  return (
    <div className={`w-full bg-slate-800/50 rounded-2xl animate-pulse ${className}`} />
  );
}
