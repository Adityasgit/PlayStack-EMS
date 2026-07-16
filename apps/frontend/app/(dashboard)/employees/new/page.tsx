'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { EmployeeForm } from '@/components/employees/EmployeeForm';

export default function NewEmployeePage() {
  return (
    <div>
      <PageHeader title="Create Employee" subtitle="Add a new employee to your organization" />
      <EmployeeForm mode="create" />
    </div>
  );
}
