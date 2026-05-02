import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const EmptyState = ({ title, description, icon, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-14 text-center">
    <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
      {icon ?? (
        <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )}
    </div>
    <p className="text-sm font-semibold text-white mb-1">{title}</p>
    <p className="text-xs text-gray-500 max-w-xs leading-relaxed mb-5">{description}</p>
    {action && (
      action.href ? (
        <Link href={action.href} className="btn-primary">
          {action.label}
        </Link>
      ) : (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      )
    )}
  </div>
);

export default EmptyState;
