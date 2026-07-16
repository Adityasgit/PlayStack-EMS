'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEmployee } from '@/hooks/useEmployees';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function EditEmployeePage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = useEmployee(id);

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  if (!data?.data) return <div className="text-center py-16 text-muted-foreground">Employee not found</div>;

  return (
    <div>
      <PageHeader title="Edit Employee" subtitle={`Editing ${data.data.name}`} />
      <EmployeeForm mode="edit" employee={data.data} />
    </div>
  );
}
