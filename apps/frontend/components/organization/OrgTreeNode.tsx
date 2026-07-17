'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useAuth } from '@/context/AuthContext';
import { getInitials, cn } from '@/lib/utils';
import { Crown, Shield, User, Plus } from 'lucide-react';

interface OrgNodeData {
  label: string;
  designation: string;
  department: string;
  role: string;
  status: string;
  profileImage?: string | null;
  selected?: boolean;
  taskCount?: number;
  [key: string]: unknown;
}

const ROLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  super_admin: Crown,
  hr_manager: Shield,
  employee: User,
};

export const OrgTreeNode = memo(function OrgTreeNode({ data, selected }: NodeProps) {
  const d = data as unknown as OrgNodeData;
  const { user } = useAuth();
  const RoleIcon = ROLE_ICONS[d.role] || User;
  const isActive = d.status === 'active';
  const canAssign = user?.role === 'super_admin' || user?.role === 'hr_manager';

  return (
    <div className={cn(
      'relative bg-card border rounded-xl px-4 py-3 shadow-sm transition-all w-[240px]',
      selected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md',
      !isActive && 'opacity-70',
    )}>
      <Handle type="target" position={Position.Top} className="!bg-primary !w-2 !h-2" />

      {/* Header Label */}
      <div className="text-[8px] font-bold uppercase tracking-wider text-primary mb-2 pb-1 border-b border-border/30 select-none">
        Member
      </div>

      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary overflow-hidden">
            {d.profileImage ? (
              <img src={d.profileImage} alt="" className="h-full w-full object-cover" />
            ) : (
              getInitials(d.label)
            )}
          </div>
          {/* Status dot */}
          <span className={cn(
            'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-card',
            isActive ? 'bg-emerald-500' : 'bg-gray-400',
          )} />
        </div>

        {/* Name + designation */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{d.label}</p>
          <p className="text-xs text-muted-foreground truncate">{d.designation}</p>
        </div>

        {/* Role & Assign actions */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <RoleIcon className="h-3.5 w-3.5 text-muted-foreground" />
          {canAssign && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (typeof d.onAssignTask === 'function') {
                  (d.onAssignTask as any)(d.employeeId);
                }
              }}
              className="p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all hover:scale-110"
              title="Assign Task"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Footer row: department + task count */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground truncate max-w-[140px]">
          {d.department}
        </span>
        {typeof d.taskCount === 'number' && d.taskCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {d.taskCount} task{d.taskCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-2 !h-2" />
    </div>
  );
});
