interface ReportsStatsOverviewProps {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

/**
 * ReportsStatsOverview - Quick stats summary for reports
 * Shows total, pending, approved, and rejected counts
 */
export function ReportsStatsOverview({ total, pending, approved, rejected }: ReportsStatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-4">
        <p className="text-slate-400 text-sm mb-1">Total Reports</p>
        <p className="text-2xl font-bold text-white">{total}</p>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-yellow-900/30 to-slate-900/50 border border-yellow-700/30 p-4">
        <p className="text-yellow-400 text-sm mb-1">Pending</p>
        <p className="text-2xl font-bold text-white">{pending}</p>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-green-900/30 to-slate-900/50 border border-green-700/30 p-4">
        <p className="text-green-400 text-sm mb-1">Approved</p>
        <p className="text-2xl font-bold text-white">{approved}</p>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-red-900/30 to-slate-900/50 border border-red-700/30 p-4">
        <p className="text-red-400 text-sm mb-1">Rejected</p>
        <p className="text-2xl font-bold text-white">{rejected}</p>
      </div>
    </div>
  );
}
