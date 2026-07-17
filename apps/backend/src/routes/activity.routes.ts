import { Router } from 'express';
import { getActivityLogs } from '../controllers/activity.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', authMiddleware, requireRole('super_admin', 'hr_manager'), getActivityLogs);

export default router;
