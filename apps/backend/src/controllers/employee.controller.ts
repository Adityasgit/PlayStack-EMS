import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Employee, DEPARTMENTS } from '../models/Employee';
import { hashPassword } from '../lib/bcrypt';
import { wouldCreateCycle } from '../lib/treeBuilder';
import { logActivity } from '../lib/logger';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  selfUpdateSchema,
  assignManagerSchema,
} from '../validation/employee.schema';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function generateEmployeeId(): Promise<string> {
  const last = await Employee.findOne({}, { employeeId: 1 }).sort({ createdAt: -1 });
  if (!last) return 'EMP-1001';
  const num = parseInt(last.employeeId.replace('EMP-', ''), 10);
  return `EMP-${String((isNaN(num) ? 1000 : num) + 1).padStart(4, '0')}`;
}

function sanitizeEmployee(emp: any, callerRole: string) {
  const obj = typeof emp.toObject === 'function' ? emp.toObject() : { ...emp };
  if (callerRole === 'employee') {
    delete obj.salary;
  }
  delete obj.password;
  return obj;
}

// ── Controllers ───────────────────────────────────────────────────────────────

export async function listEmployees(req: Request, res: Response): Promise<void> {
  const {
    search,
    department,
    role,
    status,
    page = '1',
    limit = '20',
    sortBy = 'joiningDate',
    sortOrder = 'desc',
  } = req.query as Record<string, string>;

  const SORT_WHITELIST = ['name', 'joiningDate', 'createdAt', 'department', 'salary'];
  const safeSortBy = SORT_WHITELIST.includes(sortBy) ? sortBy : 'joiningDate';
  const safeSortOrder = sortOrder === 'asc' ? 1 : -1;

  // Build filter
  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (department && DEPARTMENTS.includes(department as (typeof DEPARTMENTS)[number])) {
    filter.department = department;
  }
  if (role && ['super_admin', 'hr_manager', 'employee'].includes(role)) {
    filter.role = role;
  }
  if (status && ['active', 'inactive'].includes(status)) {
    filter.status = status;
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .populate('reportingManager', 'name employeeId department')
      .sort({ [safeSortBy]: safeSortOrder })
      .skip(skip)
      .limit(limitNum)
      .select('-password'),
    Employee.countDocuments(filter),
  ]);

  const callerRole = req.user!.role;
  const data = employees.map((e) => sanitizeEmployee(e, callerRole));

  res.json({
    success: true,
    data,
    meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
}

export async function createEmployee(req: Request, res: Response): Promise<void> {
  const parsed = createEmployeeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Validation failed', errors: parsed.error.errors });
    return;
  }

  const { role: callerRole } = req.user!;
  const { role: newRole, ...rest } = parsed.data;

  // HR cannot create super_admin
  if (callerRole === 'hr_manager' && newRole === 'super_admin') {
    res.status(403).json({ success: false, error: 'HR Manager cannot assign Super Admin role' });
    return;
  }

  // Check duplicate email
  const existing = await Employee.findOne({ email: rest.email });
  if (existing) {
    res.status(409).json({ success: false, error: 'An employee with this email already exists' });
    return;
  }

  const employeeId = await generateEmployeeId();
  const passwordHash = await hashPassword(rest.password);

  const employee = await Employee.create({
    ...rest,
    role: newRole ?? 'employee',
    employeeId,
    password: passwordHash,
    joiningDate: rest.joiningDate ? new Date(rest.joiningDate as string) : new Date(),
  });

  const result: any = employee.toObject();
  delete result.password;
  logActivity('created employee', 'employee', employee._id.toString(), req.user!.id, { name: employee.name });
  res.status(201).json({ success: true, data: result });
}

export async function getEmployee(req: Request, res: Response): Promise<void> {
  const employee = await Employee.findById(req.params.id)
    .populate('reportingManager', 'name employeeId department designation profileImage')
    .select('-password');

  if (!employee) {
    res.status(404).json({ success: false, error: 'Employee not found' });
    return;
  }

  const data = sanitizeEmployee(employee.toObject(), req.user!.role);
  res.json({ success: true, data });
}

export async function updateEmployee(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { role: callerRole, id: callerId } = req.user!;

  const isOwn = callerId === id;

  // Employee can only update own record with limited fields
  if (callerRole === 'employee') {
    if (!isOwn) {
      res.status(403).json({ success: false, error: 'Employees can only edit their own profile' });
      return;
    }
    const parsed = selfUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Validation failed', errors: parsed.error.errors });
      return;
    }
    const updated = await Employee.findByIdAndUpdate(id, parsed.data, { new: true }).select('-password');
    return void res.json({ success: true, data: updated });
  }

  // HR/SA path
  const parsed = updateEmployeeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Validation failed', errors: parsed.error.errors });
    return;
  }

  const { role: newRole, reportingManager, ...rest } = parsed.data;

  // HR cannot set role to super_admin
  if (callerRole === 'hr_manager' && newRole === 'super_admin') {
    res.status(403).json({ success: false, error: 'HR Manager cannot assign Super Admin role' });
    return;
  }

  // Circular reporting check if manager is changing
  if (reportingManager) {
    const allEmps = await Employee.find({}, { _id: 1, reportingManager: 1 });
    const flat = allEmps.map((e) => ({
      _id: e._id.toString(),
      reportingManager: e.reportingManager?.toString() ?? null,
    }));
    if (wouldCreateCycle(flat, id, reportingManager)) {
      res.status(400).json({ success: false, error: 'Circular reporting not allowed' });
      return;
    }
  }

  const updated = await Employee.findByIdAndUpdate(
    id,
    { ...rest, ...(newRole && { role: newRole }), reportingManager: reportingManager ?? null },
    { new: true, runValidators: true }
  )
    .populate('reportingManager', 'name employeeId department')
    .select('-password');

  if (!updated) {
    res.status(404).json({ success: false, error: 'Employee not found' });
    return;
  }

  logActivity('updated employee', 'employee', id, req.user!.id, {});
  res.json({ success: true, data: updated });
}

export async function deleteEmployee(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  // Cannot delete self
  if (req.user!.id === id) {
    res.status(400).json({ success: false, error: 'You cannot delete your own account' });
    return;
  }

  const updated = await Employee.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

  if (!updated) {
    res.status(404).json({ success: false, error: 'Employee not found' });
    return;
  }

  logActivity('deleted employee', 'employee', id, req.user!.id, {});
  res.json({ success: true, data: { message: 'Employee deleted successfully' } });
}

export async function getReportees(req: Request, res: Response): Promise<void> {
  const reportees = await Employee.find({ reportingManager: req.params.id })
    .select('-password')
    .sort({ name: 1 });

  res.json({ success: true, data: reportees });
}

export async function assignManager(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const parsed = assignManagerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Validation failed', errors: parsed.error.errors });
    return;
  }

  const { managerId } = parsed.data;

  if (managerId) {
    // Validate manager exists
    const manager = await Employee.findById(managerId);
    if (!manager) {
      res.status(404).json({ success: false, error: 'Manager not found' });
      return;
    }

    // Circular check
    const allEmps = await Employee.find({}, { _id: 1, reportingManager: 1 });
    const flat = allEmps.map((e) => ({
      _id: e._id.toString(),
      reportingManager: e.reportingManager?.toString() ?? null,
    }));

    if (wouldCreateCycle(flat, id, managerId)) {
      res.status(400).json({ success: false, error: 'Circular reporting not allowed' });
      return;
    }
  }

  const updated = await Employee.findByIdAndUpdate(
    id,
    { reportingManager: managerId ? new mongoose.Types.ObjectId(managerId) : null },
    { new: true }
  )
    .populate('reportingManager', 'name employeeId department')
    .select('-password');

  if (!updated) {
    res.status(404).json({ success: false, error: 'Employee not found' });
    return;
  }

  res.json({ success: true, data: updated });
}
