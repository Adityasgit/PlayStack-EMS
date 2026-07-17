import { Employee } from '../models/Employee';
import { Task } from '../models/Task';
import { hashPassword } from '../lib/bcrypt';

/**
 * Seed the database with a Super Admin and sample employees/tasks.
 *
 * This function is **idempotent** — it checks for existing data before
 * inserting so it can safely be called on every server start.
 *
 * Set SEED_RESET=true to wipe and re-seed from scratch (dev only).
 */
export async function seedSuperAdmin(): Promise<void> {
  try {
    const shouldReset = process.env.SEED_RESET === 'true';

    // ── Optional: wipe everything for a clean slate (dev only) ─────────
    if (shouldReset) {
      await Task.deleteMany({});
      await Employee.deleteMany({});
      console.log('🧹 SEED_RESET=true — cleared all employees and tasks.');
    }

    // ── 1. Super Admin ────────────────────────────────────────────────
    let superAdmin = await Employee.findOne({ role: 'super_admin' });

    if (!superAdmin) {
      const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@company.com';
      const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@1234';

      superAdmin = await Employee.create({
        employeeId: 'EMP-1000',
        name: 'Super Admin',
        email: adminEmail,
        password: await hashPassword(adminPassword),
        department: 'HR',
        designation: 'System Administrator',
        salary: 150000,
        joiningDate: new Date(),
        status: 'active',
        role: 'super_admin',
      });
      console.log(`🌱 Seeded Super Admin: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log('ℹ️  Super Admin already exists — skipping.');
    }

    // ── 2. Dummy employees + tasks (only if the DB is nearly empty) ───
    const employeeCount = await Employee.countDocuments({});
    if (employeeCount > 1) {
      console.log(`ℹ️  ${employeeCount} employees found — skipping dummy seed.`);
      return;
    }

    const defaultPassword = await hashPassword('Password@1234');

    // HR Manager → reports to Super Admin
    const hrManager = await Employee.create({
      employeeId: 'EMP-1001',
      name: 'Sarah Jenkins',
      email: 'sarah@company.com',
      password: defaultPassword,
      department: 'HR',
      designation: 'HR Manager',
      salary: 95000,
      joiningDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      status: 'active',
      role: 'hr_manager',
      reportingManager: superAdmin._id,
    });

    // Engineering Manager → reports to Super Admin
    const engManager = await Employee.create({
      employeeId: 'EMP-1002',
      name: 'Alex Rivera',
      email: 'alex@company.com',
      password: defaultPassword,
      department: 'Engineering',
      designation: 'Engineering Manager',
      salary: 120000,
      joiningDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      status: 'active',
      role: 'hr_manager',
      reportingManager: superAdmin._id,
    });

    // Senior Engineer → reports to Engineering Manager
    const srEngineer = await Employee.create({
      employeeId: 'EMP-1003',
      name: 'David Chen',
      email: 'david@company.com',
      password: defaultPassword,
      department: 'Engineering',
      designation: 'Senior Software Engineer',
      salary: 105000,
      joiningDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      status: 'active',
      role: 'employee',
      reportingManager: engManager._id,
    });

    // Developer → reports to Senior Engineer
    const developer = await Employee.create({
      employeeId: 'EMP-1004',
      name: 'Maya Lin',
      email: 'maya@company.com',
      password: defaultPassword,
      department: 'Engineering',
      designation: 'Software Developer',
      salary: 75000,
      joiningDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      role: 'employee',
      reportingManager: srEngineer._id,
    });

    // HR Specialist → reports to HR Manager
    const hrSpecialist = await Employee.create({
      employeeId: 'EMP-1005',
      name: 'James Smith',
      email: 'james@company.com',
      password: defaultPassword,
      department: 'HR',
      designation: 'HR Specialist',
      salary: 60000,
      joiningDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      status: 'active',
      role: 'employee',
      reportingManager: hrManager._id,
    });

    console.log('🌱 Seeded 5 dummy employees.');

    // ── 3. Dummy tasks ────────────────────────────────────────────────
    await Task.create([
      {
        title: 'Review Q3 Hiring Budget',
        description: 'Collaborate with finance to sync Q3 budget allocation for hiring developers.',
        assignedTo: hrManager._id,
        priority: 'high',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Design Org Tree Expansion Layout',
        description: 'Work on expanding the ReactFlow schema to show connecting threads between tasks.',
        assignedTo: engManager._id,
        priority: 'high',
        status: 'todo',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Draft Onboarding Packet v2',
        description: 'Update the onboarding documents and welcome guide for new engineers joining next month.',
        assignedTo: hrSpecialist._id,
        priority: 'medium',
        status: 'todo',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Implement drag-and-drop reassignment',
        description: 'Build backend handlers to let users directly re-route employees or tasks.',
        assignedTo: srEngineer._id,
        priority: 'medium',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Verify UI Dialog animations',
        description: 'Confirm that all modals fade and scale elegantly without page layout shift.',
        assignedTo: developer._id,
        priority: 'low',
        status: 'done',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Clean up deprecated router hooks',
        description: 'Unassigned maintenance: clean up unused Next.js middleware matchers.',
        assignedTo: null,
        priority: 'low',
        status: 'todo',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Prepare onboarding server dashboard charts',
        description: 'Unassigned milestone: configure recharts variables for categorical dark/light colors.',
        assignedTo: null,
        priority: 'high',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log('🌱 Seeded 7 dummy tasks.');
    console.log('✅ Seed complete: 1 Super Admin + 5 employees + 7 tasks');
  } catch (err) {
    console.error('❌ Seed error:', err);
    // Re-throw so callers (db.ts, seed controller) can handle it properly
    throw err;
  }
}
