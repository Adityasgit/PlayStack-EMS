'use client';

import { cn } from '@/lib/utils';
import type { Status } from '@/types';

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        status === 'active' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        status === 'inactive' && 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'active' && 'bg-emerald-500',
          status === 'inactive' && 'bg-rose-500',
        )}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
