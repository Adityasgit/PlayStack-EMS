import { Request, Response, NextFunction } from 'express';
import { Role } from '../models/Employee';

/**
 * Require caller to have one of the given roles (OR logic).
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role as Role)) {
      res.status(403).json({ success: false, error: 'Forbidden: insufficient permissions' });
      return;
    }
    next();
  };
}

/**
 * Allow super_admin and hr_manager to access any record,
 * but restrict employees to their own record only.
 */
export function requireSelfOrAdmin(req: Request, res: Response, next: NextFunction): void {
  const { role, id } = req.user!;
  if (role === 'super_admin' || role === 'hr_manager' || id === req.params.id) {
    next();
    return;
  }
  res.status(403).json({ success: false, error: 'Forbidden: you can only access your own profile' });
}
