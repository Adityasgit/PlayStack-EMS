'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { useEmployees } from '@/hooks/useEmployees';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { EmployeeSheet } from '@/components/employees/EmployeeSheet';
import { KanbanCard } from './KanbanCard';
import type { IEmployee } from '@/types';

export function KanbanBoard() {
  const { data, isLoading } = useEmployees({ limit: '200' });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const employees = data?.data || [];
  const activeEmployees = employees.filter((e) => e.status === 'active');
  const inactiveEmployees = employees.filter((e) => e.status === 'inactive');

  const activeEmployee = employees.find((e) => e._id === activeId);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const empId = active.id as string;
    const newStatus = over.id as string;

    if (newStatus !== 'active' && newStatus !== 'inactive') return;

    const emp = employees.find((e) => e._id === empId);
    if (!emp || emp.status === newStatus) return;

    try {
      await api.put(`/api/employees/${empId}`, { status: newStatus });
      toast.success(`${emp.name} moved to ${newStatus}`);
      // Refetch will happen automatically via query invalidation
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  }, [employees]);

  const handleCardClick = useCallback((emp: IEmployee) => {
    setSelectedEmployee(emp);
    setSheetOpen(true);
  }, []);

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  if (!employees.length) {
    return <EmptyState title="No employees" description="Add employees to use the Kanban board." />;
  }

  return (
    <>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          <KanbanColumn
            id="active"
            title="Active"
            employees={activeEmployees}
            color="#22c55e"
            onCardClick={handleCardClick}
          />
          <KanbanColumn
            id="inactive"
            title="Inactive"
            employees={inactiveEmployees}
            color="#f43f5e"
            onCardClick={handleCardClick}
          />
        </div>

        <DragOverlay>
          {activeEmployee && (
            <div className="w-[284px]">
              <KanbanCard employee={activeEmployee} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedEmployee && (
        <EmployeeSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          employee={selectedEmployee}
        />
      )}
    </>
  );
}
