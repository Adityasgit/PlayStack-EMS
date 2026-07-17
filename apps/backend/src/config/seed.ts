import { Employee } from '../models/Employee';
import { Task } from '../models/Task';
import { hashPassword } from '../lib/bcrypt';

export async function seedSuperAdmin(): Promise<void> {
  try {
    // 1. Seed Super Admin
    let superAdmin = await Employee.findOne({ role: 'super_admin' });
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@company.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@1234';

    if (!superAdmin) {
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
    }

    // 2. Check if dummy data is already seeded
    const employeeCount = await Employee.countDocuments({});
    if (employeeCount > 1) {
      console.log('Database already has employee data. Skipping dummy seeding.');
      return;
    }

    const defaultPassword = await hashPassword('Password@1234');

    // 3. Seed HR Manager reporting to Super Admin
    const hrManager = await Employee.create({
      employeeId: 'EMP-1001',
      name: 'Sarah Jenkins',
      email: 'sarah@company.com',
      password: defaultPassword,
      department: 'HR',
      designation: 'HR Manager',
      salary: 95000,
      joiningDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      status: 'active',
      role: 'hr_manager',
      reportingManager: superAdmin._id,
    });

    // 4. Seed Engineering Manager reporting to Super Admin
    const engManager = await Employee.create({
      employeeId: 'EMP-1002',
      name: 'Alex Rivera',
      email: 'alex@company.com',
      password: defaultPassword,
      department: 'Engineering',
      designation: 'Engineering Manager',
      salary: 120000,
      joiningDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
      status: 'active',
      role: 'hr_manager', // Grant manager powers to manage employees
      reportingManager: superAdmin._id,
    });

    // 5. Seed Senior Engineer reporting to Engineering Manager
    const srEngineer = await Employee.create({
      employeeId: 'EMP-1003',
      name: 'David Chen',
      email: 'david@company.com',
      password: defaultPassword,
      department: 'Engineering',
      designation: 'Senior Software Engineer',
      salary: 105000,
      joiningDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
      status: 'active',
      role: 'employee',
      reportingManager: engManager._id,
    });

    // 6. Seed Developer reporting to Senior Engineer
    const developer = await Employee.create({
      employeeId: 'EMP-1004',
      name: 'Maya Lin',
      email: 'maya@company.com',
      password: defaultPassword,
      department: 'Engineering',
      designation: 'Software Developer',
      salary: 75000,
      joiningDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
      status: 'active',
      role: 'employee',
      reportingManager: srEngineer._id,
    });

    // 7. Seed HR Specialist reporting to HR Manager
    const hrSpecialist = await Employee.create({
      employeeId: 'EMP-1005',
      name: 'James Smith',
      email: 'james@company.com',
      password: defaultPassword,
      department: 'HR',
      designation: 'HR Specialist',
      salary: 60000,
      joiningDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      status: 'active',
      role: 'employee',
      reportingManager: hrManager._id,
    });

    console.log('🌱 Seeded 5 dummy employee data.');

    // 8. Seed Dummy Tasks
    await Task.create([
      {
        title: 'Review Q3 Hiring Budget',
        description: 'Collaborate with finance to sync Q3 budget allocation for hiring developers.',
        assignedTo: hrManager._id,
        priority: 'high',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
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
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
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
  } catch (err) {
    console.error('Seed error:', err);
  }
}
