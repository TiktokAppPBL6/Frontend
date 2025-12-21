import { Trash2, XCircle, Heart, MessageSquare, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * useVideosTableColumns - Table column definitions for videos
 * Separated for better organization and reusability
 */
export function useVideosTableColumns(
  onRejectVideo: (videoId: number, video: any) => void,
  onDeleteVideo: (videoId: number, video: any) => void
) {
  return [
    {
      key: 'thumbnail',
      label: 'Thumbnail',
      render: (_: any, row: any) => (
        <div className="relative w-16 h-24 rounded-lg overflow-hidden bg-slate-800">
          <img
            src={row.thumbUrl || '/placeholder.jpg'}
            alt={row.title}
            className="w-full h-full object-cover"
          />
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (_: any, row: any) => (
        <div className="max-w-xs">
          <p className="font-semibold text-white line-clamp-2">{row.title}</p>
          {row.description && (
            <p className="text-xs text-slate-400 line-clamp-1 mt-1">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (_: any, row: any) => (
        <div>
          <p className="text-white text-sm font-medium">{row.owner?.username || row.username || 'Unknown'}</p>
          <p className="text-slate-400 text-xs">{row.owner?.email || ''}</p>
        </div>
      ),
    },
    {
      key: 'stats',
      label: 'Stats',
      render: (_: any, row: any) => (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1.5 text-pink-400">
            <Heart className="w-3.5 h-3.5" />
            <span>{row.likes_count || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-400">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{row.comments_count || 0}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'visibility',
      label: 'Status',
      render: (value: string) => {
        const variants: any = {
          public: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Public' },
          hidden: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Hidden' },
          deleted: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Deleted' },
        };
        const variant = variants[value] || variants.public;
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
            onClick={() => window.open(`/video/${row.id}`, '_blank')}
            title="View video"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          {row.visibility !== 'deleted' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                onClick={() => onRejectVideo(row.id, row)}
                title="Hide video"
              >
                <XCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => onDeleteVideo(row.id, row)}
                title="Delete video"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];
}
