'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEmployees } from '@/hooks/useEmployees';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { EmployeeFilters } from '@/components/employees/EmployeeFilters';
import { EmployeeSheet } from '@/components/employees/EmployeeSheet';
import { ImportCSVDialog } from '@/components/employees/ImportCSVDialog';
import { Pagination } from '@/components/shared/Pagination';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import type { IEmployee } from '@/types';

export default function EmployeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const isAdmin = user?.role === 'super_admin';
  const isHR = user?.role === 'hr_manager';

  const filters: Record<string, string> = {};
  searchParams.forEach((v, k) => { filters[k] = v; });

  const { data, isLoading } = useEmployees(filters);
  const employees = data?.data || [];
  const meta = data?.meta;

  const handleView = (emp: IEmployee) => {
    setSelectedEmployee(emp);
    setSheetOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${meta?.total ?? 0} total employees`}
        actions={
          <div className="flex gap-2">
            {(isAdmin) && (
              <>
                <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" /> Import CSV
                </Button>
                <Button size="sm" onClick={() => router.push('/employees/new')}>
                  <Plus className="h-4 w-4 mr-2" /> Add Employee
                </Button>
              </>
            )}
          </div>
        }
      />

      <EmployeeFilters />
      <EmployeeTable
        employees={employees}
        isLoading={isLoading}
        onViewEmployee={handleView}
        meta={meta}
      />

      {meta && meta.totalPages > 1 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={(p) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', String(p));
            router.push(`?${params.toString()}`);
          }}
        />
      )}

      {selectedEmployee && (
        <EmployeeSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          employee={selectedEmployee}
        />
      )}

      {isAdmin && (
        <ImportCSVDialog open={importOpen} onOpenChange={setImportOpen} />
      )}
    </div>
  );
}
