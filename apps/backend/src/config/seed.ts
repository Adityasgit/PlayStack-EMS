import { Employee } from '../models/Employee';
import { hashPassword } from '../lib/bcrypt';

export async function seedSuperAdmin(): Promise<void> {
  try {
    const existing = await Employee.findOne({ role: 'super_admin' });
    if (existing) return;

    const email = process.env.SEED_ADMIN_EMAIL || 'admin@company.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@1234';

    await Employee.create({
      employeeId: 'EMP-1000',
      name: 'Super Admin',
      email,
      password: await hashPassword(password),
      department: 'HR',
      designation: 'System Administrator',
      salary: 0,
      joiningDate: new Date(),
      status: 'active',
      role: 'super_admin',
    });

    console.log(`🌱 Seeded Super Admin: ${email} / ${password}`);
  } catch (err) {
    console.error('Seed error:', err);
  }
}
