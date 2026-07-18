'use client';

import { useState } from 'react';
import { useDashboardStats, useEmployees } from '@/hooks/useEmployees';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { PageHeader } from '@/components/shared/PageHeader';
import { DepartmentChart } from '@/components/dashboard/DepartmentChart';
import { JoiningTrendChart } from '@/components/dashboard/JoiningTrendChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Users, UserCheck, UserX, Building2 } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const STAT_CARDS = [
  { key: 'total', label: 'Total Employees', icon: Users, iconBg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', cardBg: 'bg-violet-500/[0.04]' },
  { key: 'active', label: 'Active', icon: UserCheck, iconBg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', cardBg: 'bg-emerald-500/[0.04]' },
  { key: 'inactive', label: 'Inactive', icon: UserX, iconBg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', cardBg: 'bg-rose-500/[0.04]' },
  { key: 'departments', label: 'Departments', icon: Building2, iconBg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', cardBg: 'bg-blue-500/[0.04]' },
] as const;

const STATUS_FILTERS = ['all', 'active', 'inactive'] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } },
};

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentData, isLoading: recentLoading } = useEmployees({ limit: '5', sortBy: 'joiningDate', sortOrder: 'desc' });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAllRecent, setShowAllRecent] = useState(false);

  if (statsLoading) return <div className="flex items-center justify-center h-48"><LoadingSpinner size="lg" /></div>;

  const s = stats?.data;

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <PageHeader title="Dashboard" subtitle="Overview of your organization" />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
          <SelectTrigger className="h-8 text-xs rounded-full px-3 bg-muted/50 border-0 shadow-none hover:bg-muted transition-colors">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((f) => (
              <SelectItem key={f} value={f} className="text-xs capitalize">
                {f === 'all' ? 'All Status' : f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stat Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {STAT_CARDS.map(({ key, label, icon: Icon, iconBg, text, cardBg }) => (
          <motion.div key={key} variants={itemVariants}>
            <div className={cn('flex items-center gap-2.5 rounded-xl px-3 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-200 cursor-default', cardBg)}>
              <div className={cn('rounded-lg p-1.5 shrink-0', iconBg)}>
                <Icon className={cn('h-3.5 w-3.5', text)} />
              </div>
              <div className="min-w-0">
                <AnimatedCounter value={s?.[key] ?? 0} className="text-lg font-bold leading-none" />
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        <div className="rounded-xl bg-muted/30 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h3 className="text-[11px] font-semibold mb-1 text-muted-foreground uppercase tracking-wider">By Department</h3>
          <DepartmentChart data={s?.byDepartment || []} />
        </div>
        <div className="rounded-xl bg-muted/30 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] lg:col-span-2">
          <h3 className="text-[11px] font-semibold mb-1 text-muted-foreground uppercase tracking-wider">Joining Trend</h3>
          <JoiningTrendChart data={s?.joiningTrend || []} />
        </div>
      </div>

      {/* Recent Employees & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-muted/30 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wider">Recently Joined</h3>
          {recentLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            (() => {
              const filtered = (recentData?.data || []).filter(emp => statusFilter === 'all' || emp.status === statusFilter);
              const INITIAL_COUNT = 4;
              const visible = showAllRecent ? filtered : filtered.slice(0, INITIAL_COUNT);
              const hasMore = filtered.length > INITIAL_COUNT;
              return (
                <>
                  <div className="space-y-0.5">
                    {visible.map((emp) => (
                      <div key={emp._id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-background/80 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary shrink-0">
                            {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-tight truncate">{emp.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{emp.designation} · {emp.department}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <Badge variant={emp.status === 'active' ? 'default' : 'secondary'} className="text-[10px] px-1 py-0">
                            {emp.status}
                          </Badge>
                          <p className="text-[10px] text-muted-foreground">{formatDate(emp.joiningDate)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {hasMore && !showAllRecent && (
                    <button
                      onClick={() => setShowAllRecent(true)}
                      className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground py-1.5 transition-colors"
                    >
                      See More ({filtered.length - INITIAL_COUNT} more)
                    </button>
                  )}
                </>
              );
            })()
          )}
        </div>

        <div className="rounded-xl bg-muted/30 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
