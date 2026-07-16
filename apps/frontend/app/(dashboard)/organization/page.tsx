'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { OrgChart } from '@/components/organization/OrgChart';

export default function OrganizationPage() {
  return (
    <div>
      <PageHeader
        title="Organization"
        subtitle="Interactive org chart — drag nodes to reassign managers"
      />
      <OrgChart />
    </div>
  );
}
