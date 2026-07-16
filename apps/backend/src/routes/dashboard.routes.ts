import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/stats', authMiddleware, requireRole('super_admin', 'hr_manager'), getDashboardStats);

export default router;
