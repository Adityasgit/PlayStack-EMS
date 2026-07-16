'use client';

import { useDashboardStats, useEmployees } from '@/hooks/useEmployees';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { PageHeader } from '@/components/shared/PageHeader';
import { DepartmentChart } from '@/components/dashboard/DepartmentChart';
import { JoiningTrendChart } from '@/components/dashboard/JoiningTrendChart';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX, Building2, TrendingUp } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const STAT_CARDS = [
  { key: 'total', label: 'Total Employees', icon: Users, color: 'from-violet-500/10 to-purple-500/5', borderColor: 'border-violet-500/20' },
  { key: 'active', label: 'Active', icon: UserCheck, color: 'from-emerald-500/10 to-green-500/5', borderColor: 'border-emerald-500/20' },
  { key: 'inactive', label: 'Inactive', icon: UserX, color: 'from-rose-500/10 to-pink-500/5', borderColor: 'border-rose-500/20' },
  { key: 'departments', label: 'Departments', icon: Building2, color: 'from-blue-500/10 to-cyan-500/5', borderColor: 'border-blue-500/20' },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentData, isLoading: recentLoading } = useEmployees({ limit: '5', sortBy: 'joiningDate', sortOrder: 'desc' });

  if (statsLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  const s = stats?.data;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your organization" />

      {/* Stat Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, borderColor }) => (
          <motion.div key={key} variants={itemVariants}>
            <Card className={cn('relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 cursor-pointer', borderColor)}>
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity', color)} />
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn('rounded-xl p-2.5 bg-gradient-to-br', color)}>
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <AnimatedCounter value={s?.[key] ?? 0} className="text-3xl font-bold" />
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">By Department</h3>
            <DepartmentChart data={s?.byDepartment || []} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Joining Trend</h3>
            <JoiningTrendChart data={s?.joiningTrend || []} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Employees */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Recently Joined</h3>
          {recentLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <div className="space-y-3">
              {(recentData?.data || []).map((emp) => (
                <div key={emp._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.designation} · {emp.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={emp.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {emp.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(emp.joiningDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
