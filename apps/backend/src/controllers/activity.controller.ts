import { Request, Response } from 'express';
import { ActivityLog } from '../models/ActivityLog';

export async function getActivityLogs(_req: Request, res: Response): Promise<void> {
  const logs = await ActivityLog.find()
    .populate('performedBy', 'name profileImage employeeId')
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ success: true, data: logs });
}
