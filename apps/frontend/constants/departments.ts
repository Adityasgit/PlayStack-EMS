import { Department } from '@/types';

export const DEPARTMENTS: { value: Department; label: string; color: string }[] = [
  { value: 'Engineering', label: 'Engineering', color: '#8b5cf6' },
  { value: 'HR', label: 'Human Resources', color: '#f43f5e' },
  { value: 'Finance', label: 'Finance', color: '#22c55e' },
  { value: 'Marketing', label: 'Marketing', color: '#f97316' },
  { value: 'Sales', label: 'Sales', color: '#3b82f6' },
  { value: 'Operations', label: 'Operations', color: '#06b6d4' },
  { value: 'Design', label: 'Design', color: '#ec4899' },
  { value: 'Legal', label: 'Legal', color: '#6366f1' },
];

export const DEPARTMENT_MAP = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.value, d])
);
