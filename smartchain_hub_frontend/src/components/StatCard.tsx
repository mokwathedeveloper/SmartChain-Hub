import React from 'react';

type Accent = 'blue' | 'green' | 'purple' | 'yellow' | 'cyan' | 'indigo' | 'rose';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changePositive?: boolean;
  accent?: Accent;
  icon?: React.ReactNode;
  sub?: string;
}

const accentMap: Record<Accent, { card: string; text: string }> = {
  blue:   { card: 'card-blue',   text: 'text-blue-400'   },
  green:  { card: 'card-green',  text: 'text-green-400'  },
  purple: { card: 'card-purple', text: 'text-purple-400' },
  yellow: { card: 'card-yellow', text: 'text-yellow-400' },
  cyan:   { card: 'card-cyan',   text: 'text-cyan-400'   },
  indigo: { card: 'card-indigo', text: 'text-indigo-400' },
  rose:   { card: 'bg-rose-500/[0.06] border border-rose-500/20 rounded-2xl', text: 'text-rose-400' },
};

const StatCard = ({
  label,
  value,
  change,
  changePositive = true,
  accent = 'blue',
  icon,
  sub,
}: StatCardProps) => {
  const { card, text } = accentMap[accent];

  return (
    <div className={`${card} p-5 rounded-2xl`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</p>
        {icon && <span className={text}>{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <p className={`text-2xl font-black ${text}`}>{value}</p>
        {change && (
          <span className={`text-sm font-semibold mb-0.5 ${changePositive ? 'text-green-400' : 'text-red-400'}`}>
            {changePositive && change[0] !== '+' ? `+${change}` : change}
          </span>
        )}
      </div>
      {sub && <p className="text-xs text-gray-600 mt-1.5">{sub}</p>}
    </div>
  );
};

export default StatCard;
