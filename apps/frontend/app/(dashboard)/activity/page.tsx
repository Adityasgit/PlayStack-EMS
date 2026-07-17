'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useActivityLogs } from '@/hooks/useActivity';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, formatDate } from '@/lib/utils';
import { Activity } from 'lucide-react';

const ENTITY_COLORS: Record<string, string> = {
  task: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border-violet-200/20',
  employee: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200/20',
};

const ACTION_LABELS: Record<string, string> = {
  employee_created: 'created an employee profile',
  employee_updated: 'updated employee information',
  employee_deleted: 'removed an employee (soft delete)',
  task_created: 'created a new task',
  task_updated: 'updated a task details',
  task_deleted: 'deleted a task',
  manager_assigned: 'changed reporting manager hierarchy',
};

export default function ActivityLogsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { data, isLoading: logsLoading, refetch } = useActivityLogs();

  // Redirect non-admin/non-HR users
  useEffect(() => {
    if (!authLoading && user && user.role !== 'super_admin' && user.role !== 'hr_manager') {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading || logsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Double check auth verification
  if (user?.role !== 'super_admin' && user?.role !== 'hr_manager') {
    return null;
  }

  const logs = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Logs"
        subtitle="System-wide audit trail of operational events and changes"
      />

      <Card>
        <CardContent className="p-6">
          {!logs.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Activity className="h-10 w-10 mb-3 text-muted-foreground/50 animate-pulse" />
              <p className="font-semibold text-sm">No activity logs recorded yet</p>
              <p className="text-xs max-w-xs mt-1">Actions performed by users across the system will populate here.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline center line */}
              <div className="absolute left-6 top-6 bottom-6 w-px bg-border hidden sm:block" />

              <div className="space-y-6">
                {logs.map((log) => {
                  const actionUser = log.performedBy;
                  const formattedDate = new Date(log.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  });

                  return (
                    <div key={log._id} className="relative flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-xl hover:bg-muted/30 transition-colors">
                      {/* Timeline dot/avatar */}
                      <div className="relative shrink-0 flex items-center justify-center z-10">
                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm ring-1 ring-border">
                          <AvatarImage src={actionUser?.profileImage || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                            {actionUser ? getInitials(actionUser.name) : '?'}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Content block */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <p className="text-sm font-semibold flex flex-wrap items-center gap-1.5 text-foreground">
                            <span>{actionUser?.name || 'System / Unknown'}</span>
                            <span className="text-xs font-normal text-muted-foreground">
                              ({actionUser?.employeeId || 'N/A'})
                            </span>
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formattedDate}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            {ACTION_LABELS[log.action] || log.action.replace(/_/g, ' ')}
                          </span>

                          <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${ENTITY_COLORS[log.entity] || 'bg-muted text-muted-foreground border-border'}`}>
                            {log.entity}
                          </span>
                        </div>

                        {/* Metadata disclosure */}
                        {log.meta && Object.keys(log.meta).length > 0 && (
                          <div className="mt-2 text-xs bg-muted/40 rounded-lg p-2.5 max-w-xl border border-muted font-mono leading-normal text-muted-foreground whitespace-pre-wrap overflow-x-auto">
                            {Object.entries(log.meta).map(([key, val]) => {
                              if (val === null || val === undefined) return null;
                              return (
                                <div key={key}>
                                  <span className="text-primary font-medium">{key}:</span> {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
