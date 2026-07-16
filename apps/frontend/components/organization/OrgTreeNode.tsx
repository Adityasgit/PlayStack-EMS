'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { getInitials, cn } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/utils';
import { Crown, Shield, User } from 'lucide-react';

interface OrgNodeData {
  label: string;
  designation: string;
  department: string;
  role: string;
  profileImage?: string | null;
  selected?: boolean;
  [key: string]: unknown;
}

const ROLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  super_admin: Crown,
  hr_manager: Shield,
  employee: User,
};

export const OrgTreeNode = memo(function OrgTreeNode({ data, selected }: NodeProps) {
  const d = data as unknown as OrgNodeData;
  const RoleIcon = ROLE_ICONS[d.role] || User;

  return (
    <div className={cn(
      'relative bg-card border rounded-xl px-4 py-3 shadow-sm transition-all w-[200px]',
      selected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md',
    )}>
      <Handle type="target" position={Position.Top} className="!bg-primary !w-2 !h-2" />
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary overflow-hidden">
          {d.profileImage ? (
            <img src={d.profileImage} alt="" className="h-full w-full object-cover" />
          ) : (
            getInitials(d.label)
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{d.label}</p>
          <p className="text-xs text-muted-foreground truncate">{d.designation}</p>
        </div>
        <RoleIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{d.department}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-2 !h-2" />
    </div>
  );
});
