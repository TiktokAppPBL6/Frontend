import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  gradient: string;
  trend?: string;
  trendUp?: boolean;
  link?: string;
  subtitle?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  gradient,
  trend,
  trendUp,
  link,
  subtitle,
}: StatsCardProps) {
  const content = (
    <>
      {/* Gradient Background */}
      <div className={cn(
        'absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 blur-3xl transition-opacity duration-300',
        gradient,
        link && 'group-hover:opacity-20'
      )}></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <h3 className="text-3xl font-black text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
          </div>
          <div className={cn(
            'p-3 rounded-xl bg-gradient-to-br transition-transform duration-300',
            gradient,
            link && 'group-hover:scale-110'
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-slate-500 mb-3">{subtitle}</p>
        )}

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-2">
            {trendUp ? (
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
            <span className={cn(
              'text-sm font-semibold',
              trendUp ? 'text-green-400' : 'text-red-400'
            )}>
              {trend}
            </span>
          </div>
        )}
      </div>

      {/* Shine Effect */}
      {link && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      )}
    </>
  );

  if (link) {
    return (
      <Link
        to={link}
        className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-6 transition-all duration-300 hover:border-slate-600/50 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02] cursor-pointer block"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-6 transition-all duration-300">
      {content}
    </div>
  );
}
