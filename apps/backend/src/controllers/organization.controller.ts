import { Request, Response } from 'express';
import { Employee } from '../models/Employee';
import { buildOrgTree } from '../lib/treeBuilder';

export async function getOrgTree(req: Request, res: Response): Promise<void> {
  const employees = await Employee.find({})
    .select('name designation department role profileImage reportingManager employeeId')
    .sort({ name: 1 });

  const tree = buildOrgTree(employees);
  res.json({ success: true, data: tree });
}
