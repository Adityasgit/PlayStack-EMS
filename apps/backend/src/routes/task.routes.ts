import { Router } from 'express';
import { createTask, deleteTask, getTask, getTasks, updateTask } from '../controllers/task.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

// GET  /api/tasks          — any authenticated user (employees see their own tasks via assignedTo filter)
router.get('/', getTasks);

// GET  /api/tasks/:id      — any authenticated user
router.get('/:id', getTask);

// POST /api/tasks          — SA or HR only
router.post('/', requireRole('super_admin', 'hr_manager'), createTask);

// PUT  /api/tasks/:id      — SA or HR only
router.put('/:id', requireRole('super_admin', 'hr_manager'), updateTask);

// DELETE /api/tasks/:id   — SA only
router.delete('/:id', requireRole('super_admin'), deleteTask);

export default router;
