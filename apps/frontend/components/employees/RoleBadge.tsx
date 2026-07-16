'use client';

import { cn } from '@/lib/utils';
import type { Role } from '@/types';
import { ROLE_LABELS } from '@/lib/utils';

const ROLE_COLORS: Record<Role, string> = {
  super_admin: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  hr_manager: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  employee: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', ROLE_COLORS[role])}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}
