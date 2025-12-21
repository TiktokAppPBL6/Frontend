import { Search, Filter } from 'lucide-react';

interface ReportsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  targetTypeFilter: string;
  onTargetTypeFilterChange: (value: string) => void;
}

/**
 * ReportsFilters - Search and filter controls for reports table
 * Separated for reusability and clarity
 */
export function ReportsFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  targetTypeFilter,
  onTargetTypeFilterChange,
}: ReportsFiltersProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by reason, description, or reporter..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">All Status</option>
            <option value="open">Open (Pending)</option>
            <option value="closed">Closed (Handled)</option>
          </select>
          <select
            value={targetTypeFilter}
            onChange={(e) => onTargetTypeFilterChange(e.target.value)}
            className="px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">All Types</option>
            <option value="video">Video</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>
    </div>
  );
}
