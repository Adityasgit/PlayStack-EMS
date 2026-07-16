import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
    return;
  }

  req.user = payload;
  next();
}
