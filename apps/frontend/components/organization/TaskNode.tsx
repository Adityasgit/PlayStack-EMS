'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { Calendar, Circle, Clock, CheckCircle2 } from 'lucide-react';
import type { TaskStatus, TaskPriority } from '@/types';

interface TaskNodeData {
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  taskId: string;
  onCycleTaskStatus?: (taskId: string, currentStatus: TaskStatus) => void;
  [key: string]: unknown;
}

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  low: 'border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400',
  medium: 'border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400',
  high: 'border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400',
};

const STATUS_ICONS: Record<TaskStatus, React.ComponentType<{ className?: string }>> = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export const TaskNode = memo(function TaskNode({ data }: NodeProps) {
  const d = data as unknown as TaskNodeData;
  const StatusIcon = STATUS_ICONS[d.status] || Circle;

  return (
    <div
      className={cn(
        'relative bg-card border border-dashed rounded-lg p-3 shadow-xs w-[180px]',
        PRIORITY_CLASSES[d.priority],
        d.status === 'done' && 'opacity-60'
      )}
    >
      {/* Target input handle (at Top) */}
      <Handle type="target" position={Position.Top} className="!bg-violet-500 !w-1.5 !h-1.5" />

      {/* Header Label */}
      <div className="text-[8px] font-bold uppercase tracking-wider text-violet-500/70 mb-2 pb-1 border-b border-border/30 select-none flex items-center justify-between">
        <span>Task</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (typeof d.onCycleTaskStatus === 'function') {
              d.onCycleTaskStatus(d.taskId, d.status);
            }
          }}
          className="p-0.5 rounded hover:bg-violet-500/10 text-violet-500/80 hover:text-violet-600 transition-all hover:scale-110"
          title={`Click to Cycle Status: ${STATUS_LABELS[d.status]}`}
        >
          <StatusIcon className="h-3 w-3 shrink-0" />
        </button>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-1">
          <p className={cn('text-xs font-semibold line-clamp-2 text-foreground flex-1', d.status === 'done' && 'line-through')}>
            {d.title}
          </p>
        </div>

        {d.description && (
          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
            {d.description}
          </p>
        )}

        <div className="flex items-center justify-between text-[8px] text-muted-foreground pt-1 border-t border-border/30">
          <span className="capitalize font-semibold">{d.priority}</span>
          {d.dueDate && (
            <span className="flex items-center gap-0.5">
              <Calendar className="h-2 w-2" />
              {new Date(d.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
