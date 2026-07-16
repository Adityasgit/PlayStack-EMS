export type Role = 'super_admin' | 'hr_manager' | 'employee';
export type Status = 'active' | 'inactive';
export const DEPARTMENTS = [
  'Engineering',
  'HR',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Design',
  'Legal',
] as const;

export const ROLES = ['super_admin', 'hr_manager', 'employee'] as const;

export type Department =
  | 'Engineering'
  | 'HR'
  | 'Finance'
  | 'Marketing'
  | 'Sales'
  | 'Operations'
  | 'Design'
  | 'Legal';

export interface IEmployee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  department: Department;
  designation: string;
  salary?: number;
  joiningDate: string;
  status: Status;
  role: Role;
  reportingManager?: IEmployee | string | null;
  profileImage?: string | null;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  employeeId: string;
  profileImage?: string | null;
  department: string;
  designation: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
  error?: string;
  errors?: unknown[];
}

export interface OrgTreeNode {
  _id: string;
  name: string;
  designation: string;
  department: string;
  role: Role;
  profileImage?: string | null;
  reportingManager?: string | null;
  employeeId?: string;
  children: OrgTreeNode[];
}

export interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
  departments: number;
  byDepartment: { _id: string; count: number }[];
  byRole: { _id: string; count: number }[];
  joiningTrend: { _id: { month: number; year: number }; count: number }[];
  recentlyJoined: IEmployee[];
}
