'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, total, limit, onPageChange, className }: PaginationProps) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-between mt-4', className)}>
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{from}</span> to{' '}
        <span className="font-medium">{to}</span> of{' '}
        <span className="font-medium">{total}</span> employees
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .map((p, idx, arr) => (
            <span key={p} className="flex items-center">
              {idx > 0 && arr[idx - 1] !== p - 1 && (
                <span className="px-1 text-muted-foreground">...</span>
              )}
              <button
                onClick={() => onPageChange(p)}
                className={cn(
                  'inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition-colors',
                  p === page
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border hover:bg-muted',
                )}
              >
                {p}
              </button>
            </span>
          ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
