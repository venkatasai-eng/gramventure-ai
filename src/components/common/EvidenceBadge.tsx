import React from 'react';
import type { EvidenceLabel } from '@/types';
import type { EvidenceSourceLabel } from '@/lib/scoring/types';
import { ShieldCheck, Eye, User, Calculator, AlertTriangle } from 'lucide-react';

interface EvidenceBadgeProps {
  label: EvidenceLabel | EvidenceSourceLabel;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  label,
  size = 'md',
  showIcon = true,
}) => {
  const getBadgeConfig = () => {
    switch (label) {
      case 'Official Data':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: ShieldCheck,
          text: 'Official Data',
        };
      case 'Verified Local Observation':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: Eye,
          text: 'Verified Local Observation',
        };
      case 'User-Provided Input':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: User,
          text: 'User-Provided Input',
        };
      case 'Model Estimate':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Calculator,
          text: 'Model Estimate',
        };
      case 'Missing Data':
      default:
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          icon: AlertTriangle,
          text: 'Missing Data',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${padding}`}
      title={`Evidence Classification: ${config.text}`}
    >
      {showIcon && <Icon size={iconSize} className="shrink-0" />}
      <span>{config.text}</span>
    </span>
  );
};
