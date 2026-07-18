import { Request, Response } from 'express';
import { Employee } from '../models/Employee';
import { comparePassword } from '../lib/bcrypt';
import { signToken } from '../lib/jwt';
import { loginSchema } from '../validation/employee.schema';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 8 * 60 * 60 * 1000, // 8 hours
  path: '/',
};

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Validation failed', errors: parsed.error.errors });
    return;
  }

  const { email, password } = parsed.data;

  // Always fetch with password
  const employee = await Employee.findOne({ email }).select('+password');
  // Use the same message for wrong email OR wrong password (prevent enumeration)
  if (!employee) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }

  const valid = await comparePassword(password, employee.password);
  if (!valid) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }

  const token = signToken({
    id: employee._id.toString(),
    email: employee.email,
    role: employee.role,
    name: employee.name,
  });

  res.cookie('token', token, COOKIE_OPTS).json({
    success: true,
    data: {
      id: employee._id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      profileImage: employee.profileImage,
      department: employee.department,
      designation: employee.designation,
    },
  });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('token', COOKIE_OPTS).json({ success: true, data: { message: 'Logged out' } });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const employee = await Employee.findById(req.user!.id).select(
    '-password -isDeleted -deletedAt'
  );

  if (!employee) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  res.json({ success: true, data: employee });
}
