'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatDate, getInitials, cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { RoleBadge } from './RoleBadge';
import { DeleteDialog } from './DeleteDialog';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { IEmployee } from '@/types';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface EmployeeTableProps {
  employees: IEmployee[];
  isLoading: boolean;
  onViewEmployee: (emp: IEmployee) => void;
  meta?: { page: number; totalPages: number; total: number; limit: number };
  onPageChange?: (page: number) => void;
}

export function EmployeeTable({ employees, isLoading, onViewEmployee, meta, onPageChange }: EmployeeTableProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<IEmployee | null>(null);
  const isAdmin = user?.role === 'super_admin';
  const isHR = user?.role === 'hr_manager';

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><LoadingSpinner size="lg" /></div>;
  }

  if (!employees.length) {
    return <EmptyState title="No employees found" description="Try adjusting your filters or create a new employee." />;
  }

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Department</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Role</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Joined</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp._id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onViewEmployee(emp)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {emp.profileImage ? (
                          <img src={emp.profileImage} alt="" className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          getInitials(emp.name)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{emp.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="text-muted-foreground">{emp.department}</span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <RoleBadge role={emp.role} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={emp.status} />
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">
                    {formatDate(emp.joiningDate)}
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onViewEmployee(emp)}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        {(isAdmin || isHR) && (
                          <DropdownMenuItem onClick={() => router.push(`/employees/${emp._id}/edit`)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        )}
                        {isAdmin && (
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(emp)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <DeleteDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          employeeId={deleteTarget._id}
          employeeName={deleteTarget.name}
        />
      )}
    </>
  );
}
