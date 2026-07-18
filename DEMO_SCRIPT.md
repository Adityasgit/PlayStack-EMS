# PlayStack EMS — 5-Minute Demo Script

> **Instructions:** Each section below is a screen segment. The narration text under each heading is what you read aloud (or use text-to-speech) while performing the actions shown in the bullets.

---

## SECTION 1 — Login & Authentication (0:00 – 0:40)

**On Screen:**
- App loads → animated gradient login page with PlayStack logo
- Type `admin@company.com` and `Admin@1234`
- Click "Sign In"
- Redirects to Dashboard

**Narration:**
> "This is PlayStack EMS, a full-stack Employee Management System built with Next.js, TypeScript, Tailwind CSS, and a Node.js and Express backend with MongoDB. Let's start by logging in as a Super Admin. The login uses JWT authentication with bcrypt password hashing. Upon successful login, the token is stored as an http-only cookie, and all subsequent API routes are protected by middleware that verifies the token on every request."

---

## SECTION 2 — Dashboard Overview (0:40 – 1:20)

**On Screen:**
- Stat cards: Total Employees, Active, Inactive, Departments
- Status filter Select dropdown — toggle between All, Active, Inactive
- Department pie chart and Joining Trend bar chart
- Recently Joined list with "See More" to expand
- Activity Feed with "See More" redirecting to Activity Logs

**Narration:**
> "The dashboard gives a real-time overview of the organization. We see total employees, active and inactive counts, and the number of departments — all fetched from a single aggregated API endpoint. The status filter lets you instantly narrow the recently joined list. Charts are powered by Recharts — a department distribution pie chart and a monthly joining trend bar chart. Both the recently joined section and the activity feed show a preview with a See More option to drill into the full data. This page is fully responsive and uses Framer Motion for staggered entrance animations."

---

## SECTION 3 — Employee Management & CRUD (1:20 – 2:20)

**On Screen:**
- Navigate to Employees page
- Show the table with columns: Name, Email, Department, Designation, Role, Status, Reporting Manager
- Use Search bar to find an employee by name
- Use Filter dropdowns — filter by Department, Role, Status
- Click "Add Employee" button → opens the Create Employee form
- Fill in: Name, Email, Password, Department, Designation, Salary, Phone, Role, Reporting Manager
- Submit → new employee appears in the table
- Click on an employee row → side sheet opens with full details
- Show the Edit and Delete buttons (Super Admin only)
- Show "Import CSV" button

**Narration:**
> "The Employees page is the core CRUD module. The table supports search by name and email, filtering by department, role, and status, plus sorting by joining date and name. Pagination is built in with configurable page sizes. Clicking Add Employee opens a validated form with Zod schema validation on both frontend and backend — email format, phone, salary, required fields are all enforced. The form includes fields for employee ID, name, email, phone, department, designation, salary, joining date, status, role, and reporting manager. After creation, the employee appears instantly. Clicking any row opens a side sheet with full details, edit, and soft-delete options. Super Admins can also import employees in bulk via CSV upload."

---

## SECTION 4 — Organizational Hierarchy (2:20 – 3:50) ★ FOCUS SECTION

**On Screen:**
- Navigate to Organization page
- Full org chart loads with React Flow — showing hierarchy tree with employee nodes and task nodes
- Zoom in/out, pan around the chart
- Click on an employee node → side panel opens showing:
  - Employee details (name, designation, department, status)
  - Direct Reports panel showing team members
  - Task count badge on each node
- Click the "+" button on a node → Task Assignment dialog opens
- Create a task directly from the org chart
- Drag an employee node and drop it onto another employee node → confirmation dialog appears → reassigns the reporting manager
- Click on an edge (connection line) between two employees → removes the reporting relationship
- Click "Add Member" button → dialog opens to add a new top-level organization member
- Show that drag-and-drop only works for Super Admins (role-based)
- Show the task node status cycling: click a task node status icon to cycle Todo → In Progress → Done

**Narration:**
> "The Organization module is the most advanced feature of this system. It uses React Flow with Dagre auto-layout to render the full organizational hierarchy as an interactive, zoomable tree. Each card represents an employee with their name, designation, department, role icon, and status indicator. Task nodes appear as smaller cards connected to their assigned employees with dashed lines.

> Clicking any employee node opens a detail panel showing their full profile and a Direct Reports view — listing all team members who report to them. This is fetched from a dedicated API endpoint that traverses the reporting manager relationships in the database.

> The real power is in the drag-and-drop interactions. As a Super Admin, you can drag any employee node onto another to reassign their reporting manager. A confirmation dialog appears to prevent accidental changes. The system also prevents circular reporting — if you try to make someone report to their own subordinate, the backend validation rejects it.

> You can also click any connection edge to break a reporting relationship entirely, which immediately updates the hierarchy.

> From any employee node, clicking the plus button opens a task assignment dialog, letting you create and assign tasks directly from the org chart view. Task nodes show their current status — todo, in progress, or done — and Super Admins can cycle the status by clicking the status icon.

> The Add Member button lets you create new top-level members directly from the org chart, with full role selection including Super Admin, HR Manager, and Employee roles.

> Every interaction here — drag reassignment, edge deletion, task creation — is backed by API calls with proper RBAC checks. An HR Manager can view and edit, but only a Super Admin can drag nodes or delete connections."

---

## SECTION 5 — Tasks Module (3:50 – 4:20)

**On Screen:**
- Navigate to Tasks page
- Show task list with status icons, priority badges, assignee, due date
- Filter by Status, Priority, and Assignee
- Click the status icon on a task to cycle: Todo → In Progress → Done
- Open the three-dot menu → Edit, Delete, Set specific status
- Create a new task from the Tasks page

**Narration:**
> "The Tasks module provides full task management with status tracking, priority levels, and assignee management. Tasks can be filtered by status, priority, and assignee. The status cycling feature lets you quickly progress a task through its lifecycle with a single click. Super Admins can edit and permanently delete tasks, while HR Managers can create and edit. Employees can only view and update tasks assigned to them. Tasks can also be created and assigned directly from the Organization chart, which we saw earlier."

---

## SECTION 6 — RBAC & Role Differences (4:20 – 4:40)

**On Screen:**
- Show the sidebar — point out which nav items are visible for Super Admin
- Briefly mention the different role capabilities

**Narration:**
> "Role-Based Access Control is enforced at both the frontend and backend levels. The sidebar navigation adapts based on your role — Activity Logs are only visible to Super Admins and HR Managers, while the Profile page is shown for regular Employees. On the backend, every API endpoint checks the user's role via JWT middleware. Super Admins have full CRUD access including delete and role assignment. HR Managers can create, edit, and view employees but cannot delete or assign Super Admin roles. Employees can only view and edit their own limited profile fields — name, phone, and profile image."

---

## SECTION 7 — Activity Logs & Closing (4:40 – 5:00)

**On Screen:**
- Navigate to Activity Logs page → show the timeline with audit trail
- Show profile page briefly

**Narration:**
> "The Activity Logs page provides a complete audit trail — every employee creation, update, deletion, task change, and manager reassignment is recorded with the user who performed it, the timestamp, and metadata. This is visible only to Super Admins and HR Managers. The Profile page allows employees to edit their own basic information. PlayStack EMS uses MongoDB with Mongoose, and follows clean separation between controllers, routes, models, and validation layers. Thank you."

---

## Summary of Key Features Demonstrated

| Feature | Time | Eval Criteria |
|---------|------|--------------|
| Login / JWT Auth | 0:00–0:40 | Authentication, Backend APIs |
| Dashboard | 0:40–1:20 | Frontend UI & UX, Dashboard Charts |
| Employee CRUD | 1:20–2:20 | CRUD, Validation, Search/Filter/Sort |
| **Org Hierarchy** | **2:20–3:50** | **Org Hierarchy, RBAC, Frontend UI** |
| Tasks | 3:50–4:20 | CRUD, RBAC |
| RBAC | 4:20–4:40 | Role-Based Access Control |
| Activity Logs / Close | 4:40–5:00 | Audit Trail |

## Pre-Demo Checklist

- [ ] Backend server running (`npm run dev` from root)
- [ ] MongoDB connected and seeded (`/seed` page or seed endpoint)
- [ ] Login credentials ready: `admin@company.com` / `Admin@1234`
- [ ] Browser window sized to 1280x800 for clean recording
- [ ] Org chart has at least 3 levels of hierarchy for good visual
- [ ] A few tasks exist with different statuses for the tasks demo
