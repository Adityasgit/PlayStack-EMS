import { Request, Response } from 'express';
import Papa from 'papaparse';
import { Employee } from '../models/Employee';
import { hashPassword } from '../lib/bcrypt';
import { createEmployeeSchema } from '../validation/employee.schema';

export async function importEmployees(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ success: false, error: 'No CSV file uploaded' });
    return;
  }

  const csvText = req.file.buffer.toString('utf-8');

  const { data: rows, errors: parseErrors } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (parseErrors.length > 0) {
    res.status(400).json({ success: false, error: 'CSV parse error', errors: parseErrors });
    return;
  }

  const importErrors: { row: number; errors: unknown[] }[] = [];
  const validDocs: Record<string, unknown>[] = [];

  // Generate starting ID
  const last = await Employee.findOne({}, { employeeId: 1 }).sort({ createdAt: -1 });
  let counter = last ? parseInt(last.employeeId.replace('EMP-', ''), 10) + 1 : 1001;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] as Record<string, unknown>;
    const parsed = createEmployeeSchema.safeParse(row);
    if (!parsed.success) {
      importErrors.push({ row: i + 2, errors: parsed.error.errors });
      continue;
    }

    // Check for duplicate email (in batch too)
    const existing = await Employee.findOne({ email: parsed.data.email });
    if (existing) {
      importErrors.push({ row: i + 2, errors: [{ message: `Email ${parsed.data.email} already exists` }] });
      continue;
    }

    const passwordHash = await hashPassword(parsed.data.password);
    validDocs.push({
      ...parsed.data,
      employeeId: `EMP-${String(counter++).padStart(4, '0')}`,
      password: passwordHash,
      joiningDate: parsed.data.joiningDate ? new Date(parsed.data.joiningDate as string) : new Date(),
    });
  }

  let imported = 0;
  if (validDocs.length > 0) {
    await Employee.insertMany(validDocs);
    imported = validDocs.length;
  }

  res.json({
    success: true,
    data: { imported, failed: importErrors.length, errors: importErrors },
  });
}
