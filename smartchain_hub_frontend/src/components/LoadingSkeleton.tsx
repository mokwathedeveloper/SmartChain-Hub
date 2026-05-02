import React from 'react';

type Variant = 'card' | 'stat' | 'table' | 'text';

interface LoadingSkeletonProps {
  variant?: Variant;
  rows?: number;
  count?: number;
}

const LoadingSkeleton = ({ variant = 'card', rows = 3, count = 3 }: LoadingSkeletonProps) => {
  if (variant === 'stat') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-${count} gap-4`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="h-3 bg-gray-800 rounded w-1/2 mb-3" />
            <div className="h-7 bg-gray-800 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="card animate-pulse">
        <div className="px-5 py-4 border-b border-gray-800">
          <div className="h-4 bg-gray-800 rounded w-1/4" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-5 py-4 border-b border-gray-800 flex gap-4">
            <div className="h-4 bg-gray-800 rounded flex-1" />
            <div className="h-4 bg-gray-800 rounded w-20" />
            <div className="h-4 bg-gray-800 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className="space-y-2 animate-pulse">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={`h-3 bg-gray-800 rounded ${i === rows - 1 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    );
  }

  // default: card
  return (
    <div className="card p-6 animate-pulse">
      <div className="h-5 bg-gray-800 rounded w-1/3 mb-5" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-800 rounded-full shrink-0" />
            <div className="flex-1 h-9 bg-gray-800 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
