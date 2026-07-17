'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { OrgChart } from '@/components/organization/OrgChart';

export default function OrganizationPage() {
  return (
    <div>
      <PageHeader
        title="Organization"
        subtitle="Manage hierarchy, assign tasks, and track your team — all in one place"
      />
      <OrgChart />
    </div>
  );
}
