import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const DEPARTMENT_COLORS: Record<string, string> = {
  Engineering: '#8b5cf6',
  HR: '#f43f5e',
  Finance: '#22c55e',
  Marketing: '#f97316',
  Sales: '#3b82f6',
  Operations: '#06b6d4',
  Design: '#ec4899',
  Legal: '#6366f1',
};

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  hr_manager: 'HR Manager',
  employee: 'Employee',
};
