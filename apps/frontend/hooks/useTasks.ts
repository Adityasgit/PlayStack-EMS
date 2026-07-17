'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ITask, ApiResponse } from '@/types';

// ── Query key factory ─────────────────────────────────────────────────────────

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: Record<string, string>) => [...taskKeys.lists(), filters] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useTasks(filters: Record<string, string> = {}) {
  const params = new URLSearchParams(filters).toString();
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => api.get<ApiResponse<ITask[]>>(`/api/tasks?${params}`),
  });
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: taskKeys.detail(id ?? ''),
    queryFn: () => api.get<ApiResponse<ITask>>(`/api/tasks/${id}`),
    enabled: !!id,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<ApiResponse<ITask>>('/api/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useUpdateTask(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.put<ApiResponse<ITask>>(`/api/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
