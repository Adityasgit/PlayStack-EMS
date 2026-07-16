'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { DEPARTMENTS } from '@/types';

export function EmployeeFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const department = searchParams.get('department') || '';
  const status = searchParams.get('status') || '';
  const role = searchParams.get('role') || '';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const hasFilters = search || department || status || role;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          defaultValue={search}
          onChange={(e) => {
            const val = e.target.value;
            // Debounce via URL param update on blur or short delay
            setTimeout(() => updateParam('search', val), 300);
          }}
          className="pl-9 h-10"
        />
      </div>

      {/* Department */}
      <select
        value={department}
        onChange={(e) => updateParam('department', e.target.value)}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="">All Departments</option>
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Status */}
      <select
        value={status}
        onChange={(e) => updateParam('status', e.target.value)}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      {/* Role */}
      <select
        value={role}
        onChange={(e) => updateParam('role', e.target.value)}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="">All Roles</option>
        <option value="super_admin">Super Admin</option>
        <option value="hr_manager">HR Manager</option>
        <option value="employee">Employee</option>
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => router.push('/employees')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </button>
      )}
    </div>
  );
}
