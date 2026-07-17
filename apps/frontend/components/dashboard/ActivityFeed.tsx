'use client';

import { useActivityLogs } from '@/hooks/useActivity';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { getInitials } from '@/lib/utils';
import { Activity } from 'lucide-react';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const entityColor: Record<string, string> = {
  task: 'bg-violet-500/20 text-violet-400',
  employee: 'bg-blue-500/20 text-blue-400',
};

export function ActivityFeed() {
  const { user } = useAuth();
  const { data, isLoading } = useActivityLogs();

  // Only show for SA / HR
  if (user?.role === 'employee') return null;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <Activity className="h-4 w-4" /> Activity Log
      </h3>

      {isLoading ? (
        <div className="flex justify-center py-6"><LoadingSpinner size="sm" /></div>
      ) : !data?.data?.length ? (
        <p className="text-sm text-muted-foreground text-center py-6">No activity yet.</p>
      ) : (
        <div className="space-y-0">
          {data.data.slice(0, 20).map((log, i) => (
            <div key={log._id} className="flex gap-3 py-3 relative">
              {/* Timeline line */}
              {i < data.data.slice(0, 20).length - 1 && (
                <div className="absolute left-4 top-10 bottom-0 w-px bg-border" />
              )}

              <Avatar className="h-8 w-8 shrink-0 relative z-10">
                <AvatarImage src={log.performedBy?.profileImage || undefined} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {log.performedBy ? getInitials(log.performedBy.name) : '?'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{log.performedBy?.name}</span>
                  <span className="text-xs text-muted-foreground">{log.action}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${entityColor[log.entity] ?? 'bg-muted text-muted-foreground'}`}>
                    {log.entity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(log.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
