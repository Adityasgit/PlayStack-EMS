'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { OrgTreeNode, ITask, ApiResponse } from '@/types';

export interface OrgTreeData {
  tree: OrgTreeNode[];
  unassignedTasks: ITask[];
}

export function useOrgTree() {
  return useQuery({
    queryKey: ['org-tree'],
    queryFn: () => api.get<ApiResponse<OrgTreeData>>('/api/organization/tree'),
  });
}
