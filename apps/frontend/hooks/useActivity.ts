'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { IActivityLog, ApiResponse } from '@/types';

export function useActivityLogs() {
  return useQuery({
    queryKey: ['activity', 'logs'],
    queryFn: () => api.get<ApiResponse<IActivityLog[]>>('/api/activity'),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // auto-refetch every 60s
  });
}
