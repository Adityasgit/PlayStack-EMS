'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getInitials, cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';
import type { IEmployee } from '@/types';
import { StatusBadge } from '@/components/employees/StatusBadge';

interface KanbanCardProps {
  employee: IEmployee;
  onClick: (emp: IEmployee) => void;
}

export function KanbanCard({ employee, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: employee._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-card border border-border rounded-xl p-3 cursor-grab active:cursor-grabbing',
        'hover:shadow-md transition-shadow',
        isDragging && 'shadow-2xl scale-105 opacity-90 ring-2 ring-primary z-50',
      )}
      onClick={() => onClick(employee)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
            {getInitials(employee.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{employee.name}</p>
            <p className="text-xs text-muted-foreground truncate">{employee.designation}</p>
          </div>
        </div>
        <button {...attributes} {...listeners} className="p-1 text-muted-foreground hover:text-foreground shrink-0">
          <GripVertical className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{employee.department}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary capitalize">{employee.role.replace('_', ' ')}</span>
      </div>
    </div>
  );
}
