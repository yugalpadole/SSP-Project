import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'amber' | 'blue' | 'purple' | 'red';
  badge?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'emerald',
  badge,
  trend,
  onClick,
}) => {
  const colorMap = {
    emerald: {
      iconBg: 'bg-emerald-500/10 text-emerald-600',
      borderHover: 'hover:border-emerald-300',
      glow: 'from-emerald-500/10 to-transparent',
      topLine: 'bg-emerald-500',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    amber: {
      iconBg: 'bg-amber-500/10 text-amber-600',
      borderHover: 'hover:border-amber-300',
      glow: 'from-amber-500/10 to-transparent',
      topLine: 'bg-amber-500',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    blue: {
      iconBg: 'bg-sky-500/10 text-sky-600',
      borderHover: 'hover:border-sky-300',
      glow: 'from-sky-500/10 to-transparent',
      topLine: 'bg-sky-500',
      badge: 'bg-sky-100 text-sky-800 border-sky-200',
    },
    purple: {
      iconBg: 'bg-purple-500/10 text-purple-600',
      borderHover: 'hover:border-purple-300',
      glow: 'from-purple-500/10 to-transparent',
      topLine: 'bg-purple-500',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    red: {
      iconBg: 'bg-red-500/10 text-red-600',
      borderHover: 'hover:border-red-300',
      glow: 'from-red-500/10 to-transparent',
      topLine: 'bg-red-500',
      badge: 'bg-red-100 text-red-800 border-red-200',
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div
      onClick={onClick}
      className={`glass-panel p-5 rounded-2xl border border-white/90 relative overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1 group ${
        scheme.borderHover
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Subtle top indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${scheme.topLine} opacity-80 group-hover:opacity-100 transition-opacity`} />
      
      {/* Background radial gradient glow */}
      <div className={`absolute -right-8 -top-8 w-28 h-28 bg-gradient-to-br ${scheme.glow} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform`} />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 pr-2">
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <h3 className="text-2xl font-black text-stone-900 font-heading tracking-tight">
              {value}
            </h3>
            {trend && (
              <span
                className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  trend.isPositive !== false
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-stone-600 bg-stone-100'
                }`}
              >
                {trend.isPositive !== false ? (
                  <ArrowUpRight size={11} className="inline mr-0.5" />
                ) : (
                  <ArrowDownRight size={11} className="inline mr-0.5" />
                )}
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-stone-500 mt-1 font-medium flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-3 rounded-2xl ${scheme.iconBg} transition-transform group-hover:scale-110 shadow-xs shrink-0`}>
          <Icon size={22} />
        </div>
      </div>

      {badge && (
        <div className="mt-3 relative z-10 flex items-center justify-between">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${scheme.badge}`}>
            {badge}
          </span>
          {trend?.label && (
            <span className="text-[10px] text-stone-400 font-medium">
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
