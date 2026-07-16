'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';
import type { IEmployee } from '@/types';

interface KanbanColumnProps {
  id: string;
  title: string;
  employees: IEmployee[];
  color: string;
  onCardClick: (emp: IEmployee) => void;
}

export function KanbanColumn({ id, title, employees, color, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col min-w-[300px] w-[300px] bg-muted/30 rounded-2xl border border-border p-4 transition-all',
        isOver && 'ring-2 ring-primary/50 bg-primary/5',
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {employees.length}
        </span>
      </div>

      <SortableContext items={employees.map((e) => e._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 flex-1 min-h-[100px]">
          {employees.map((emp) => (
            <KanbanCard key={emp._id} employee={emp} onClick={onCardClick} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
