interface StatsOverviewProps {
  total: number;
  active: number;
  blocked: number;
}

/**
 * UsersStatsOverview - Quick stats summary for users
 * Shows total, active, banned, and suspended counts
 */
export function UsersStatsOverview({ total, active, blocked }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-4">
        <p className="text-slate-400 text-sm mb-1">Total Users</p>
        <p className="text-2xl font-bold text-white">{total}</p>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-green-900/30 to-slate-900/50 border border-green-700/30 p-4">
        <p className="text-green-400 text-sm mb-1">Active</p>
        <p className="text-2xl font-bold text-white">{active}</p>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-red-900/30 to-slate-900/50 border border-red-700/30 p-4">
        <p className="text-red-400 text-sm mb-1">Blocked</p>
        <p className="text-2xl font-bold text-white">{blocked}</p>
      </div>
    </div>
  );
}
