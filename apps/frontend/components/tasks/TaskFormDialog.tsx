'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEmployees } from '@/hooks/useEmployees';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IEmployee, ITask } from '@/types';

const taskSchema = z.object({
  title: z.string().min(2, 'Title required'),
  description: z.string().optional(),
  assignedTo: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in_progress', 'done']),
  dueDate: z.string().optional().nullable(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ITask | null;
  defaultAssignedTo?: string | null;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  defaultAssignedTo,
}: TaskFormDialogProps) {
  const isEdit = !!task;
  const { data: empData } = useEmployees({ limit: '200' });
  const employees = (empData?.data || []) as IEmployee[];
  const createTask = useCreateTask();
  const updateTask = useUpdateTask(task?._id ?? '');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      assignedTo: defaultAssignedTo ?? null,
      priority: 'medium',
      status: 'todo',
      dueDate: null,
    },
  });

  useEffect(() => {
    if (open) {
      if (task) {
        reset({
          title: task.title,
          description: task.description ?? '',
          assignedTo: typeof task.assignedTo === 'object' && task.assignedTo
            ? (task.assignedTo as IEmployee)._id
            : (task.assignedTo as string | null) ?? null,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate ? task.dueDate.slice(0, 10) : null,
        });
      } else {
        reset({
          title: '',
          description: '',
          assignedTo: defaultAssignedTo ?? null,
          priority: 'medium',
          status: 'todo',
          dueDate: null,
        });
      }
    }
  }, [task, reset, defaultAssignedTo, open]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      if (isEdit) {
        await updateTask.mutateAsync(data as Record<string, unknown>);
        toast.success('Task updated');
      } else {
        await createTask.mutateAsync(data as Record<string, unknown>);
        toast.success('Task created');
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input placeholder="Task title" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Optional description..."
              {...register('description')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={watch('priority')} onValueChange={(v) => setValue('priority', v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={watch('status')} onValueChange={(v) => setValue('status', v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Assign To</Label>
              <Select
                value={watch('assignedTo') ?? 'unassigned'}
                onValueChange={(v) => setValue('assignedTo', v === 'unassigned' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp._id} value={emp._id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input type="date" {...register('dueDate')} />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
