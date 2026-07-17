import { Request, Response } from 'express';
import { Employee } from '../models/Employee';
import { Task } from '../models/Task';
import { buildOrgTree } from '../lib/treeBuilder';

export async function getOrgTree(req: Request, res: Response): Promise<void> {
  const employees = await Employee.find({})
    .select('name designation department role profileImage reportingManager employeeId status')
    .sort({ name: 1 });

  // Get active (non-completed) tasks for all employees
  const activeTasks = await Task.find({ status: { $ne: 'done' } })
    .select('title description priority status dueDate assignedTo');

  const unassignedTasks: any[] = [];
  const taskMap = new Map<string, any[]>();
  for (const task of activeTasks) {
    if (task.assignedTo) {
      const key = task.assignedTo.toString();
      if (!taskMap.has(key)) {
        taskMap.set(key, []);
      }
      taskMap.get(key)!.push(task.toObject());
    } else {
      unassignedTasks.push(task.toObject());
    }
  }

  const employeesWithCounts = employees.map((emp) => {
    const obj = emp.toObject();
    const empTasks = taskMap.get(emp._id.toString()) || [];
    return {
      ...obj,
      tasks: empTasks,
      taskCount: empTasks.length,
    };
  });

  const tree = buildOrgTree(employeesWithCounts as any);
  res.json({
    success: true,
    data: {
      tree,
      unassignedTasks,
    },
  });
}
