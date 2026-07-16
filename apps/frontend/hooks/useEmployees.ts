'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { IEmployee, ApiResponse, DashboardStats } from '@/types';

// ── Query key factory ─────────────────────────────────────────────────────────

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters: Record<string, string>) => [...employeeKeys.lists(), filters] as const,
  detail: (id: string) => [...employeeKeys.all, 'detail', id] as const,
  reportees: (id: string) => [...employeeKeys.all, 'reportees', id] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useEmployees(filters: Record<string, string> = {}) {
  const params = new URLSearchParams(filters).toString();
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => api.get<ApiResponse<IEmployee[]>>(`/api/employees?${params}`),
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: employeeKeys.detail(id ?? ''),
    queryFn: () => api.get<ApiResponse<IEmployee>>(`/api/employees/${id}`),
    enabled: !!id,
  });
}

export function useReportees(id: string | undefined) {
  return useQuery({
    queryKey: employeeKeys.reportees(id ?? ''),
    queryFn: () => api.get<ApiResponse<IEmployee[]>>(`/api/employees/${id}/reportees`),
    enabled: !!id,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post<ApiResponse<IEmployee>>('/api/employees', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.put<ApiResponse<IEmployee>>(`/api/employees/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

export function useAssignManager(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { managerId: string | null }) =>
      api.patch<ApiResponse<IEmployee>>(`/api/employees/${id}/manager`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.get<ApiResponse<DashboardStats>>('/api/dashboard/stats'),
  });
}
