import { Eye, Ban, ShieldCheck } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * useUsersTableColumns - Table column definitions for users
 * Separated for better organization and reusability
 */
export function useUsersTableColumns(
  onBanUser: (userId: number) => void,
  onUnbanUser: (userId: number) => void
) {
  return [
    {
      key: 'user',
      label: 'User',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatarUrl} alt={row.username} size="md" />
          <div>
            <p className="font-semibold text-white">{row.username}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'fullName',
      label: 'Full Name',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <Badge variant={value === 'admin' ? 'default' : 'secondary'}>
          {value === 'admin' ? 'Admin' : 'User'}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const variants: any = {
          active: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Active' },
          blocked: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Blocked' },
        };
        const variant = variants[value] || variants.active;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variant.color}`}>
            {variant.label}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Joined',
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
            onClick={() => window.open(`/user/${row.id}`, '_blank')}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.status === 'blocked' ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
              onClick={() => onUnbanUser(row.id)}
            >
              <ShieldCheck className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => onBanUser(row.id)}
            >
              <Ban className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];
}
