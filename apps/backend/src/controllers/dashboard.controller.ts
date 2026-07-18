import { Request, Response } from 'express';
import { Employee } from '../models/Employee';
import { Task } from '../models/Task';

export async function getDashboardStats(_req: Request, res: Response): Promise<void> {
  const [empStats, taskStats] = await Promise.all([
    // Employee aggregation
    Employee.aggregate([
      { $match: { isDeleted: false } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [{ $match: { status: 'active' } }, { $count: 'count' }],
          inactive: [{ $match: { status: 'inactive' } }, { $count: 'count' }],
          byDepartment: [
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byRole: [{ $group: { _id: '$role', count: { $sum: 1 } } }],
          joiningTrend: [
            {
              $group: {
                _id: {
                  month: { $month: '$joiningDate' },
                  year: { $year: '$joiningDate' },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
          ],
          recentlyJoined: [
            { $sort: { joiningDate: -1 } },
            { $limit: 5 },
            {
              $project: {
                name: 1,
                employeeId: 1,
                department: 1,
                designation: 1,
                profileImage: 1,
                joiningDate: 1,
                status: 1,
              },
            },
          ],
        },
      },
    ]),
    // Task aggregation
    Task.aggregate([
      {
        $facet: {
          totalTasks: [{ $count: 'count' }],
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
          overdue: [
            { $match: { dueDate: { $lt: new Date() }, status: { $ne: 'done' } } },
            { $count: 'count' },
          ],
          completed: [
            { $match: { status: 'done' } },
            { $count: 'count' },
          ],
          dueThisWeek: [
            {
              $match: {
                dueDate: {
                  $gte: new Date(),
                  $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
                status: { $ne: 'done' },
              },
            },
            { $count: 'count' },
          ],
        },
      },
    ]),
  ]);

  const e = empStats[0];
  const t = taskStats[0];

  // Build a status map for easy lookup
  const taskByStatus: Record<string, number> = {};
  (t.byStatus || []).forEach((s: { _id: string; count: number }) => {
    taskByStatus[s._id] = s.count;
  });

  const taskByPriority: Record<string, number> = {};
  (t.byPriority || []).forEach((p: { _id: string; count: number }) => {
    taskByPriority[p._id] = p.count;
  });

  res.json({
    success: true,
    data: {
      // Employees
      total: e.total[0]?.count ?? 0,
      active: e.active[0]?.count ?? 0,
      inactive: e.inactive[0]?.count ?? 0,
      departments: e.byDepartment.length,
      byDepartment: e.byDepartment,
      byRole: e.byRole,
      joiningTrend: e.joiningTrend,
      recentlyJoined: e.recentlyJoined,
      // Tasks
      totalTasks: t.totalTasks[0]?.count ?? 0,
      tasksTodo: taskByStatus['todo'] ?? 0,
      tasksInProgress: taskByStatus['in_progress'] ?? 0,
      tasksDone: taskByStatus['done'] ?? 0,
      tasksOverdue: t.overdue[0]?.count ?? 0,
      tasksCompleted: t.completed[0]?.count ?? 0,
      tasksDueThisWeek: t.dueThisWeek[0]?.count ?? 0,
      tasksHighPriority: taskByPriority['high'] ?? 0,
    },
  });
}
