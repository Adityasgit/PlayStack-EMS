'use client';

import { useActivityLogs } from '@/hooks/useActivity';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { getInitials } from '@/lib/utils';
import { Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const INITIAL_COUNT = 6;

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

  const allLogs = data?.data || [];
  const visibleLogs = allLogs.slice(0, INITIAL_COUNT);
  const hasMore = allLogs.length > INITIAL_COUNT;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Activity className="h-3.5 w-3.5" /> Activity Log
        </h3>
        {hasMore && (
          <Link href="/activity" className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5">
            See More <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4"><LoadingSpinner size="sm" /></div>
      ) : !allLogs.length ? (
        <p className="text-sm text-muted-foreground text-center py-4">No activity yet.</p>
      ) : (
        <div className="space-y-0">
          {visibleLogs.map((log, i) => (
            <div key={log._id} className="flex gap-2.5 py-2 relative">
              {/* Timeline line */}
              {i < visibleLogs.length - 1 && (
                <div className="absolute left-3.5 top-9 bottom-0 w-px bg-border" />
              )}

              <Avatar className="h-7 w-7 shrink-0 relative z-10">
                <AvatarImage src={log.performedBy?.profileImage || undefined} />
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {log.performedBy ? getInitials(log.performedBy.name) : '?'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-medium">{log.performedBy?.name}</span>
                  <span className="text-xs text-muted-foreground">{log.action}</span>
                  <span className={`text-[10px] px-1 py-0 rounded-full font-medium ${entityColor[log.entity] ?? 'bg-muted text-muted-foreground'}`}>
                    {log.entity}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{timeAgo(log.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
