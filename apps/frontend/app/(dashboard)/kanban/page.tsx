'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';

export default function KanbanPage() {
  return (
    <div>
      <PageHeader
        title="Kanban Board"
        subtitle="Drag employees between columns to update their status"
      />
      <KanbanBoard />
    </div>
  );
}
