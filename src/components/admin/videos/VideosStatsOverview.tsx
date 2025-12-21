interface VideosStatsOverviewProps {
  total: number;
  public: number;
  hidden: number;
  deleted: number;
}

/**
 * VideosStatsOverview - Quick stats summary for videos
 * Shows total, public, hidden, and deleted counts
 */
export function VideosStatsOverview({ total, public: publicCount, hidden, deleted }: VideosStatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-4">
        <p className="text-slate-400 text-sm mb-1">Total Videos</p>
        <p className="text-2xl font-bold text-white">{total}</p>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-green-900/30 to-slate-900/50 border border-green-700/30 p-4">
        <p className="text-green-400 text-sm mb-1">Public</p>
        <p className="text-2xl font-bold text-white">{publicCount}</p>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-yellow-900/30 to-slate-900/50 border border-yellow-700/30 p-4">
        <p className="text-yellow-400 text-sm mb-1">Hidden</p>
        <p className="text-2xl font-bold text-white">{hidden}</p>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-red-900/30 to-slate-900/50 border border-red-700/30 p-4">
        <p className="text-red-400 text-sm mb-1">Deleted</p>
        <p className="text-2xl font-bold text-white">{deleted}</p>
      </div>
    </div>
  );
}
