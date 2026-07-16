'use client';

import { useReportees, useEmployee } from '@/hooks/useEmployees';
import { getInitials, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/employees/StatusBadge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';

interface ReporteesPanelProps {
  employeeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReporteesPanel({ employeeId, open, onOpenChange }: ReporteesPanelProps) {
  const { data: empData } = useEmployee(employeeId);
  const { data, isLoading } = useReportees(employeeId);
  const employee = empData?.data;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle>Direct Reports</SheetTitle>
          {employee && (
            <p className="text-sm text-muted-foreground">
              {employee.name}&apos;s team ({data?.data?.length || 0} members)
            </p>
          )}
        </SheetHeader>

        {isLoading ? (
          <LoadingSpinner size="md" className="mt-8" />
        ) : !data?.data?.length ? (
          <EmptyState title="No direct reports" description="This employee has no direct reports." className="mt-8" />
        ) : (
          <div className="space-y-3 mt-6">
            {data.data.map((emp: any) => (
              <div key={emp._id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {emp.profileImage ? (
                    <img src={emp.profileImage} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    getInitials(emp.name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">{emp.designation} · {emp.department}</p>
                </div>
                <StatusBadge status={emp.status} />
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
