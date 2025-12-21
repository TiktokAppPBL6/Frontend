import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * useReportsTableColumns - Table column definitions for reports
 * Separated for better organization and reusability
 */
export function useReportsTableColumns(
  onApproveReport: (reportId: number, report: any) => void,
  onRejectReport: (reportId: number, report: any) => void
) {
  return [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (value: number) => (
        <span className="text-slate-300 font-mono">#{value}</span>
      ),
    },
    {
      key: 'targetType',
      label: 'Type',
      render: (value: string) => {
        const variants: any = {
          video: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Video' },
          user: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'User' },
        };
        const variant = variants[value] || variants.video;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variant.color}`}>
            {variant.label}
          </span>
        );
      },
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (value: string) => (
        <span className="text-white font-medium">{value}</span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => (
        <span className="text-slate-400 text-sm truncate max-w-xs block">
          {value || 'No description'}
        </span>
      ),
    },
    {
      key: 'reporter',
      label: 'Reporter',
      render: (_: any, row: any) => (
        <div>
          <p className="text-white text-sm">{row.reporter?.username || 'Unknown'}</p>
          <p className="text-slate-400 text-xs">{row.reporter?.email || ''}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const variants: any = {
          open: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Open (Pending)' },
          closed: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Closed (Handled)' },
        };
        const variant = variants[value] || variants.open;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variant.color}`}>
            {variant.label}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
            onClick={() => {
              if (row.targetType === 'video') {
                window.open(`/video/${row.targetId}`, '_blank');
              } else if (row.targetType === 'user') {
                window.open(`/user/${row.targetId}`, '_blank');
              }
            }}
            title="View target"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.status === 'open' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                onClick={() => onApproveReport(row.id, row)}
                title="Handle report"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => onRejectReport(row.id, row)}
                title="Reject report"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];
}
