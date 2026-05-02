import React from 'react';

type Module = '0G Compute' | '0G Storage' | '0G Chain' | 'ZK Proof' | 'Agent Escrow' | 'Soulbound';

interface OnChainBadgeProps {
  module: Module;
  verified?: boolean;
  label?: string;
}

const moduleMap: Record<Module, string> = {
  '0G Compute':   'badge-tee',
  '0G Storage':   'badge-storage',
  '0G Chain':     'badge-chain',
  'ZK Proof':     'badge-zk',
  'Agent Escrow': 'badge-escrow',
  'Soulbound':    'badge-soulbound',
};

const OnChainBadge = ({ module, verified = true, label }: OnChainBadgeProps) => (
  <span className={`inline-flex items-center gap-1.5 ${moduleMap[module]}`}>
    {verified && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
    {label ?? module}
  </span>
);

export default OnChainBadge;
