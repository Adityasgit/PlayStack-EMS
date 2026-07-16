import { Request, Response } from 'express';
import { Employee } from '../models/Employee';

export async function getDashboardStats(_req: Request, res: Response): Promise<void> {
  const stats = await Employee.aggregate([
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
  ]);

  const result = stats[0];

  res.json({
    success: true,
    data: {
      total: result.total[0]?.count ?? 0,
      active: result.active[0]?.count ?? 0,
      inactive: result.inactive[0]?.count ?? 0,
      departments: result.byDepartment.length,
      byDepartment: result.byDepartment,
      byRole: result.byRole,
      joiningTrend: result.joiningTrend,
      recentlyJoined: result.recentlyJoined,
    },
  });
}
