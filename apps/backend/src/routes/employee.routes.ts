import { Router } from 'express';
import {
  listEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getReportees,
  assignManager,
} from '../controllers/employee.controller';
import { importEmployees } from '../controllers/import.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole, requireSelfOrAdmin } from '../middleware/rbac';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authMiddleware, requireRole('super_admin', 'hr_manager'), listEmployees);
router.post('/', authMiddleware, requireRole('super_admin', 'hr_manager'), createEmployee);
router.post('/import', authMiddleware, requireRole('super_admin'), upload.single('file'), importEmployees);

router.get('/:id', authMiddleware, requireSelfOrAdmin, getEmployee);
router.put('/:id', authMiddleware, requireSelfOrAdmin, updateEmployee);
router.delete('/:id', authMiddleware, requireRole('super_admin'), deleteEmployee);
router.get('/:id/reportees', authMiddleware, getReportees);
router.patch('/:id/manager', authMiddleware, requireRole('super_admin'), assignManager);

export default router;
