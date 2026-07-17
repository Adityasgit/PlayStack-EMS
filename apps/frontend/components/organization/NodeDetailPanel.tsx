'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEmployee, useReportees, useUpdateEmployee, useAssignManager, useDeleteEmployee, useEmployees } from '@/hooks/useEmployees';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useAuth } from '@/context/AuthContext';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { getInitials, formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/employees/StatusBadge';
import { RoleBadge } from '@/components/employees/RoleBadge';
import {
  Loader2,
  Mail,
  Phone,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Users,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import type { IEmployee, ITask, TaskStatus } from '@/types';

// ── Constants ─────────────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  high: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
};

const STATUS_ICONS: Record<TaskStatus, React.ComponentType<{ className?: string }>> = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: 'text-muted-foreground',
  in_progress: 'text-amber-500',
  done: 'text-emerald-500',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Design', 'Legal'] as const;

// ── Task row ──────────────────────────────────────────────────────────────────

function TaskRow({ task, canDelete }: { task: ITask; canDelete: boolean }) {
  const updateTask = useUpdateTask(task._id);
  const deleteTask = useDeleteTask();
  const StatusIcon = STATUS_ICONS[task.status];

  const handleToggleStatus = async () => {
    const next = STATUS_CYCLE[task.status];
    try {
      await updateTask.mutateAsync({ status: next });
      toast.success(`Status → ${STATUS_LABELS[next]}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(task._id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
      {/* Status cycle button */}
      <button
        onClick={handleToggleStatus}
        disabled={updateTask.isPending}
        className={cn('mt-0.5 shrink-0 transition-colors hover:scale-110', STATUS_STYLES[task.status])}
        title={`${STATUS_LABELS[task.status]} — click to advance`}
      >
        {updateTask.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <StatusIcon className="h-4 w-4" />
        )}
      </button>

      {/* Task details */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium truncate',
          task.status === 'done' && 'line-through text-muted-foreground',
        )}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', PRIORITY_STYLES[task.priority])}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-2.5 w-2.5" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Delete (SA only) */}
      {canDelete && (
        <AlertDialog>
          <AlertDialogTrigger>
            <button className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete task?</AlertDialogTitle>
              <AlertDialogDescription>
                &ldquo;{task.title}&rdquo; will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

// ── Direct reports tab ────────────────────────────────────────────────────────

function DirectReportsTab({ employeeId }: { employeeId: string }) {
  const { data, isLoading } = useReportees(employeeId);

  if (isLoading) return <LoadingSpinner size="sm" className="py-8" />;
  if (!data?.data?.length) {
    return (
      <EmptyState
        title="No direct reports"
        description="This employee has no direct reports."
        className="mt-4"
      />
    );
  }

  return (
    <div className="space-y-2 mt-2">
      {data.data.map((emp: IEmployee) => (
        <div key={emp._id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="relative shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary overflow-hidden">
              {emp.profileImage ? (
                <img src={emp.profileImage} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                getInitials(emp.name)
              )}
            </div>
            <span className={cn(
              'absolute bottom-0 right-0 h-2 w-2 rounded-full ring-2 ring-card',
              emp.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400',
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{emp.name}</p>
            <p className="text-xs text-muted-foreground truncate">{emp.designation} · {emp.department}</p>
          </div>
          <StatusBadge status={emp.status} />
        </div>
      ))}
    </div>
  );
}

// ── Main NodeDetailPanel ──────────────────────────────────────────────────────

interface NodeDetailPanelProps {
  employeeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string) => void;
}

export function NodeDetailPanel({ employeeId, open, onOpenChange, onDelete }: NodeDetailPanelProps) {
  const { user } = useAuth();
  const { data: empData, isLoading: empLoading } = useEmployee(employeeId ?? undefined);
  const { data: tasksData, isLoading: tasksLoading } = useTasks(
    employeeId ? { assignedTo: employeeId } : {}
  );
  const updateEmployee = useUpdateEmployee(employeeId ?? '');
  const assignManagerMutation = useAssignManager(employeeId ?? '');
  const deleteEmployee = useDeleteEmployee();
  const { data: allEmpsData } = useEmployees({ limit: '200' });

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [managerSaving, setManagerSaving] = useState(false);

  const employee = empData?.data;
  const tasks = (tasksData?.data || []) as ITask[];
  const allEmployees = ((allEmpsData?.data || []) as IEmployee[]).filter(e => e._id !== employeeId);

  const isAdmin = user?.role === 'super_admin';
  const isHR = user?.role === 'hr_manager';
  const canManageTasks = isAdmin || isHR;
  const canManageEmployee = isAdmin || isHR;

  const handleStatusChange = async (status: string | null) => {
    if (!status) return;
    setStatusSaving(true);
    try {
      await updateEmployee.mutateAsync({ status });
      toast.success(`Status updated to ${status}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleManagerChange = async (managerId: string | null) => {
    if (!managerId) return;
    setManagerSaving(true);
    try {
      await assignManagerMutation.mutateAsync({ managerId: managerId === 'none' ? null : managerId });
      toast.success('Reporting manager updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update manager');
    } finally {
      setManagerSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!employee) return;
    try {
      await deleteEmployee.mutateAsync(employee._id);
      toast.success(`${employee.name} removed from the organization`);
      onOpenChange(false);
      onDelete?.(employee._id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove employee');
    }
  };

  const currentManagerId = employee?.reportingManager
    ? typeof employee.reportingManager === 'object'
      ? (employee.reportingManager as IEmployee)._id
      : (employee.reportingManager as string)
    : 'none';

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto flex flex-col gap-0 p-0">
          {empLoading ? (
            <div className="flex items-center justify-center h-40">
              <LoadingSpinner size="md" />
            </div>
          ) : !employee ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm text-muted-foreground">Employee not found</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary overflow-hidden">
                      {employee.profileImage ? (
                        <img src={employee.profileImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        getInitials(employee.name)
                      )}
                    </div>
                    <span className={cn(
                      'absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full ring-2 ring-card',
                      employee.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400',
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-lg truncate">{employee.name}</SheetTitle>
                    <p className="text-sm text-muted-foreground">{employee.designation}</p>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      <StatusBadge status={employee.status} />
                      <RoleBadge role={employee.role} />
                      <Badge variant="outline" className="text-[10px]">{employee.employeeId}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="profile" className="flex-1 flex flex-col">
                <div className="px-6 pt-4">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="tasks">
                      Tasks
                      {tasks.length > 0 && (
                        <span className="ml-1.5 text-[10px] bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
                          {tasks.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Reports
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* ── Profile Tab ─────────────── */}
                <TabsContent value="profile" className="px-6 pb-6 space-y-5 mt-4 flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    {employee.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{employee.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{employee.department}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>Joined {formatDate(employee.joiningDate)}</span>
                    </div>
                  </div>

                  {canManageEmployee && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      {/* Status */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Status
                        </label>
                        <Select
                          value={employee.status}
                          onValueChange={handleStatusChange}
                          disabled={statusSaving}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                                Active
                              </span>
                            </SelectItem>
                            <SelectItem value="inactive">
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-gray-400 inline-block" />
                                Inactive
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {statusSaving && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                          </p>
                        )}
                      </div>

                      {/* Reporting manager */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Reporting Manager
                        </label>
                        <Select
                          value={currentManagerId}
                          onValueChange={handleManagerChange}
                          disabled={managerSaving}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="No manager" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">— No manager (root) —</SelectItem>
                            {allEmployees.map((emp) => (
                              <SelectItem key={emp._id} value={emp._id}>
                                {emp.name} · {emp.designation}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {managerSaving && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" /> Updating hierarchy…
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Danger zone — SA only */}
                  {isAdmin && (
                    <div className="pt-4 border-t border-border">
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove from organization
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-destructive" />
                              Remove {employee.name}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will soft-delete the employee and remove them from all reporting
                              hierarchies. The action can be undone by an administrator.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              disabled={deleteEmployee.isPending}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deleteEmployee.isPending ? 'Removing…' : 'Remove'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </TabsContent>

                {/* ── Tasks Tab ───────────────── */}
                <TabsContent value="tasks" className="px-6 pb-6 mt-4 flex-1">
                  {canManageTasks && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mb-4"
                      onClick={() => { setEditingTask(null); setTaskDialogOpen(true); }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  )}

                  {tasksLoading ? (
                    <LoadingSpinner size="sm" className="py-8" />
                  ) : tasks.length === 0 ? (
                    <EmptyState
                      title="No tasks assigned"
                      description={canManageTasks ? 'Add a task to get started.' : 'No tasks have been assigned yet.'}
                      className="mt-4"
                    />
                  ) : (
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <TaskRow key={task._id} task={task} canDelete={isAdmin} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* ── Direct Reports Tab ──────── */}
                <TabsContent value="reports" className="px-6 pb-6 mt-0 flex-1">
                  <DirectReportsTab employeeId={employee._id} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Task form dialog */}
      <TaskFormDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        defaultAssignedTo={employeeId ?? undefined}
      />
    </>
  );
}
