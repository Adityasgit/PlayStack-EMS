import { z } from 'zod';
import { DEPARTMENTS, ROLES, STATUSES } from '../models/Employee';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createEmployeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()\/.]{7,20}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  department: z.enum(DEPARTMENTS, { required_error: 'Department is required' }),
  designation: z.string().min(2, 'Designation must be at least 2 characters').max(100),
  salary: z.number({ coerce: true }).min(0, 'Salary cannot be negative').optional(),
  joiningDate: z.string().or(z.date()),
  status: z.enum(STATUSES).default('active'),
  role: z.enum(ROLES).default('employee'),
  reportingManager: z.string().optional().nullable(),
  profileImage: z.string().url().optional().nullable().or(z.literal('')),
});

export const updateEmployeeSchema = createEmployeeSchema
  .omit({ password: true, email: true })
  .partial();

export const selfUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()\/.]{7,20}$/)
    .optional()
    .or(z.literal('')),
  profileImage: z.string().url().optional().nullable().or(z.literal('')),
});

export const assignManagerSchema = z.object({
  managerId: z.string().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type SelfUpdateInput = z.infer<typeof selfUpdateSchema>;
export type AssignManagerInput = z.infer<typeof assignManagerSchema>;
