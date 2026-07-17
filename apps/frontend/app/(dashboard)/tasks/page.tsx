'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTasks, useDeleteTask, useUpdateTask } from '@/hooks/useTasks';
import { useEmployees } from '@/hooks/useEmployees';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { formatDate, getInitials, cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Filter,
  X,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  Circle,
  Play,
  Pencil,
  Trash2,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ITask, IEmployee, TaskStatus, TaskPriority } from '@/types';

// ── Styling & Icons ───────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/30',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/30',
  high: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200/30',
};

const STATUS_ICONS: Record<TaskStatus, React.ComponentType<{ className?: string }>> = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: 'text-muted-foreground bg-muted/20 border-border',
  in_progress: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  done: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
};

export default function TasksPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin';
  const isHR = user?.role === 'hr_manager';
  const canManageTasks = isAdmin || isHR;

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>(
    user?.role === 'employee' ? user.id : ''
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dialog States
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<ITask | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // Fetch employees for filter options (Admin/HR only)
  const { data: empsData } = useEmployees({ limit: '200' });
  const employees = empsData?.data || [];

  // Query parameters build
  const queryParams: Record<string, string> = {};
  if (statusFilter) queryParams.status = statusFilter;
  if (priorityFilter) queryParams.priority = priorityFilter;
  if (user?.role === 'employee') {
    queryParams.assignedTo = user.id;
  } else if (assigneeFilter) {
    queryParams.assignedTo = assigneeFilter;
  }

  const { data: tasksData, isLoading, refetch } = useTasks(queryParams);
  const updateTaskMutation = useUpdateTask(editingTask?._id ?? '');
  const deleteTaskMutation = useDeleteTask();

  const allTasks = tasksData?.data || [];

  // Filter tasks locally by search query (title/description match)
  const filteredTasks = allTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCycleStatus = async (task: ITask) => {
    setStatusUpdatingId(task._id);
    const nextStatus = NEXT_STATUS[task.status];
    try {
      // Invalidate queries or perform mutation
      const api = (await import('@/lib/api')).api;
      await api.put(`/api/tasks/${task._id}`, { status: nextStatus });
      toast.success(`Task status changed to ${STATUS_LABELS[nextStatus]}`);
      refetch();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleSetSpecificStatus = async (task: ITask, newStatus: TaskStatus) => {
    setStatusUpdatingId(task._id);
    try {
      const api = (await import('@/lib/api')).api;
      await api.put(`/api/tasks/${task._id}`, { status: newStatus });
      toast.success(`Task status changed to ${STATUS_LABELS[newStatus]}`);
      refetch();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTaskTarget) return;
    try {
      await deleteTaskMutation.mutateAsync(deleteTaskTarget._id);
      toast.success('Task permanently deleted');
      setDeleteTaskTarget(null);
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const hasActiveFilters = searchQuery || statusFilter || priorityFilter || (user?.role !== 'employee' && assigneeFilter);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    if (user?.role !== 'employee') {
      setAssigneeFilter('');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        subtitle="Manage, assign, and track workplace tasks"
        actions={
          canManageTasks && (
            <Button size="sm" onClick={() => { setEditingTask(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Task
            </Button>
          )
        }
      />

      {/* Filter Section */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Assignee Filter (Admin/HR Only) */}
        {user?.role !== 'employee' && (
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm max-w-[200px] truncate focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4 mr-1.5" /> Clear Filters
          </Button>
        )}
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No matching tasks found" : "No tasks assigned"}
          description={
            hasActiveFilters
              ? "Try adjusting or clearing your filters to see more tasks."
              : canManageTasks
              ? "Create a task to get started."
              : "No tasks have been assigned to you yet."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((task) => {
            const StatusIcon = STATUS_ICONS[task.status];
            const isTaskUpdating = statusUpdatingId === task._id;
            const assignee = typeof task.assignedTo === 'object' ? task.assignedTo as IEmployee : null;

            return (
              <div
                key={task._id}
                className="bg-card border border-border hover:border-primary/30 transition-all rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Status Toggle Button in main view */}
                  <button
                    onClick={() => handleCycleStatus(task)}
                    disabled={isTaskUpdating}
                    className={cn(
                      'mt-1 shrink-0 p-1 rounded-full hover:bg-muted/80 transition-all hover:scale-105 border',
                      STATUS_STYLES[task.status]
                    )}
                    title={`Current: ${STATUS_LABELS[task.status]} — click to cycle`}
                  >
                    {isTaskUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <StatusIcon className="h-4.5 w-4.5" />
                    )}
                  </button>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3
                        className={cn(
                          'text-sm font-semibold truncate',
                          task.status === 'done' && 'line-through text-muted-foreground'
                        )}
                      >
                        {task.title}
                      </h3>
                      <Badge variant="outline" className={cn('text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border', PRIORITY_STYLES[task.priority])}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', STATUS_STYLES[task.status])}>
                        {STATUS_LABELS[task.status]}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 max-w-2xl">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1">
                      {/* Assignee info */}
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {assignee ? (
                          <span className="font-medium text-foreground flex items-center gap-1">
                            {assignee.profileImage ? (
                              <img src={assignee.profileImage} alt="" className="h-4 w-4 rounded-full object-cover" />
                            ) : (
                              <span className="h-4 w-4 rounded-full bg-primary/10 text-[8px] font-bold text-primary flex items-center justify-center">
                                {getInitials(assignee.name)}
                              </span>
                            )}
                            {assignee.name}
                          </span>
                        ) : (
                          <span className="italic text-muted-foreground">Unassigned</span>
                        )}
                      </div>

                      {/* Due date */}
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Due: {formatDate(task.dueDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => handleCycleStatus(task)}>
                        <Play className="h-3.5 w-3.5 mr-2" /> Cycle Status
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleSetSpecificStatus(task, 'todo')} disabled={task.status === 'todo'}>
                        <Circle className="h-3.5 w-3.5 mr-2" /> Set To Do
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSetSpecificStatus(task, 'in_progress')} disabled={task.status === 'in_progress'}>
                        <Clock className="h-3.5 w-3.5 mr-2" /> Set In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSetSpecificStatus(task, 'done')} disabled={task.status === 'done'}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Set Done
                      </DropdownMenuItem>

                      {canManageTasks && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingTask(task);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Task
                          </DropdownMenuItem>
                        </>
                      )}
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteTaskTarget(task)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Task
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Creation/Editing Dialog */}
      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
        defaultAssignedTo={user?.role === 'employee' ? user.id : null}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteTaskTarget} onOpenChange={(open) => !open && setDeleteTaskTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete &ldquo;{deleteTaskTarget?.title}&rdquo;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteTaskMutation.isPending}
            >
              {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
