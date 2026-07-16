'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { OrgTreeNode, ApiResponse } from '@/types';

export function useOrgTree() {
  return useQuery({
    queryKey: ['org-tree'],
    queryFn: () => api.get<ApiResponse<OrgTreeNode[]>>('/api/organization/tree'),
  });
}
