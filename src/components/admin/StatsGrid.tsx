import { StatsCard } from './StatsCard';

interface StatsGridProps {
  stats: Array<{
    title: string;
    value: number | string;
    icon: any;
    gradient: string;
    trend?: string;
    trendUp?: boolean;
    link?: string;
    subtitle?: string;
  }>;
}

/**
 * StatsGrid - Grid layout for stat cards
 * Responsive grid with consistent spacing
 */
export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
