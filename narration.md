# PlayStack EMS — Narration Script (Text-to-Speech Ready)

This is a clean, continuous narration script. Paste directly into any TTS model. Each paragraph maps to a screen segment — pause briefly between paragraphs.

---

This is PlayStack EMS, a full-stack Employee Management System built with Next.js, TypeScript, Tailwind CSS, and a Node.js and Express backend with MongoDB. Let's start by logging in as a Super Admin. The login uses JWT authentication with bcrypt password hashing. Upon successful login, the token is stored as an http-only cookie, and all subsequent API routes are protected by middleware that verifies the token on every request.

The dashboard gives a real-time overview of the organization. We see total employees, active and inactive counts, and the number of departments, all fetched from a single aggregated API endpoint. The status filter lets you instantly narrow the recently joined list. Charts are powered by Recharts, a department distribution pie chart and a monthly joining trend bar chart. Both the recently joined section and the activity feed show a preview with a See More option to drill into the full data. This page is fully responsive and uses Framer Motion for staggered entrance animations.

The Employees page is the core CRUD module. The table supports search by name and email, filtering by department, role, and status, plus sorting by joining date and name. Pagination is built in with configurable page sizes. Clicking Add Employee opens a validated form with Zod schema validation on both frontend and backend. Email format, phone, salary, and required fields are all enforced. The form includes fields for employee ID, name, email, phone, department, designation, salary, joining date, status, role, and reporting manager. After creation, the employee appears instantly. Clicking any row opens a side sheet with full details, edit, and soft-delete options. Super Admins can also import employees in bulk via CSV upload.

The Organization module is the most advanced feature of this system. It uses React Flow with Dagre auto-layout to render the full organizational hierarchy as an interactive, zoomable tree. Each card represents an employee with their name, designation, department, role icon, and status indicator. Task nodes appear as smaller cards connected to their assigned employees with dashed lines.

Clicking any employee node opens a detail panel showing their full profile and a Direct Reports view, listing all team members who report to them. This is fetched from a dedicated API endpoint that traverses the reporting manager relationships in the database.

The real power is in the drag-and-drop interactions. As a Super Admin, you can drag any employee node onto another to reassign their reporting manager. The system also prevents circular reporting. If you try to make someone report to their own subordinate, the backend validation rejects it.

You can also click any connection edge to break a reporting relationship entirely, which immediately updates the hierarchy.

From any employee node, clicking the plus button opens a task assignment dialog, letting you create and assign tasks directly from the org chart view. Task nodes show their current status: todo, in progress, or done. Super Admins can cycle the status by clicking the status icon.

The Add Member button lets you create new top-level members directly from the org chart, with full role selection including Super Admin, HR Manager, and Employee roles.

Every interaction here, drag reassignment, edge deletion, and task creation, is backed by API calls with proper RBAC checks. An HR Manager can view and edit, but only a Super Admin can drag nodes or delete connections.

The Tasks module provides full task management with status tracking, priority levels, and assignee management. Tasks can be filtered by status, priority, and assignee. The status cycling feature lets you quickly progress a task through its lifecycle with a single click. Super Admins can edit and permanently delete tasks, while HR Managers can create and edit. Employees can only view and update tasks assigned to them. Tasks can also be created and assigned directly from the Organization chart, which we saw earlier.

Role-Based Access Control is enforced at both the frontend and backend levels. The sidebar navigation adapts based on your role. Activity Logs are only visible to Super Admins and HR Managers, while the Profile page is shown for regular Employees. On the backend, every API endpoint checks the user's role via JWT middleware. Super Admins have full CRUD access including delete and role assignment. HR Managers can create, edit, and view employees but cannot delete or assign Super Admin roles. Employees can only view and edit their own limited profile fields, name, phone, and profile image.

The Activity Logs page provides a complete audit trail. Every employee creation, update, deletion, task change, and manager reassignment is recorded with the user who performed it, the timestamp, and metadata. This is visible only to Super Admins and HR Managers. The Profile page allows employees to edit their own basic information.

For deployment, the application is fully Dockerized with Dockerfiles for both the frontend and backend. The backend is configured as an Express server connected to MongoDB via Mongoose. Environment variables control database connection strings, JWT secrets, and port configuration. The codebase follows a clean monorepo structure with separate workspaces for frontend and backend, managed with npm workspaces and concurrently for local development. Controllers, routes, models, validation schemas, and middleware are all separated into dedicated directories following best practices for maintainability and scalability.

PlayStack EMS uses MongoDB with Mongoose, and follows clean separation between controllers, routes, models, and validation layers. Thank you.
