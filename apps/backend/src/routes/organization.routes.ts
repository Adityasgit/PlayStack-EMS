import { Router } from 'express';
import { getOrgTree } from '../controllers/organization.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/tree', authMiddleware, getOrgTree);

export default router;
