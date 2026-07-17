import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Task } from '../models/Task';
import { logActivity } from '../lib/logger';

// ── GET /api/tasks ─────────────────────────────────────────────────────────────
// Query params: assignedTo, status, priority
export async function getTasks(req: Request, res: Response): Promise<void> {
  const { assignedTo, status, priority } = req.query as Record<string, string | undefined>;

  const filter: Record<string, unknown> = {};
  if (assignedTo) filter.assignedTo = assignedTo;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'name email employeeId profileImage designation department')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: tasks });
}

// ── GET /api/tasks/:id ─────────────────────────────────────────────────────────
export async function getTask(req: Request, res: Response): Promise<void> {
  const task = await Task.findById(req.params.id).populate(
    'assignedTo',
    'name email employeeId profileImage designation department'
  );

  if (!task) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }

  res.json({ success: true, data: task });
}

// ── POST /api/tasks ────────────────────────────────────────────────────────────
export async function createTask(req: Request, res: Response): Promise<void> {
  const { title, description, assignedTo, priority, status, dueDate } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    res.status(400).json({ success: false, error: 'Title is required (min 2 characters)' });
    return;
  }

  const task = await Task.create({
    title: title.trim(),
    description: description?.trim() || null,
    assignedTo: assignedTo || null,
    priority: priority || 'medium',
    status: status || 'todo',
    dueDate: dueDate || null,
  });

  const populated = await task.populate(
    'assignedTo',
    'name email employeeId profileImage designation department'
  );

  logActivity('task_created', 'task', task._id.toString(), req.user!.id, {
    title: task.title,
    assignedTo: assignedTo || null,
  });

  res.status(201).json({ success: true, data: populated });
}

// ── PUT /api/tasks/:id ─────────────────────────────────────────────────────────
export async function updateTask(req: Request, res: Response): Promise<void> {
  const { title, description, assignedTo, priority, status, dueDate } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }

  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description?.trim() || null;
  if (assignedTo !== undefined)
    task.assignedTo = assignedTo
      ? (new mongoose.Types.ObjectId(assignedTo) as any)
      : null;
  if (priority !== undefined) task.priority = priority;
  if (status !== undefined) task.status = status;
  if (dueDate !== undefined) task.dueDate = dueDate || null;

  await task.save();

  const populated = await task.populate(
    'assignedTo',
    'name email employeeId profileImage designation department'
  );

  logActivity('task_updated', 'task', task._id.toString(), req.user!.id, {
    title: task.title,
    status: task.status,
  });

  res.json({ success: true, data: populated });
}

// ── DELETE /api/tasks/:id ──────────────────────────────────────────────────────
export async function deleteTask(req: Request, res: Response): Promise<void> {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }

  logActivity('task_deleted', 'task', req.params.id, req.user!.id, {
    title: task.title,
  });

  res.json({ success: true, data: null });
}
